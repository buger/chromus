function stopCurrentTrack(){
    var current_playing = document.querySelector("a.sm2_button.playing, a.sm2_button.paused, a.sm2_button.loading")

    console.log("Stopping current track:", current_playing)

    if(current_playing)
        current_playing.className = "sm2_button"
}

function getTrackInfo(button){
    var container = findParent(button, "ex_container")
    
    var streamable = false

    if(container.className.match('fdl'))
        streamable = 'free'
    else if(container.className.match('streamable'))
        streamable = true

    return {
        artist:     container.getAttribute('data-artist'),
        song:       container.getAttribute('data-song'),
        track_id:   container.getAttribute('data-track-id'),     
        index:      parseInt(container.getAttribute('data-index-number')),
        
        element_id: button.id,
        streamable: streamable
    }
}


var tracks_cache = {}
function getPlaylist(button){
    var container = findParent(button, 'with_vk_search')

    var tracks = []

    var index = container.getAttribute('data-index-number')
    if(tracks_cache[index]){
        tracks = tracks_cache[index]
    } else {
        var tracks = []
        var track
        var buttons = container.querySelectorAll("a.sm2_button")

        for(var i=0; i<buttons.length; i++){
            track = getTrackInfo(buttons[i])
            track.index = i
            
            tracks.push(track)
        }

        tracks_cache[index] = tracks
    }

    return tracks
}


var port_initialized = false
var port

function initializePort(){
    port = chrome.extension.connect({name: "page", reconnect:port_initialized})

    port.onMessage.addListener(function(msg){
        console.log("Received message:", msg)

        if(msg.method == "setSearchPattern") {
            preparePage(msg.search_pattern)

        } else if(msg.method == "stop") {
            stopCurrentTrack()

        } else if(msg.method == "loading") {
            var button = document.getElementById(msg.element_id)
            button.className = "sm2_button loading"

        } else if(msg.method == "readyToPlay") {
            stopCurrentTrack()

            var button = document.getElementById(msg.element_id)

            if(msg.error){
                button.className = "sm2_button disabled"
                button.title = msg.error
            } else {
                button.className = "sm2_button playing"
            }
        }
    })

    port.onDisconnect.addListener(function(msg){
        port = null
    })

    port_initilized = false
}
initializePort()


function preparePage(search_pattern){
    var customEvent = document.createEvent('Event');
    customEvent.initEvent('ex_play', true, true);

    manager.search_pattern = search_pattern
    manager.wrapMusicElements()
}


document.body.addEventListener('click', function(evt){
    if(!port)
        initializePort() 

    var target = evt.target

    if(target.className.match('sm2_button')){              
        if(target.className.match('disabled'))
            return

        var track_info = getTrackInfo(target)

        if(target.className.match('playing')){
            port.postMessage({method:'pause', track: track_info})
            target.className = "sm2_button paused"
        } else {
            if(!target.className.match('paused'))
                stopCurrentTrack()                          

            target.className = "sm2_button loading"    
            
            port.postMessage({method:'play', track: track_info, playlist: getPlaylist(target)})
        }
    }
}, false)


// Tabs when switching in charts
var tabs = document.querySelectorAll('.horizontalOptions')

for(var i=0; i<tabs.length; i++){
    tabs[i].addEventListener('click', function(){
        setTimeout(function(){manager.wrapMusicElements()}, 1000)
    }, false)
}

if(window.location.toString().match(/yandex.ru\/white\.html/)){
    if(match = window.location.toString().match(/token=(.*)/)){    
        document.forms.web.text.style.display = 'none'
        
        port.postMessage({method:'auth_token', token: match[1]})
        //window.location = chrome.extension.getURL("options.html")
    }
}

