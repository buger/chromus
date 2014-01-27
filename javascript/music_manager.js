var _gaq = _gaq || [];

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
    this.canResearch = true;

    this.scrobbler = scrobbler;

    this.createAudio();

    this.dispatcher = new Audio();
}

MusicManager.prototype.createAudio = function(){
    if(this.audio){
        this.audio.removeEventListener('timeupdate', this.audio.tu_func);
        this.audio.removeEventListener('canplaythrough', this.audio.cpt_func);
        this.audio.removeEventListener('progress', this.audio.p_func);

        this.audio.pause();        

        delete this.audio;
    }

    this.audio = new Audio();

    this.audio.cpt_func = this.onStartPlaying.bind(this);    
    this.audio.addEventListener('canplaythrough', this.audio.cpt_func, true);

    this.audio.tu_func = this.onTimeUpdate.bind(this);
    this.audio.addEventListener('timeupdate', this.audio.tu_func, true);

    this.audio.p_func = function(){ this.fireEvent('onProgress'); }.bind(this);
    this.audio.addEventListener('progress', this.audio.p_func, true)
}


/**
    MusicManager#onTimeUpdate
**/
MusicManager.prototype.onTimeUpdate = function(){
    var track = this.playlist[this.current_track]

    if(!track || this.audio.paused || this.audio.src != track.audio_url) return;
                
    this.fireEvent('onTimeupdate');


    if(this.audio.currentTime >= track.duration || this.audio.ended){
        console.log(this.audio.currentTime, track.duration, this.audio.ended, track, this.audio.src);

        this.onEnded()
    }

    var percent_played = (this.audio.currentTime / track.duration)*100

    if(this.audio.duration > 31 && percent_played > 50 && !track.scrobbled){        
        this.scrobbler.scrobble(track.artist, track.song, track.album, track.duration)
        track.scrobbled = true
        
        console.log("Track scrobbled", track)
    }
    
    if(this.audio.duration > 31 && percent_played > 90 && this.stop_after_playing != "stop" && !track.next_song_prefetched){
      var next_track = this.playlist[this.current_track+1]

      track.next_song_prefetched = true

      if(next_track){
          console.log("Prefetching next track")
          _gaq.push(['_trackEvent', 'music_manager', 'prefetchingTrack']);

          if(this.play_mode == "shuffle" && this.shuffle_tracks)
              this.searchTrack(this.shuffle_tracks[0], false)
          else
              this.searchTrack(this.current_track+1, false)
      }
    }
}


/**
    MusicManager#fireEvent(event_name)
**/
MusicManager.prototype.fireEvent = function(event_name){
    var evt = document.createEvent("Events")
    evt.initEvent(event_name, true, true)
    this.dispatcher.dispatchEvent(evt)
}


/**
    MusicManager#onStartPlaying()
**/
MusicManager.prototype.onStartPlaying = function(){
    var track = this.playlist[this.current_track]

    console.log("Album:", track.album)

    this.scrobbler.setNowPlaying(track.artist, track.song, track.album, track.duration)

    this.fireEvent("onPlay")
}


/**
    MusicManager#onEnded()
**/
MusicManager.prototype.onEnded = function(){
    console.log("onEnded")

    var track = this.playlist[this.current_track]

    if(this.stop_after_playing == "stop" || (this.play_mode != "shuffle" && this.repeat_mode != "repeat_one" && this.current_track == (this.playlist.length-1)))
        delete this.current_track        
    else
        this.playNextTrack()

    this.fireEvent("onEnded")
}


/**
    MusicManager#playArtist(artist, callback)
**/
MusicManager.prototype.playArtist = function(artist){
    _gaq.push(['_trackEvent', 'music_manager', 'playArtist', artist]);

    this.scrobbler.artistChart(artist, function(response){
        this.playlist = response.tracks
        delete this.current_track
    
        this.playNextTrack()
    }.bind(this))
}


/**
    MusicManager#playAlbum(artist, album, callback)
**/
MusicManager.prototype.playAlbum = function(artist, album){
    _gaq.push(['_trackEvent', 'music_manager', 'playAlbum', artist+'-'+album]);

    this.scrobbler.albumPlaylist(artist, album, function(response){
        this.playlist = response.tracks
        delete this.current_track

        this.playNextTrack()
    }.bind(this))
}


/**
    MusicManager#playNextTrack()
**/
MusicManager.prototype.playNextTrack = function(ignore_repeat, previous){
    console.log("Next track:", this.current_track)

    if(this.play_mode == "shuffle" && this.repeat_mode != "repeat_one"){
        if(this.shuffle_tracks == undefined){
            this.shuffle_tracks = []

            for(i in this.playlist)
                this.shuffle_tracks.push(i)

            this.shuffle_tracks.sort(function() {return 0.5 - Math.random()})
        }

        if(this.shuffle_tracks.length == 0){
            if(this.playlist.length != 0 && (this.repeat_mode == "repeat_all" || ignore_repeat)){
                delete this.shuffle_tracks                
                this.playNextTrack(ignore_repeat)
            }

            return
        }

        this.current_track = this.shuffle_tracks[0]        
        this.shuffle_tracks.splice(0,1)
    } else {
        if(this.current_track != undefined && (this.repeat_mode != "repeat_one" || ignore_repeat))
            this.current_track += 1
    }
    
    if(!this.current_track || this.current_track > (this.playlist.length-1))
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
MusicManager.prototype.searchTrack = function(trackIndex, playAfterSearch, getNextResult){
    console.log("Searching track:", trackIndex)

    trackIndex = parseInt(trackIndex)

    var track = this.playlist[trackIndex]

    console.log("Track:", track, this.playlist[0])

    if(!track) {
        if(this.repeat_mode == "repeat_all" && this.playlist[0]){
            track = this.playlist[0]
            trackIndex = 0
        } else
            return
    }

    console.log("Track:", track)

    if(!track.info){
        this.updateTrackInfo(trackIndex, function(){
            this.searchTrack(trackIndex, playAfterSearch, getNextResult)
        }.bind(this))

        return
    }

    track.song = track.song.replaceEntities()
    track.artist = track.artist.replaceEntities()
    
    if(getNextResult == undefined)
        getNextResult = false;

    if(playAfterSearch == undefined)
        playAfterSearch = true

    VK.search(track.artist, track.song, track.info.duration, function(response){
        if(!playAfterSearch)
            return        

        console.log("Resp",response)

        if(response.error){
            track.error_type = response.error;
            this.canResearch = false;
            if(response.error == 'not_found' && track.track_id && track.streamable && this.playPreviews()) {
                this.not_found_in_row = 0

                this.current_track = trackIndex

                this.fireEvent("onLoading")

                this.createAudio()
                this.audio.playOrLoad(this.scrobbler.previewURL(track.track_id))
            
                this.setVolume()                

                track.duration = 30
                track.audio_url = this.audio.src;

                this.showNotification()
            } else {
                this.current_track = trackIndex

                track.not_found = true;


                this.fireEvent("onPlay")
                
                if(!this.not_found_in_row)
                    this.not_found_in_row = 0

                this.not_found_in_row += 1

                if(this.not_found_in_row < 10)
                    setTimeout(this.playNextTrack.bind(this), 1000)
                else
                    this.not_found_in_row = 0
            }
        } else {
            this.canResearch = response.length > 1;
            this.current_track = trackIndex

            this.not_found_in_row = 0
            this.fireEvent("onLoading")
            
            console.log("response.lastIndex", response.lastIndex)
            if(track.lastIndex == undefined || track.lastIndex == -1){
                this.playlist[trackIndex].lastIndex = response.lastIndex;
                track = this.playlist[trackIndex]
            }            
            
            if(this.canResearch && getNextResult){   
                this.playlist[trackIndex].lastIndex++                
                if(this.playlist[trackIndex].lastIndex >= response.length)
                    this.playlist[trackIndex].lastIndex = 0;
                track = this.playlist[trackIndex];
            }
            
            console.log("nextIndex", track.lastIndex)
            
            this.createAudio();
            this.audio.playOrLoad(response[track.lastIndex].url)

            this.setVolume()            
    
            track.duration = parseInt(response[track.lastIndex].duration)
            track.scrobbled = false
            track.next_song_prefetched = false 

            track.audio_url = response[track.lastIndex].url;
            
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

    delete this.shuffle_tracks

    if(track_info.song){
        // If resuming track
        track_info.song = track_info.song.replaceEntities()
        track_info.artist = track_info.artist.replaceEntities()

        if(track && track_info.song == track.song && track_info.artist == track.artist && track_info.index == track.index){
            this.audio.playOrLoad()
            this.setVolume()            

            this.fireEvent("onPlay")
        } else {
            this.searchTrack(track_info.index)
            
            _gaq.push(['_trackEvent', 'music_manager', 'play', track_info.artist+'-'+track_info.song]);

            _gaq.push(['_trackEvent', 'music_manager', 'play_artist_chart', track_info.artist]);
        }
    } else {
        if(track_info.album)
            this.playAlbum(track_info.artist, track_info.album, function(){})
        else
            this.playArtist(track_info.artist, function(){})
    }
}

/**
    MusicManager#play(track_info)
**/
MusicManager.prototype.research = function(track_info){

    var track = this.playlist[this.current_track]
    
    console.log("Research:", track, track_info, this.current_track)

    delete this.shuffle_tracks

    if(track_info.song){
        // If resuming track
        track_info.song = track_info.song.replaceEntities()
        track_info.artist = track_info.artist.replaceEntities()

        this.searchTrack(track_info.index, true, true)
            
        _gaq.push(['_trackEvent', 'music_manager', 'play', track_info.artist+'-'+track_info.song]);

        _gaq.push(['_trackEvent', 'music_manager', 'play_artist_chart', track_info.artist]);
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


    var notification = window.webkitNotifications.createNotification(track.image, track.song, track.artist)
    notification.show()
    setTimeout(function(){notification.cancel()}, 6000)
}


/**
 * MusicManager#getTrackInfo()
 */
MusicManager.prototype.updateTrackInfo = function(trackIndex, callback){
    var track = this.playlist[trackIndex]

    if(!track.info)
        this.scrobbler.trackInfo(track.artist, track.song, function(response){
            if(response.track_info){
                track.info = response.track_info

                if(track.info.album){
                    track.album = track.info.album.title                    
                    track.image = track.info.album.image
                }
            }
            
            if(!track.image)
                this.scrobbler.artistInfo(track.artist, function(resp){
                    track.image = resp.image

                    if(callback)
                        callback()
                }.bind(this))
            else
                if(callback)
                    callback()
        }.bind(this))
    else{
        if(callback)
            callback()
    }
}


/**
 * MusicManager#setVolume(value)
 */
MusicManager.prototype.setVolume = function(volume){
    if(volume != undefined)
        this.volume = volume

    this.audio.volume = 0.000001
    this.audio.volume = this.getVolume()
}


/**
 * MusicManager#getVolume() -> Integer
**/
MusicManager.prototype.getVolume = function(){
    if(this.volume == undefined)
        this.volume = 1

    return this.volume
}


/**
 * MusicManager#love()
 */
MusicManager.prototype.love = function(){
    var track = this.playlist[this.current_track]

    if(track)
        this.scrobbler.loveTrack(track.artist, track.song)
}


/**
 * MusicManager#ban()
 */
MusicManager.prototype.ban = function(){
    var track = this.playlist[this.current_track]

    if(track)
        this.scrobbler.banTrack(track.artist, track.song)
}
