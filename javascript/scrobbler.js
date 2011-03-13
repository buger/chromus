var _gaq = _gaq || [];

(function(window){
/**
    Class Scrobbler
**/

var Scrobbler = function(session_key, username){
    this._session_key = session_key;
    this._username = username;
    this.scrobbling = true;
}

Scrobbler.api_key = "170909e77e67705570080196aca5040b";
Scrobbler.secret = "516a97ba6f832d9184ae5b32c231a3af";

/**
    Scrobbler#getSession(token, callback)
**/
Scrobbler.prototype.getSession = function(token, callback){
    if (!token) {
        return false;
    }

    console.log("Getting session")

    var signature = MD5("api_key" + Scrobbler.api_key + "methodauth.getSessiontoken" + token + Scrobbler.secret);

    xhrRequest("http://ws.audioscrobbler.com/2.0/", "GET",
               "method=auth.getSession&api_key=" + Scrobbler.api_key + "&api_sig=" + signature + "&token=" + token, 
        function(xhr){
            console.log("Session info:", xhr.responseText)

            if(xhr.responseText.match(/error/)) {
                if(callback)
                    callback({error: xhr.responseText})
            } else {
                this._session_key = xhr.responseText.match(/<key>(.*)<\/key>/)[1]
                this._username = xhr.responseText.match(/<name>(.*)<\/name>/)[1]

                if(callback)
                    callback({username:this._username, session: this._session_key})
            }            
        }.bind(this)
    )
}

/**
    Scrobbler#setNowPlaying(artist, track, duration, callback)
**/
Scrobbler.prototype.setNowPlaying = function(artist, track, album, duration, callback){
    if(!this.scrobbling)
        return false

    _gaq.push(['_trackEvent', 'lastfm', 'setNowPlaying', artist+'-'+track]);

    if(!this._username)
        return 

    if(!callback)
        callback = function(){}
    
    this.callMethod("track.updateNowPlaying", 
                   {artist:artist, track:track, album:album, duration:parseInt(duration), sig_call:true, http_method:'POST'}, callback)
}


/**
    Scrobbler#scrobble(artist, track, duration, callback)
**/
Scrobbler.prototype.scrobble = function(artist, track, album, duration, callback){
    if(!this.scrobbling)
        return false
        
    if(!this._username)
        return false

    _gaq.push(['_trackEvent', 'lastfm', 'scrobble', artist+'-'+track]);

    if(!callback)
        callback = function(){}

    var now = new Date()
    var timestamp = parseInt(now.getTime()/1000.0)
    
    this.callMethod("Track.scrobble", 
                   {artist:artist, track:track, album:album, duration:parseInt(duration), timestamp: timestamp, sig_call:true, http_method:'POST'}, callback)
}




/**
    Scrobbler#callMethod(method, params, callback)
**/
Scrobbler.prototype.callMethod = function(method, params, callback){
    _gaq.push(['_trackEvent', 'lastfm', method]);

    var http_method = 'GET'
    if(params['http_method']){
        http_method = params['http_method']
        delete params['http_method']
    }

    params["method"] = method
    params["api_key"] = Scrobbler.api_key
    params["format"] = 'json'
    
    for(key in params)
        if(params[key] != undefined && typeof(params[key]) == 'string')
            params[key] = params[key].replace(/&amp;/g,'and')

    if (params['sig_call']) {
        delete params['sig_call']
        delete params['format']

        if (this._session_key) {
            params['sk'] = this._session_key
            
            var signature = [];
            
            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    signature.push(key+params[key]);
                }
            }

            signature.sort()

            console.log("Sig string:", signature.join('') + Scrobbler.secret);

            signature = MD5(signature.join('') + Scrobbler.secret);

            params['api_sig'] = signature
        }
    }

    var query_string = []
    for(key in params)
        if(params[key] != undefined)
            query_string.push(key+"="+encodeURIComponent(params[key]))

    query_string.sort()

    query_string = query_string.join('&')

    console.log("Calling method:", method)

    if(params['use_cache'] != false && CACHE.get(query_string)){
        console.info("Using CACHE")
        
        callback(CACHE.get(query_string))
        return
    }
    

    var server_url = "http://ws.audioscrobbler.com/2.0/"

    xhrRequest(server_url, http_method, query_string, function(xhr){
        if (xhr.responseXML && xhr.responseXML.documentElement) {
            var response = xhr.responseXML;
        } else {
            try{
                var response = JSON.parse(xhr.responseText)
            } catch(e) {
                var response = {error: 'Parsing error'}
            }
        }

        if(!xhr.responseXML && response.error || xhr.responseXML && xhr.responseText && xhr.status != 200){
            console.error("Error:", xhr.responseText, query_string, xhr)
        } else {
          //By default caching without expiration (if params['expire_time'] is undefined) 
          if(params['use_cache'] != false)
            CACHE.set(query_string, response, params['expire_time'])            

          callback(response)
        }
    })
}


/**
    Scrobbler#artistInfo(artist, callback)
**/
Scrobbler.prototype.artistInfo = function(artist, callback){
    this.callMethod("artist.getinfo", {artist: artist}, function(response){
        console.log("artist info response:", response);

        callback({
            image: response.artist.image[1]["#text"].replace(/serve\/([^\/]*)/,'serve/64s'),
            big_image: response.artist.image[1]["#text"].replace(/serve\/([^\/]*)/,'serve/252'),
            bio_summary: response.artist.bio.summary,
            bio: response.artist.bio.content,
            similar: response.artist.similar,
            tags: response.artist.tags,
            stats: response.artist.stats
        })
    })
}

Scrobbler.prototype.parseXSPFPlaylist = function(response){
    console.log("Tracklist: ", response)

    var tracks = response.playlist.trackList.track
    var result_tracks = []
    
    if(!(tracks instanceof Array))
        tracks = [tracks]
    
    for(var i=0; i<tracks.length; i++){
        result_tracks[i] = {}
        result_tracks[i].index = i            
        result_tracks[i].song  = tracks[i].title
        result_tracks[i].artist = tracks[i].creator
        result_tracks[i].info = {
            duration: parseInt(tracks[i].duration)/1000
        }

        if(tracks[i].album)
            result_tracks[i].album = tracks[i].album                            

        if(tracks[i].image)
            result_tracks[i].image = tracks[i].image

        if(tracks[i].location)
            result_tracks[i].url = tracks[i].location
    }

    return result_tracks
}

/**
    Scrobbler#fetchPlaylist(playlist_url, callback)
**/
Scrobbler.prototype.fetchPlaylist = function(playlist_url, callback){   
    if(callback == undefined)
        callback = function(){}

    this.callMethod("playlist.fetch", {playlistURL: playlist_url}, function(response){
        callback({tracks: this.parseXSPFPlaylist(response)})
    }.bind(this))
}


/**
    Scrobbler#albumPlaylist(artist, album, callback)
**/
Scrobbler.prototype.albumPlaylist = function(artist, album, callback){    
    var scrobbler = this

    this.callMethod("album.getInfo", {album: album, artist: artist}, function(response){        
        scrobbler.fetchPlaylist("lastfm://playlist/album/"+response.album.id, callback)
    })
}


/**
    Scrobbler#artistChart(artist, callback)
**/
Scrobbler.prototype.artistChart = function(artist, callback){    
    this.callMethod("artist.gettoptracks", {artist: artist}, function(response){
        var tracks = response.toptracks.track
        var result_tracks = []

        if(!(tracks instanceof Array))
            tracks = [tracks]

        for(var i=0; i<tracks.length; i++){
            result_tracks[i] = {}
            result_tracks[i].index = i
            result_tracks[i].song = tracks[i].name
            result_tracks[i].artist = artist
        }

        callback({tracks: result_tracks})
    })
}


/**
 *  Scrobbler#trackInfo(artist, track, callback)
 */
Scrobbler.prototype.trackInfo = function(artist, track, callback){
    this.callMethod("track.getInfo", {artist:artist, track:track, username:this._username}, function(response){
        var track = response.track
        var track_info = {}

        track_info.duration = parseInt(track.duration)/1000

        if(track.userloved)
            track_info.loved = track.userloved

        if(track.album){
            track_info.album = {}
            track_info.album.title = track.album.title

            if(track.album.image && track.album.image[0])
                track_info.album.image = track.album.image[0]["#text"]
        }

        if(track.toptags.tag){
            track_info.tags = []

            for(i in track.toptags.tag)
                track_info.tags.push(track.toptags.tag[i].name)
        }

        callback({track_info: track_info})
    })
}


/**
 *  Scrobbler#loveTrack(artist, track)
 */
Scrobbler.prototype.loveTrack = function(artist, track, callback){
    if(this._username){
        this.callMethod("track.love", {artist:artist, track:track, sig_call: true, http_method:'POST'}, callback)
    }
}


/**
 *  Scrobbler#banTrack(artist, track)
 */
Scrobbler.prototype.banTrack = function(artist, track, callback){
    if(this._username)
        this.callMethod("track.ban", {artist:artist, track:track, sig_call:true, http_method:'POST'}, callback)
}


Scrobbler.prototype.radioTune = function(station, callback){
    if(this._username)
        this.callMethod("radio.tune", {station:station, sig_call:true, http_method:'POST', use_cache:false}, callback)
}

function getNodeValue(parent_node, node_name) {
    try {
        return parent_node.getElementsByTagName(node_name)[0].firstChild.nodeValue
    } catch (e) {
        console.log("Can't get property '%s' from", node_name, parent_node);
    }
}

Scrobbler.parseXSPFPlaylist = function(xml) {
    var track_items = xml.getElementsByTagName("track");
    var tracks = [];    

    for(var i=0; i<track_items.length; i++) {
        var item = track_items[i];

        tracks.push({
            artist: getNodeValue(item, "creator"),
            song: getNodeValue(item, "title"),
            album: getNodeValue(item, "album"),
            image: getNodeValue(item, "image"),
            duration: parseInt(getNodeValue(item, "duration"))/1000,
            audio_url: getNodeValue(item, "location"),
            use_flash: true,

            info: {} 
        });
    }

    return tracks;
}

Scrobbler.prototype.radioGetPlaylist = function(callback){

    if(this._username)
        this.callMethod("radio.getPlaylist", {sig_call:true, http_method:'POST', use_cache: false}, function(response){            
            var tracks = Scrobbler.parseXSPFPlaylist(response);
            console.log("radioGetPlaylist:", tracks);
            
            callback(tracks);
        }.bind(this))
}



var LASTFM_RESTYPE = {
  'Artist': 6,
  'Album': 8,
  'Track': 9,
  'Tag': 32
}

Scrobbler.search = function(search_text, callback){
  console.log("Search text after:", search_text)

  search_text = search_text.stripHTML()
                           .replace(/(^\s+|\s+$)/g,'')
                           .replace(/\(.*\)/g,'')
                           .replace(/\[.*\]/g,'')
                           .replace(/[\n\-\.\,\\\/]/g,'')
                           .replace(/[\u2000-\u206F\u2E00-\u2E7F]/,' ') //Punctuation symbols
                           .replace(/\s+/g,' ')

  if(search_text == "")
    return false;

  console.log("Search text after:", search_text)

  xhrRequest("http://www.last.fm/search/autocomplete", 
             "GET", 
             "q="+encodeURIComponent(search_text)+"&force=1", 
    function(response){
      var json = JSON.parse(response.responseText)
      var arr = json.response.docs
      var html = "";
      var title; 
      var href;
      var image;
      var attrs;
      var css_class;
      var result = [];

      for (i in arr) {
        if(i > 4)
            break;

        title = "";
        attrs = "";
        css_class = "";
        image = undefined;        

        switch(arr[i].restype){
          case LASTFM_RESTYPE.Artist:
            title = arr[i].artist;
            href = "music/"+encodeURIComponent(arr[i].artist);
            attrs = 'data-artist="'+arr[i].artist+'"'
            css_class = "ex_artist"
            break;
          case LASTFM_RESTYPE.Album:
            title = arr[i].artist + " &ndash; " + arr[i].album;
            href = "music/"+encodeURIComponent(arr[i].artist)+"/"+encodeURIComponent(arr[i].album);
            attrs = 'data-artist="'+arr[i].artist+'" data-album="'+arr[i].album+'"'
            css_class = "ex_album"
            break;
          case LASTFM_RESTYPE.Track:
            title = arr[i].artist + " &ndash; " + arr[i].track;
            href = "music/"+encodeURIComponent(arr[i].artist)+"/_/"+encodeURIComponent(arr[i].track);
            attrs = 'data-artist="'+arr[i].artist+'" data-song="'+arr[i].track+'"'
            break;
/*            
          case LASTFM_RESTYPE.Tag:
            title = arr[i].tag;
            image = "http://cdn.last.fm/flatness/icons/activity/tagged.png";
            href = "tag/"+arr[i].tag;
            break;
*/            
        }
        
        if (title == "")
          continue;     

        if (arr[i].image)
            arr[i].image = "http://userserve-ak.last.fm/serve/64s/"+arr[i].image;
        else
            arr[i].image = Scrobbler.getImage({artist: arr[i].artist, album: arr[i].album});
        

        var link_id = Math.floor(Math.random()*9999999999);
        var play_link = "<a href=\"javascript:;\" target='_blank' class='sm2_button' title='Play song' id='ex_button_"+link_id+"' >"+title+"</a>"

        html += "<li class='lfm_restype_"+arr[i].restype+" with_vk_search' data-index-number='"+link_id+"'>";
        html += "  <div class='ex_container "+css_class+"' data-index-number='0' "+attrs+">";
        html += "    <span class='img'><img src='"+arr[i].image+"' width='34'/></span>";
        html += "    <span class='play_link'>"+play_link+"</span>";
        html += "    <span class='title'><a href=\"http://last.fm/"+href+"\" target='_blank'>"+title+"</a></span>";
        html += "  </div>";
        html += "</li>";

        result.push(arr[i]);
      }

      html = "<ul>"+html+"</ul>";
  
      callback({html:html, result:result})
    }.bind(this)
  )
}

Scrobbler.getImage = function(data){
    var method_prefix = "";
    var params = [];

    params.push("artist="+encodeURIComponent(data.artist.replaceEntities()));

    if(data.album){
        method_prefix = "album";
        params.push("album="+encodeURIComponent(data.album.replaceEntities()));
    } else {
        method_prefix = "artist";
    }

    var url = "http://ws.audioscrobbler.com/2.0/?api_key=ceec2bb03d4c5929f0d6667fc266dc75&method="+method_prefix+".getImageRedirect&size=mediumsquare&"+params.join('&');

    return url
}

/**
    Scrobbler#authURL()
**/
Scrobbler.authURL = function(){
    return "http://www.last.fm/api/auth/?api_key=" + this.api_key;    
}


/**
    Scrobbler#preview_mp3(track_id, callback)
**/
Scrobbler.previewURL = function(track_id){
    return "http://ws.audioscrobbler.com/2.0/?method=track.previewmp3&trackid="+track_id+"&api_key="+this.api_key;
}


window.Scrobbler = Scrobbler;

}(window))
