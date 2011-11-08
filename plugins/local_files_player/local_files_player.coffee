class Player extends Backbone.Model
    
    initialize: ->
        @iframe_player = chromus.audio_players.iframe_player
        @background_playing = browser.isChrome or browser.isFirefox

        _.bindAll @
        
        browser.addMessageListener @listener        
           
    
    listener: (msg) ->
        switch msg.method
            when 'localPlayer:fileContent'                
                @callback ?= ->

                console.warn 'received file content', msg
                
                @callback file_url: msg.content
                
    
    search: (track, callback) ->
        browser.postMessage
            method: "localPlayer:getContent"
            id: track.id

        @callback = callback


@chromus.registerPlayer("local_files_player", new Player())