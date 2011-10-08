browser.toolbarItem.setBackgroundColor([51,153,204,255]); //blue

var scrobbler = new Scrobbler(window.localStorage["lastfm_session"], window.localStorage["lastfm_username"])

var music_manager = new MusicManager(scrobbler);

music_manager.dispatcher.addEventListener('onPlay', function(){
    var track = music_manager.playlist[music_manager.current_track];

    if (track.not_found) {
        browser.broadcastMessage({
            method:"readyToPlay", 
            error:'not_found', 
            track: music_manager.playlist[music_manager.current_track]
        });
    } else {
        browser.toolbarItem.setTitle(track.artist +' - '+ track.song);

        browser.broadcastMessage({
            method:"readyToPlay", 
            track_index: music_manager.current_track,
            track: music_manager.playlist[music_manager.current_track]
        });
    }
}, true);


music_manager.dispatcher.addEventListener('onEnded', function(){
    browser.toolbarItem.setText("");

    browser.broadcastMessage({method:"stop"});
}, true);


music_manager.dispatcher.addEventListener('onLoading', function(){
    var track = music_manager.playlist[music_manager.current_track];

    browser.broadcastMessage({
        method:"loading", 
        track_index: music_manager.current_track,
        track: music_manager.playlist[music_manager.current_track]
    });
}, true);


music_manager.dispatcher.addEventListener('onPlay', function(){
    var track = music_manager.playlist[music_manager.current_track];

    browser.broadcastMessage({
        method: "play", 
        track_index: music_manager.current_track,
        track: music_manager.playlist[music_manager.current_track]
    });
}, true);

music_manager.dispatcher.addEventListener('onPlaylistChanged', function() {
    console.log("Playlist changed");

    browser.postMessage({
        method: "loadPlaylist", 
        playlist: music_manager.playlist, 
        current_track: music_manager.current_track,
        state: music_manager.getState()
    });
}, true);


var previous_state;

function updateState() {
    var track = music_manager.playlist[music_manager.current_track]

    var state = music_manager.getState();        

    if (!state || (previous_state && previous_state == state)) {
        return;
    }
    
    previous_state = state;

    if (track && !track.duration && music_manager.state.playing) {
      track.duration = music_manager.state.duration;
    }

    if (!music_manager.state.paused) {
        if (music_manager.state.duration && track && track.duration && music_manager.state.played) {
            var time_left = music_manager.state.duration - music_manager.state.played;

            if (time_left > 0) {
                browser.toolbarItem.setText(prettyTime(time_left));
            } else {
                browser.toolbarItem.setText("");
            }
        } else {
            browser.toolbarItem.setText("");
        }
    }

    browser.broadcastMessage({
        method:'updateState',
        state: state
    });
}

setInterval(updateState, 1000);


browser.addMessageListener(function(msg, sender, sendResponse) {
    console.log(msg.method, msg, sender)

    _gaq.push(['_trackEvent', 'msgReceived', msg.method]);

    switch(msg.method){
        case "auth_token":
            scrobbler.getSession(msg.token, function(response){
                console.log("Getting session:", response)

                if(response.session){
                    window.localStorage['lastfm_session'] = response.session
                    window.localStorage['lastfm_username'] = response.username
                }
                
                // TODO
                chrome.tabs.update(sender.tab.id, {url:chrome.extension.getURL("options.html")})
            });

            break;                        

        case "logout": 
            scrobbler._username = null;
            scrobbler._session_key = null;

            break;                    

        case "pause": 
            music_manager.pause();

            break;

        case "play":
            browser.broadcastMessage({method:"stop"});

            if (msg.playlist) {
                music_manager.playlist = msg.playlist;
                delete music_manager.current_track;
                
                music_manager.fireEvent('onPlaylistChanged');
            }

            if (typeof(msg.track) == "number") {
                msg.track = music_manager.playlist[msg.track];
            }

            music_manager.play(msg.track);
            
            music_manager.radio = undefined;

            break;

        case "add_to_playlist":
            var track = msg.track;
            track.index = music_manager.playlist.length;

            music_manager.playlist.push(track);
            music_manager.updateID3Info(music_manager.playlist.length-1);
            
            music_manager.radio = undefined;

            music_manager.fireEvent('onPlaylistChanged');

            break;

        case "search":
            Scrobbler.search(msg.search_text, function (response) {
                console.log("Received response searchResult");

                browser.postMessage({method:"searchResult", html:response.html});
            });

            break;

        case "togglePlaying":
            if (music_manager.state.paused && music_manager.current_track) {
                music_manager.playTrack();
            } else {
                music_manager.pause();
            }

            break;

        case "nextTrack": 
            music_manager.playNextTrack(true);

            break;
        
        case "previousTrack":
            music_manager.playNextTrack(true, true);

            break;

        case "getPlaylist":
            browser.postMessage({
                method: "loadPlaylist", 
                playlist: music_manager.playlist, 
                current_track: music_manager.current_track,
                state: music_manager.getState()
            });

            break;

        case "getSettings":
            browser.postMessage({
                method: "setSettings",
                settings: {
                    scrobbling: music_manager.scrobbler.scrobbling,
                    lastfm_username: music_manager.scrobbler._username
                }
            });

            break;

        case "setVolume":
            music_manager.setVolume(msg.volume);

            break;

        case "setScrobbling":
            music_manager.scrobbler.scrobbling = msg.scrobbling;              
            break;

        case "lovedRadio":
            music_manager.playRadio(new LastfmLovedRadio(music_manager.scrobbler));
            break;

        case "lastfmRadio":
            music_manager.playRadio(new LastfmRadio(music_manager.scrobbler, msg.url));
            break;

        case "clearPlaylist":
            music_manager.radio = undefined;
            music_manager.playlist = [];
            music_manager.fireEvent("onPlaylistChanged");
            break;

        default:
            console.error("Unknown message", msg);
            break;
    }
})
    

function searchMenuClick(info, tab) {
    console.log("info: ", info);
    console.log("tab: ", tab);
    console.log("Connected ports: ", connected_ports);

    Scrobbler.search(info.selectionText, function(response){ 
        browser.postMessage({method:"searchResult", html:response.html});
    })
}

if(window.chrome) {
    chrome.contextMenus.create({
      "title": "Search in Chromus", 
      "onclick": searchMenuClick,
      "contexts":["selection"]
    });

    chrome.tabs.onSelectionChanged.addListener(function(tab_id, select_info){      
        console.log("Tab selected", tab_id, select_info);
    })
}
