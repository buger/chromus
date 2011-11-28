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


for event in ['reset','add','create', 'change:song']
    music_manager.playlist.bind event, ->
        browser.postMessage
            method: "loadPlaylist"
            playlist: music_manager.playlist.toJSON()
            current_track: music_manager.get('current_track')
            state: music_manager.state.toJSON()


music_manager.settings.bind 'change', (settings) ->
    browser.postMessage
        method: "updateSettings"
        settings: settings.toJSON()


# Listen for messages
browser.addMessageListener (msg, sender, sendResponse) ->
    switch msg.method
        when "ui:init"
            browser.postMessage
                method: "loadPlaylist"
                playlist: music_manager.playlist.toJSON()
                current_track: music_manager.get('current_track')
                state: music_manager.state.toJSON()
                volume: music_manager.getVolume()
                settings: music_manager.settings.toJSON()