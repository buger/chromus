function stopCurrentTrack(){
    var current_playing = document.querySelector("a.sm2_button.playing, a.sm2_button.paused, a.sm2_button.loading")

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

    var track_info = {
        artist:     container.getAttribute('data-artist'),
        song:       container.getAttribute('data-song'),
        album:      container.getAttribute('data-album'),
        track_id:   container.getAttribute('data-track-id'),
        index:      parseInt(container.getAttribute('data-index-number')),
        
        element_id: button.id,
        streamable: streamable
    }

    for(key in track_info)
        if(track_info[key] == undefined) 
            delete track_info[key]
    
    return track_info
}


var tracks_cache = {}

/**
    getPlaylist(button) -> Array

    Get all tracks in music block, where button is    
**/
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
            track.lastIndex = -1
            
            tracks.push(track)
        }

        tracks_cache[index] = tracks
    }

    return tracks
}

function showOverloadWindow(){
    var image_url = chrome.extension.getURL('lastfm_128.png')

    var wnd = document.createElement('div')
    wnd.className = 'dialogBox ex_overload_window'
    wnd.innerHTML = "<a href='javascript:;' class='dialogStatus dialogClose' onclick=\"this.parentNode.style.display = 'none'\"></a>"+
                    "<h3 class='ex_header' style='background-image:url("+image_url+")'>Last.fm free music player</h3>"+
                    "<div class='dialogContent'>"+
                        "<p class='ex_title'>We are out of capacity :(</p>"+
                        "<p>If you don't want to see this window and play music without limits, you must be logged at <a href='http://vk.com'>http://vk.com</a> or <a href='http://vkontakte.ru'>http://vkontakte.ru</a>, or you can try play track later.</p>"+
                        "<p>To be clear, this is not advertising, it is due technical reasons.</p>"+
                    "</div>" 

    document.body.appendChild(wnd)
}


var port_initialized = false
var port

/**
    initializePort() 

    Connecting to background page and initializing callback listener
**/
function initializePort(){
    port = chrome.extension.connect({ name: "page" })

    port.onMessage.addListener(function(msg){
        console.log("Received message:", msg)

        if(msg.method == "setSettings") {
            preparePage(msg.search_pattern, msg.external_audio_search)

        } else if(msg.method == "stop") {
            stopCurrentTrack()

        } else if(msg.method == "loading") {
            var button = document.getElementById(msg.element_id)
            if(button)
                button.className = "sm2_button loading"

        } else if(msg.method == "readyToPlay") {
            stopCurrentTrack()

            var button = document.getElementById(msg.element_id)
            
            if(button)
                if(msg.error){
                    button.className = "sm2_button disabled"
                    if(msg.error == 'not_found')
                        button.title = "Track not found"
                    else if (msg.error == 'overload') {
                        button.title = "Server overload. Try later."                    
                        button.className = "sm2_button"

                        showOverloadWindow()
                    } else {
                        button.title = msg.error
                    }
                } else {
                    stopCurrentTrack()
                    
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


/**
    preparePage(search_pattern)

    Must be called after page load.
**/
function preparePage(search_pattern, external_audio_search){
    var customEvent = document.createEvent('Event');
    customEvent.initEvent('ex_play', true, true);

    manager.search_pattern = search_pattern
    manager.wrapMusicElements(external_audio_search == "true")
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
            
            if(target.className.match('paused'))
                port.postMessage({method:'play', track: track_info})
            else
                port.postMessage({method:'play', track: track_info, playlist: getPlaylist(target)})

            target.className = "sm2_button loading"                            
        }
    }
}, false)


// Tabs when switching in charts
var tabs = document.querySelectorAll('.horizontalOptions, .nextPage, .previousPage')

for(var i=0; i<tabs.length; i++){
    tabs[i].addEventListener('click', function(){
        setTimeout(function(){manager.wrapMusicElements(false)}, 1000)
    }, false)
}
