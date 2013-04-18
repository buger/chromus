function ease(x) {
      return (1-Math.sin(Math.PI/2+x*Math.PI))/2;
    }
    
    var rotation = 0
    var animationSpeed = 10
    var animationFrames = 26
    var canvasContext
    var canvas

    function animateFlip() {
      rotation += 1/animationFrames;
      drawIconAtRotation();

      if (rotation <= 1) {
        setTimeout(animateFlip, animationSpeed);
      } else {
        rotation = 0;

        chrome.browserAction.setIcon({path:chrome.extension.getURL('lastfm_128.png')});
      }
    }

    function drawIconAtRotation() {
      canvasContext.save();
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.translate(
          Math.ceil(canvas.width/2),
          Math.ceil(canvas.height/2));
      canvasContext.rotate(2*Math.PI*ease(rotation));
      canvasContext.drawImage(document.getElementById('lastfm_icon'),
          -Math.ceil(canvas.width/2),
          -Math.ceil(canvas.height/2));
      canvasContext.restore()

      chrome.browserAction.setIcon({imageData:canvasContext.getImageData(0, 0, canvas.width,canvas.height)});
    }

    chrome.browserAction.setBadgeBackgroundColor({color:[51,153,204,255]}) //blue
    
    var scrobbler = new Scrobbler(window.localStorage["lastfm_session"], window.localStorage["lastfm_username"])

    var music_manager = new MusicManager(scrobbler)

    music_manager.dispatcher.addEventListener('onPlay', function(){
        var track = music_manager.playlist[music_manager.current_track]

        if(!track.not_found)
            chrome.browserAction.setTitle({title: track.artist +' - '+ track.song})       

        if(active_port){
            if(track.not_found)
                active_port.postMessage({method:"readyToPlay", error:'not_found', element_id: track.element_id})
            else
                active_port.postMessage({method:"readyToPlay", element_id:track.element_id})
        }
    }, true)

    music_manager.dispatcher.addEventListener('onEnded', function(){
        chrome.browserAction.setBadgeText({text:''})

        if(active_port)
            active_port.postMessage({method:"stop"})
    }, true)

    music_manager.dispatcher.addEventListener('onLoading', function(){
        var track = music_manager.playlist[music_manager.current_track]

        if(active_port && track.element_id)
            active_port.postMessage({method:"loading", element_id:track.element_id})
    }, true)

    
    function updateTime(){
        var track = music_manager.playlist[music_manager.current_track]

        if(!music_manager.audio.paused){
            if(music_manager.audio.duration && track && track.duration && music_manager.audio.currentTime){
                var time_left = track.duration - music_manager.audio.currentTime

                if(time_left > 0)
                    chrome.browserAction.setBadgeText({text:prettyTime(time_left)})
                else
                    chrome.browserAction.setBadgeText({text:""})
            } else {
                chrome.browserAction.setBadgeText({text:""})
            }
        }

        setTimeout(updateTime, 1000)
    }
    
    var connected_ports = []

    var active_port

    function onLoad(){    
        if (window.localStorage["latest_playlist"]) {
            music_manager.playlist = JSON.parse(window.localStorage["latest_playlist"]);
        }

        if (window.localStorage['play_mode']) {
            music_manager.play_mode = window.localStorage['play_mode'];
        }

        if (window.localStorage['stop_after_playing']) {
            music_manager.stop_after_playing = window.localStorage['stop_after_playing'];
        }

        if (window.localStorage['repeat_mode']) {
            music_manager.repeat_mode = window.localStorage['repeat_mode'];
        }

        updateTime()

        canvas = document.getElementById('canvas')
        canvasContext = canvas.getContext('2d')

        chrome.extension.onConnect.addListener(function(port) {
            console.log("Connected:", port)
            
            if(port.name == "popup")
                popup_port = port

            connected_ports.push(port)            

            port.onMessage.addListener(function(msg) {
                console.log(msg.method, msg)

                _gaq.push(['_trackEvent', 'msgReceived', msg.method]);

                if(msg.method == "auth_token"){
                    scrobbler.getSession(msg.token, function(response){
                        console.log("Getting session:", response)

                        if(response.session){
                            window.localStorage['lastfm_session'] = response.session
                            window.localStorage['lastfm_username'] = response.username
                        }
                        
                        chrome.tabs.update(port.sender.tab.id, {url:chrome.extension.getURL("options.html")})
                    })


                } else if(msg.method == "logout") {
                    scrobbler._username = null
                    scrobbler._session_key = null

                } else if(msg.method == "pause") {
                    music_manager.pause()
                    
                } else if(msg.method == "play"){
                    if(active_port && active_port != port && port.name != "popup")
                        active_port.postMessage({method:"stop"})                    

                    if(port.name != "popup")
                        active_port = port

                    if(msg.playlist) {
                        music_manager.playlist = msg.playlist
                        
                        window.localStorage["latest_playlist"] = JSON.stringify(msg.playlist);

                        delete music_manager.current_track
                    }

                    music_manager.play(msg.track)
                }
            })

            port.onDisconnect.addListener(function(msg){
                var index;

                for (var i=0; i<connected_ports.length; i++) {
                    if (port.portId_ == connected_ports[i].portId_) {
                        connected_ports.splice(i, 1);
                    }
                }

                
                if(port.name == "popup")
                    popup_port = undefined;
                    
                if (active_port.portId_ == port.portId_)
                    active_port = undefined;
                    
                console.log("Port disconnected", port, active_port.portId_ == port.portId_, active_port);
            })


            search_pattern = window.localStorage["search_pattern"]                            
            if(search_pattern == undefined)
                search_pattern = "http://vkontakte.ru/gsearch.php?section=audio&q=%s"
            
            port.postMessage({method:'setSettings', 
                              search_pattern: search_pattern, 
                              external_audio_search: window.localStorage["external_search"]})
        })


        if (false && !window.localStorage["new_changes_2.9.692"]) {
            if(!window.webkitNotifications) return

            var notification = window.webkitNotifications.createNotification(chrome.extension.getURL('lastfm_128.png'), "Last.fm free music player updated", "Fixed playing in Chrome 19")
            notification.show()
            setTimeout(function(){notification.cancel()}, 10000)

//            chrome.tabs.create({url: chrome.extension.getURL("options.html")});
        }
        // _gaq.push(['_trackPageview']);
        
    }

    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.method === "toggle") {
                music_manager.audio.paused ? music_manager.audio.playOrLoad() : music_manager.pause();
            } else if (request.method === "nextTrack") {
                music_manager.playNextTrack();
            }
        }
    );

if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", function(){ onLoad(); }, false);