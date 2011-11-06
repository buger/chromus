class Player extends Backbone.Model
    
    initialize: ->
        @iframe_player = chromus.audio_players.iframe_player
        @background_playing = browser.isChrome or browser.isFirefox

        _.bindAll @
        
        browser.addMessageListener @listener
        @listener()        

    
    listener: (msg) ->
        return if !msg
        
        switch msg.method
            when "localPlayer:addFiles"
                console.log('adding files to playlist')
                chromus.music_manager.playlist.add msg.files

        #localPlayer:files_added

    
    play: (track) ->


    preload: (track) ->


    pause: ->


    setVolume: (value) ->        


@chromus.registerPlayer("local_files_player", new Player())