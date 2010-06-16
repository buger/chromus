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
    Scrobbler#handshake(callback)
**/
Scrobbler.prototype.handshake = function(callback){    
    if(!this._username)
        return false

    var now = new Date()
    var timestamp = parseInt(now.getTime()/1000.0)
    var auth_token = MD5(this._secret+timestamp)
        
    var url = 'http://post.audioscrobbler.com/'
    var data = 'hs=true&p=1.2.1&c=fmp&v=2.0&u='+this._username+'&t='+timestamp+'&a='+auth_token+"&sk="+this._session_key+"&api_key="+this._api_key

    if(!callback)
        callback = function(){}

    xhrRequest(url, "GET", data, function(xhr){
        if (xhr.statusText == 'OK') {
            var res = xhr.responseText.split('\n')

            if (res[0] == 'OK') {
                var data = {}

                data.sid = res[1]

                this._now_playing_url = res[2]
                this._submission_url = res[3]
                this._sid = data.sid

                callback(data)
            } else if (res[0] == 'BADUSER') {
                callback({error:'Username was not found'})
            } else {
                console.error(xhr.responseText)
                callback({error:'Auth error'})
            }
        } else {
	        callback({error:'Handshake error:'+xhr.responseText})
	    }
    }.bind(this))
}


/**
    Scrobbler#setNowPlaying(artist, track, duration, callback)
**/
Scrobbler.prototype.setNowPlaying = function(artist, track, duration, callback){
    if(!this.scrobbling)
        return false

    if(!this._username)
        return 

    if(!callback)
        callback = function(){}
    
    var data = "s="+this._sid+"&a="+encodeURIComponent(artist)+"&t="+encodeURIComponent(track)+"&b=&l="+parseInt(duration)+"&n=&m="

    xhrRequest(this._now_playing_url, "POST", data, function(xhr){
        console.log("Now playing response:", xhr.responseText)
        if(xhr.responseText == "" || xhr.responseText.match("BADSESSION")){
            this.handshake(function(response){                
                console.log("Bad session, handshake!:", response)

                if(response.error){
                    console.log("Error while handshake:", response.error)
                    callback(response)
                } else {
                    this.setNowPlaying(artist, track, duration, callback)
                }
            }.bind(this))
        } else {
            if(xhr.statusText == "OK")
                callback({})
            else
                callback({error:xhr.reponseText})            
        }
    }.bind(this))
}


/**
    Scrobbler#scrobble(artist, track, duration, callback)
**/
Scrobbler.prototype.scrobble = function(artist, track, duration, callback){
    if(!this.scrobbling)
        return false
        
    if(!this._username)
        return false 

    if(!callback)
        callback = function(){}

    var now = new Date()
    var timestamp = parseInt(now.getTime()/1000.0)
    var data = "s="+this._sid+"&a[0]="+encodeURIComponent(artist)+"&t[0]="+encodeURIComponent(track)+"&i[0]="+timestamp+"&o[0]=P&l[0]="+parseInt(duration)+"&r[0]=&b[0]=&n[0]=&m[0]="

    xhrRequest(this._submission_url, "POST", data, function(xhr){
        if(xhr.statusText == "OK") {
            callback({})
        } else {
            if(xhr.responseText.match("BADSESSION")){
                this.handshake(function(response){
                    if(response.error){
                        console.log("Error while handshake:", response.error)
                        callback(response)
                    } else {
                        this.scrobble(artist, track, duration, callback)
                    }
                })
            } else {
                callback({error:xhr.reponseText})
            }
        }
    }.bind(this))
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
    params["method"] = method
    params["api_key"] = this._api_key
    params["format"] = "json"

    var query_string = []
    for(key in params)
        query_string.push(key+"="+encodeURIComponent(params[key]))
    
    query_string = query_string.join('&')

    console.log("Calling method:", method)

    if(params['use_cache'] != false && CACHE.get(query_string)){
        console.info("Using CACHE")
        
        callback(CACHE.get(query_string))
        return
    }

    xhrRequest("http://ws.audioscrobbler.com/2.0/", "GET", query_string, function(xhr){
        var response = JSON.parse(xhr.responseText)
        
        if(!response.error){
            //By default caching without expiration (if params['expire_time'] is undefined) 
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
        callback({image: response.artist.image[1]["#text"]})
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
    Scrobbler.artistChart(artist, callback)
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
