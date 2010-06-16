Audio.prototype.playOrLoad = function(url){
    if(url){
        console.log("Playing url:", url)

        this.src = url
        this.load()
    }

    this.play()
}


/**
    Class MusicManager
**/
var MusicManager = function(scrobbler){
    this.playlist = []

    this.scrobbler = scrobbler 

    this.audio = new Audio()    

    this.audio.addEventListener('canplaythrough', this.onStartPlaying.bind(this), true)
    this.audio.addEventListener('timeupdate', this.onTimeUpdate.bind(this), true)
}


/**
    MusicManager#onTimeUpdate
**/
MusicManager.prototype.onTimeUpdate = function(){
    var track = this.playlist[this.current_track]

    if(!track) return

    if(this.audio.currentTime >= track.duration)
        this.onEnded()

    var percent_played = (this.audio.currentTime / track.duration)*100

    if(this.audio.duration > 31 && percent_played > 70 && !track.scrobbled){        
        this.scrobbler.scrobble(track.artist, track.song, track.duration)
        track.scrobbled = true

        var next_track = this.playlist[this.current_track+1]
        if(next_track){
            console.log("Prefetching next track")
            this.searchTrack(this.current_track+1, false)
        }

        console.log("Track scrobbled", track)
    }
}


/**
    MusicManager#fireEvent(event_name)
**/
MusicManager.prototype.fireEvent = function(event_name){
    var evt = document.createEvent("Events")
    evt.initEvent(event_name, true, true)
    this.audio.dispatchEvent(evt)
}


/**
    MusicManager#onStartPlaying()
**/
MusicManager.prototype.onStartPlaying = function(){
    var track = this.playlist[this.current_track]

    this.scrobbler.setNowPlaying(track.artist, track.song, track.duration)

    this.fireEvent("onPlay")
}


/**
    MusicManager#onEnded()
**/
MusicManager.prototype.onEnded = function(){
    console.log("onEnded")

    var track = this.playlist[this.current_track]

    if(this.stop_after_playing)
        delete this.current_track        
    else
        this.playNextTrack()

    this.fireEvent("onEnded")
}


/**
    MusicManager#playArtist(artist, callback)
**/
MusicManager.prototype.playArtist = function(artist){
    this.scrobbler.artistChart(artist, function(response){
        this.playlist = response.tracks
        delete this.current_track
    
        this.playNextTrack(true, false)
    }.bind(this))
}


/**
    MusicManager#playAlbum(artist, album, callback)
**/
MusicManager.prototype.playAlbum = function(artist, album){
    this.scrobbler.albumPlaylist(artist, album, function(response){
        this.playlist = response.tracks
        delete this.current_track

        this.playNextTrack(true, false)
    }.bind(this))
}


/**
    MusicManager#playNextTrack()
**/
MusicManager.prototype.playNextTrack = function(){
    if(this.current_track != undefined && !this.repeat)
        this.current_track += 1
    
    if(!this.current_track)
        this.current_track = 0

    this.searchTrack(this.current_track)    
}


/**
    MusicManager#playPreviews()
**/
MusicManager.prototype.playPreviews = function(){
    return window.localStorage["skip_previews"] == "false" || window.localStorage["skip_previews"] == undefined
}


/**
    MusicManager#searchTrack(trackIndex)
**/
MusicManager.prototype.searchTrack = function(trackIndex, playAfterSearch){
    console.log("Searching track:", trackIndex)

    trackIndex = parseInt(trackIndex)

    var track = this.playlist[trackIndex]    
    if(!track) return

    track.song = track.song.replaceEntities()
    track.artist = track.artist.replaceEntities()

    if(playAfterSearch == undefined)
        playAfterSearch = true

    VK.search(track.artist, track.song, function(response){
        if(!playAfterSearch) return

        if(response.error){
            if(response.error == 'not_found' && track.track_id && track.streamable && this.playPreviews()) {
                this.not_found_in_row = 0

                this.current_track = trackIndex

                this.fireEvent("onLoading")
                this.audio.playOrLoad(this.scrobbler.previewURL(track.track_id))

                track.duration = 30

                this.showNotification()
            } else {                
                this.not_found_in_row += 1
                if(this.not_found_in_row < 10)
                    setTimeout(function(){this.playNextTrack()}, 500)
            }
        } else {
            this.current_track = trackIndex

            this.not_found_in_row = 0
            this.fireEvent("onLoading")
            
            this.audio.playOrLoad(response.url)
    
            track.duration = parseInt(response.duration)
            track.scrobbled = false

            this.showNotification()
        }
    }.bind(this))
}


/**
    MusicManager#play(track_info)
**/
MusicManager.prototype.play = function(track_info){
    var track = this.playlist[this.current_track]

    console.log("Playing:", track, track_info, this.current_track)

    if(track_info.song){
        // If resuming track
        track_info.song = track_info.song.replaceEntities()
        track_info.artist = track_info.artist.replaceEntities()

        if(track && track_info.song == track.song && track_info.artist == track.artist && track_info.index == track.index){
            this.audio.playOrLoad()

            this.fireEvent("onPlay")
        } else {
            this.searchTrack(track_info.index)
        }
    } else {
        if(track_info.album)
            this.playAlbum(track_info.artist, track_info.album, function(){})
        else
            this.playArtist(track_info.artist, function(){})
    }
}


/**
    MusicManager#pause()
**/
MusicManager.prototype.pause = function(){
    this.audio.pause()
}


/**
    MusicManager#showNotification()
**/
MusicManager.prototype.showNotification = function(){
    var track = this.playlist[this.current_track]
    var show_notification = window.localStorage["show_notifications"] == "true" || window.localStorage["show_notifications"] == undefined

    if(!show_notification || !track || !window.webkitNotifications) return
    
    this.scrobbler.artistInfo(track.artist, function(response){            
        var notification = window.webkitNotifications.createNotification(response.image, track.song, track.artist)
        notification.show()

        setTimeout(function(){notification.cancel()}, 6000)
    })
}
