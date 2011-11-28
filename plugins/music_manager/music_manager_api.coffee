# Events API for working with `MusicManager`
# ------------------------------------------

music_manager = chromus.plugins.music_manager

browser.addMessageListener (msg, sender, sendResponse) ->
    if !msg.method.match('(playerState|updateState)')
        console.log(msg.method, msg, sender)

    switch msg.method        
        when "pause"
            music_manager.pause()

        when "play"
            if _.isArray msg.track
                music_manager.playlist.reset msg.track
                music_manager.play music_manager.playlist.first()
            else
                music_manager.play msg.track        


        when "addToPlaylist"
            for track in msg.tracks
                if track.type
                    track = new Backbone.Model(track)

                    chromus.media_types[track.get('type')] track, (resp) =>
                        music_manager.playlist.remove(track)
                        music_manager.playlist.add(resp)
                else
                    music_manager.playlist.add(track)

        when "nextTrack"
            music_manager.play music_manager.nextTrack()

        when "previousTrack"
            music_manager.play music_manager.prevTrack()

        when "setVolume"
            music_manager.setVolume(msg.volume)

        when "setPosition"
            music_manager.setPosition(msg.position)

        when "setSettings"
            music_manager.settings.set msg.data

        when "clearPlaylist"
            music_manager.playlist.reset()
            