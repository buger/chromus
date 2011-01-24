browser.toolbarItem.setBackgroundColor([51,153,204,255]); //blue

var scrobbler = new Scrobbler(window.localStorage["lastfm_session"], window.localStorage["lastfm_username"])

var music_manager = new MusicManager(scrobbler);

music_manager.dispatcher.addEventListener('onPlay', function(){
    var track = music_manager.playlist[music_manager.current_track];

    if (track.not_found) {
        browser.broadcastMessage({
            method:"readyToPlay", 
            error:'not_found', 
            element_id: track.element_id
        });
    } else {
        browser.toolbarItem.setTitle(track.artist +' - '+ track.song);

        browser.broadcastMessage({
            method:"readyToPlay", 
            element_id:track.element_id
        });
    }
}, true);


music_manager.dispatcher.addEventListener('onEnded', function(){
    browser.toolbarItem.setText("");

    browser.broadcastMessage({method:"stop"});
}, true);


music_manager.dispatcher.addEventListener('onLoading', function(){
    var track = music_manager.playlist[music_manager.current_track];

    if (track.element_id) {
        browser.broadcastMessage({
            method:"loading", 
            element_id:track.element_id, 
            track: music_manager.current_track
        });
    }
}, true);


music_manager.dispatcher.addEventListener('onPlay', function(){
    var track = music_manager.playlist[music_manager.current_track];

    if(track.element_id) {
        browser.broadcastMessage({
            method:"play", 
            element_id:track.element_id, 
            track: music_manager.current_track, 
            track_info: track
        });
    }
}, true);


function updateTime(){
    var track = music_manager.playlist[music_manager.current_track]

    var state = music_manager.getState();

    if (!state) {
        return setTimeout(updateTime, 500);
    }

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
        state: music_manager.getState()            
    });

    setTimeout(updateTime, 500);
}

updateTime()

browser.addMessageListener(function(msg, sender) {
    console.log(msg.method, msg)

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
                music_manager.playlist = msg.playlist
                delete music_manager.current_track
            }

            if(typeof(msg.track) == "number")
                msg.track = music_manager.playlist[msg.track];

            music_manager.play(msg.track)

            break;

        case "add_to_playlist":
            var track = msg.track;
            track.index = music_manager.playlist.length;

            music_manager.playlist.push(track);
            music_manager.updateID3Info(music_manager.playlist.length-1);

            break;

        case "search":
            Scrobbler.search(msg.search_text, function(response){
                console.log("Received response searchResult");

                browser.postMessage({method:"searchResult", html:response.html});
            });

            break;

        case "togglePlaying":
            if(music_manager.state.paused && music_manager.current_track) {
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
            sender.postMessage({
                method: "loadPlaylist", 
                playlist: music_manager.playlist, 
                current_track: music_manager.current_track,
                state: music_manager.getState()
            });

            break;

        case "setVolume":
            music_manager.setVolume(msg.volume);

            break;

        default:
            console.log("Unknown message", msg);
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
