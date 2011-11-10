browser.toolbarItem.setBackgroundColor [51,153,204,255] #blue

music_manager = chromus.plugins.music_manager

music_manager.state.bind 'change', (state) ->
    track = music_manager.currentTrack()

    if track
        browser.toolbarItem.setTitle track.title()

    time_left = state.get('duration') - state.get('played')

    if state.get('name') is "stopped" or time_left <= 0
        browser.toolbarItem.setText("")
    else
        browser.toolbarItem.setText prettyTime(time_left)    

    browser.broadcastMessage
        method: "updateState"
        state: state
        track: track


music_manager.playlist.bind 'all', ->
    browser.postMessage
        method: "loadPlaylist"
        playlist: music_manager.playlist.toJSON()
        current_track: music_manager.get('current_track')
        state: music_manager.getState()


browser.addMessageListener (msg, sender, sendResponse) ->
    if !msg.method.match('(playerState|updateState)')
        console.log(msg.method, msg, sender)

    switch msg.method
        when "auth_token"
            scrobbler.getSession msg.token, (response) ->

                if response.session
                    window.localStorage['lastfm_session'] = response.session
                    window.localStorage['lastfm_username'] = response.username
                
                
                #TODO
                chrome.tabs.update sender.tab.id, url:chrome.extension.getURL("options.html"
        
        when "pause"
            music_manager.pause()

        when "play"
            browser.broadcastMessage method:"stop"

            if msg.playlist
                music_manager.playlist.reset msg.playlist
                music_manager.playTrack music_manager.playlist.first()
            else
                music_manager.playTrack(msg.track)                            
            
            music_manager.radio = undefined


        when "addToPlaylist"
            music_manager.playlist.add(msg.tracks)            

            console.warn msg.tracks, music_manager.playlist


        when "togglePlaying"
            if music_manager.state.get('name') is "paused" and music_manager.currentTrack()
                music_manager.play()
            else
                music_manager.pause()            


        when "nextTrack"
            music_manager.playTrack music_manager.nextTrack()


        when "previousTrack"
            music_manager.playTrack music_manager.prevTrack()


        when "getPlaylist"
            console.warn "getting playlist"

            browser.postMessage
                method: "loadPlaylist"
                playlist: music_manager.playlist.toJSON()
                current_track: music_manager.get('current_track')
                state: music_manager.getState()
                volume: music_manager.getVolume()

        when "setVolume"
            music_manager.setVolume(msg.volume)

        when "setPosition"
            music_manager.setPosition(msg.position)

        when "clearPlaylist"
            music_manager.radio = undefined
            music_manager.playlist.reset()

    
if browser.isChrome
    chrome.contextMenus.create
      "title": "Search in Chromus"
      "onclick": searchMenuClick
      "contexts":["selection"]

    chrome.tabs.onSelectionChanged.addListener (tab_id, select_info) ->
        console.log("Tab selected", tab_id, select_info)