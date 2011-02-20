var _gaq = _gaq || [];

/**
    Class MusicManager
**/
var MusicManager = function(scrobbler){
    this.playlist = []

    this.scrobbler = scrobbler;

    this.player_url = "http://chromusapp.appspot.com/";

    this.setEmptyState();
    this.createAudio();

    this.dispatcher = document.createElement('input'); 
}

MusicManager.prototype.setEmptyState = function() {
    this.state = {
        duration: 0,
        played: 0,
        buffered: 0,
        paused: true,
        finished: true,
        playing: false
    };
}

MusicManager.prototype.createAudio = function() {
    console.log("Creating frame for audio player");
    
    this.player_frame = document.createElement("iframe");
    this.player_frame.id = 'player_frame'; 
    
    if (!browser.isSafari) {
        this.player_frame.src = this.player_url+"sm2_iframe";
    } else {
        this.player_frame.src = safari.extension.baseURI+"sm2/iframe.htm";
    }
    document.body.appendChild(this.player_frame);
        
    this.player_ready = false;

    if (window.addEventListener){
        window.addEventListener("message", this.listener.bind(this), false);
    } else {
        window.attachEvent("onmessage", this.listener.bind(this));
    }
}

MusicManager.prototype.listener = function(evt) {   
    var msg = JSON.parse(evt.data);

    switch(msg.method){
        case 'playerState':
            this.updateState(msg.state);

            break;

        case 'ready':
            this.player_ready = true;
            break;

        case 'startPlaying':
            this.onStartPlaying();
            break;

        default:
            console.log("Received unknown message:", msg);
    }
}

MusicManager.prototype.postMessageToPlayer = function(data) {
    this.player_frame.contentWindow.postMessage(JSON.stringify(data), '*');
}

MusicManager.prototype.playTrack = function(url) {
    var track = this.playlist[this.current_track];    

    this.postMessageToPlayer({
        'method': 'play',
        'url': url,
        'track': encodeURIComponent(track.artist + ' - ' + track.song).replace(/'/,"%27")
    });
}

MusicManager.prototype.preloadTrack = function(track, url) {
    this.postMessageToPlayer({
        'method': 'preload',
        'url': url,
        'track': encodeURIComponent(track.artist + ' - ' + track.song).replace(/'/,"%27")
    });
}

MusicManager.prototype.pause = function() {
    this.state.paused = true;

    this.postMessageToPlayer({'method': 'pause'});
}

MusicManager.prototype.updateState = function(state) {    
    this.state = state;    
    this.state.volume = this.volume;

    var track = this.playlist[this.current_track];    

    if (!track || this.state.paused || this.state.url != track.audio_url) return;
                
    if (this.state.played >= track.duration || this.state.finished) {
        console.log(this.state.played, track.duration, this.state.duration, track, this.state.url);
        
        this.onEnded();
    }

    var percent_played = (this.state.played / track.duration)*100;

    if(this.state.duration > 31 && percent_played > 50 && !track.scrobbled && track.artist){
        this.scrobbler.scrobble(track.artist, track.song, track.album, track.duration)
        track.scrobbled = true
        
        console.log("Track scrobbled", track)
    }
    
    if(this.state.duration > 31 && percent_played > 80 && this.stop_after_playing != "stop" && !track.next_song_prefetched){
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
    var evt = document.createEvent("Events");
    evt.initEvent(event_name, true, true);
    this.dispatcher.dispatchEvent(evt);
}


/**
    MusicManager#onStartPlaying()
**/
MusicManager.prototype.onStartPlaying = function(){
    var track = this.playlist[this.current_track]

    console.log("Album:", track.album)
    
    if(track.artist)
      this.scrobbler.setNowPlaying(track.artist, track.song, track.album, track.duration)

    this.fireEvent("onPlay")
}


/**
    MusicManager#onEnded()
**/
MusicManager.prototype.onEnded = function(){
    console.log("onEnded");

    this.setEmptyState();
    
    var track = this.playlist[this.current_track];

    if (this.stop_after_playing == "stop" || (this.play_mode != "shuffle" && this.repeat_mode != "repeat_one" && this.current_track == (this.playlist.length-1))) {
        delete this.current_track;
    } else {
        this.playNextTrack();
    }

    this.fireEvent("onEnded");
}


/**
    MusicManager#playArtist(artist, callback)
**/
MusicManager.prototype.playArtist = function (artist) {
    _gaq.push(['_trackEvent', 'music_manager', 'playArtist', artist]);

    this.scrobbler.artistChart(artist, function (response) {
        this.playlist = response.tracks;
        delete this.current_track;
    
        this.playNextTrack();
        
        this.fireEvent('onPlaylistChanged');
    }.bind(this))
}


/**
    MusicManager#playAlbum(artist, album, callback)
**/
MusicManager.prototype.playAlbum = function (artist, album) {
    _gaq.push(['_trackEvent', 'music_manager', 'playAlbum', artist+'-'+album]);

    this.scrobbler.albumPlaylist(artist, album, function(response){
        this.playlist = response.tracks;
        delete this.current_track;

        this.playNextTrack();
        
        this.fireEvent('onPlaylistChanged');
    }.bind(this))
}


/**
    MusicManager#playNextTrack()
**/
MusicManager.prototype.playNextTrack = function(ignore_repeat, previous_track){
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
                this.playNextTrack(ignore_repeat, previous_track)
            }

            return
        }

        this.current_track = this.shuffle_tracks[0]        
        this.shuffle_tracks.splice(0,1)
    } else {
        if(this.current_track != undefined && (this.repeat_mode != "repeat_one" || ignore_repeat))
            this.current_track += previous_track ? -1 : 1
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
MusicManager.prototype.searchTrack = function(trackIndex, playAfterSearch){
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

    if(track.file_url){
        this.playTrack(track.file_url);
        this.setVolume();
        
        this.fireEvent("onPlay");

        if(!track.info)
            this.updateTrackInfo(track.index, function(){
                this.fireEvent("onLoading");
                this.showNotification();
            }.bind(this))
        else {
            this.fireEvent("onLoading");
            this.showNotification();          
        }

        return
    }

    if(!track.info){
        this.updateTrackInfo(trackIndex, function(){
            this.searchTrack(trackIndex, playAfterSearch)
        }.bind(this))

        return
    }

    track.song = track.song.replaceEntities()
    track.artist = track.artist.replaceEntities()

    if(playAfterSearch == undefined)
        playAfterSearch = true

    VK.search(track.artist, track.song, track.info.duration, function(response){        
        if (!playAfterSearch) {
            if (!response.error) {
                this.preloadTrack(track, response.url);                
            }

            return;
        }

        console.log("Resp",response)

        if (response.error) {
            if (response.error == 'not_found' && track.track_id && track.streamable && this.playPreviews()) {
                this.not_found_in_row = 0;

                this.current_track = trackIndex;

                this.fireEvent("onLoading");

                var url = Scrobbler.previewURL(track.track_id);

                this.playTrack();
            
                this.setVolume();

                track.duration = 30
                track.audio_url = url;

                this.showNotification()
            } else {
                this.current_track = trackIndex

                track.not_found = true

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
            this.current_track = trackIndex;

            this.not_found_in_row = 0;
            this.fireEvent("onLoading");
            
            this.playTrack(response.url);

            this.setVolume();
    
            track.duration = parseInt(response.duration);
            track.scrobbled = false;
            track.next_song_prefetched = false;

            track.audio_url = response.url;
            
            this.showNotification();
        }
    }.bind(this))
}


/**
    MusicManager#play(track_info)
**/
MusicManager.prototype.play = function(track_info){
    var track = this.playlist[this.current_track];

    console.log("Playing:", track, track_info, this.current_track);

    delete this.shuffle_tracks;

    if (track_info.file_url) {
        var play_or_pause = function(){
            this.current_track = track_info.index
            
            if(track && track_info.song == track.song && track_info.artist == track.artist && track_info.index == track.index){
                this.playTrack();
            } else {
                this.showNotification();

                this.playTrack(track_info.file_url);
            }
            
            this.setVolume();
            
            this.fireEvent("onPlay");

            this.fireEvent("onLoading");
        }.bind(this)

        if(!this.playlist[track_info.index].info){            
            this.updateTrackInfo(track_info.index, function(){
                play_or_pause();
            }.bind(this))
        } else {
            play_or_pause()
        }
    } else if (track_info.song){    
        // If resuming track
        track_info.song = track_info.song.replaceEntities()
        track_info.artist = track_info.artist.replaceEntities()

        if(track && track_info.song == track.song && track_info.artist == track.artist && track_info.index == track.index){
            this.playTrack()
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
        else {
            console.log("Playing artist:", track_info, track);

            this.playArtist(track_info.artist, function(){})
        }
    }
}


/**
    MusicManager#showNotification()

    Currently works only on Chrome
**/
MusicManager.prototype.showNotification = function(){
    var track = this.playlist[this.current_track];
    var show_notification = window.localStorage["show_notifications"] == "true" || window.localStorage["show_notifications"] == undefined;

    if(!show_notification || !track || !window.webkitNotifications) return;


    var notification = window.webkitNotifications.createNotification(track.image, track.song, track.artist);
    notification.show();
    setTimeout(function(){notification.cancel()}, 6000);
}


/**
 * MusicManager#updateID3Info()
 */
MusicManager.prototype.updateID3Info = function(trackIndex, callback){
    var track = this.playlist[trackIndex];

    if (track.file_url && !track.file_url.match(/^data/)) {
        ID3.loadTags(track.file_url, function(){
            var tags = ID3.getAllTags(track.file_url);
            
            console.log("ID3 Tags:", tags);
            
            if (tags.title) {
                track.song = tags.title;
                track.artist = tags.artist;
                track.album = tags.album;

                if (!track.song)
                    tack.song == "Untitled";
                
                if (trackIndex == this.current_track) {
                    this.scrobbler.setNowPlaying(track.artist, track.song, track.album, this.state.duration);
                    this.showNotification();
                    this.fireEvent("onLoading");
                }
            } else {
                track.id3_empty = true;
            }
            
            this.fireEvent('onPlaylistChanged');
            
            callback()
        }.bind(this));
    }
}

/**
 * MusicManager#getTrackInfo()
 */
MusicManager.prototype.updateTrackInfo = function(trackIndex, callback){
    var track = this.playlist[trackIndex]

    if(!track.artist){
        if(track.file_url && !track.id3_empty)
            this.updateID3Info(trackIndex, function(){
                this.updateTrackInfo(trackIndex, callback)         
            }.bind(this))
        else {
            track.info = {}
            callback()
        }
    } else if(!track.info)
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
    if (volume != undefined) {
        this.volume = volume;
    }

    this.postMessageToPlayer({
        'method': 'setVolume', 
        'volume': this.getVolume()
    });
}


/**
 * MusicManager#getVolume() -> Integer
**/
MusicManager.prototype.getVolume = function(){
    if (this.volume == undefined) {
        this.volume = 100;
    }

    return this.volume;
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


MusicManager.prototype.getState = function(){ 
    return this.state;
}
