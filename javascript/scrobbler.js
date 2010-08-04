var _gaq = _gaq || [];

/**
    Class Scrobbler
**/
var Scrobbler = function(session_key, username){
    this._api_key = "170909e77e67705570080196aca5040b"
    this._secret = "516a97ba6f832d9184ae5b32c231a3af"
    this._session_key = session_key
    this._username = username
    this.scrobbling  = true
}

/**
    Scrobbler#getSession(token, callback)
**/
Scrobbler.prototype.getSession = function(token, callback){
    if(!token)
        return false

    console.log("Getting session")

    var signature = MD5("api_key"+this._api_key+"methodauth.getSessiontoken"+token+this._secret)

    console.log("TRIAM!")

    xhrRequest("http://ws.audioscrobbler.com/2.0/", "GET",
               "method=auth.getSession&api_key="+this._api_key+"&api_sig="+signature+"&token="+token, 
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
    
    this.callMethod("User.updateNowPlaying", 
                   {artist:artist, track:track, album:album, duration:duration, sig_call:true, http_method:'POST'}, callback)
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
                   {artist:artist, track:track, album:album, duration:duration, timestamp: timestamp, sig_call:true, http_method:'POST'}, callback)
}


/**
    Scrobbler#auth()
**/
Scrobbler.prototype.auth = function(){
    chrome.tabs.create({url:"http://www.last.fm/api/auth/?api_key="+this._api_key})
}


/**
    Scrobbler#preview_mp3(track_id, callback)
**/
Scrobbler.prototype.previewURL = function(track_id){
    return "http://ws.audioscrobbler.com/2.0/?method=track.previewmp3&trackid="+track_id+"&api_key="+this._api_key    
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
    params["api_key"] = this._api_key
    params["format"] = 'json'
    
    for(key in params)
        if(params[key] != undefined && typeof(params[key]) == 'string')
            params[key] = params[key].replace(/&amp;/g,'and')

    if(params['sig_call']){
        delete params['sig_call']
        delete params['format']

        if(this._session_key){
            params['sk'] = this._session_key
            
            var signature = []
            for(key in params)
                if(params[key] != undefined)
                    signature.push(key+params[key])

            signature.sort()

            console.log("Sig string:", signature.join('')+this._secret)

            signature = MD5(signature.join('')+this._secret)

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
    

    if (method == "User.updateNowPlaying" || method == "Track.scrobble")
      var server_url = "http://post.audioscrobbler.com/2.0/"
    else
      var server_url = "http://ws.audioscrobbler.com/2.0/"

    console.info("Using server url: ", server_url)

    xhrRequest(server_url, http_method, query_string, function(xhr){
        if(!xhr.responseXML){
          try{
              var response = JSON.parse(xhr.responseText)
          } catch(e) {
              var response = {error: 'Parsing error'}
          }
        } else {
          var response = xhr.responseXML
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
        callback({image: response.artist.image[1]["#text"].replace(/serve\/([^\/]*)/,'serve/64s')})
    })
}


/**
    Scrobbler#fetchPlaylist(playlist_url, callback)
**/
Scrobbler.prototype.fetchPlaylist = function(playlist_url, callback){   
    if(callback == undefined)
        callback = function(){}

    this.callMethod("playlist.fetch", {playlistURL: playlist_url}, function(response){
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
        }

        callback({tracks: result_tracks})
    })
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
