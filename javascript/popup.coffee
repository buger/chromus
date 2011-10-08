class Player extends Backbone.Model    

class PlayerView extends Backbone.View
    el: $('#wrapper')
    model: new Player()

    initialize: ->
        _.bindAll @, 'listener', 'changeState', 'updatePlaylist'

        @model.bind('change:state', @changeState)
        @model.bind('change:playlist', @updatePlaylist)

        browser.addMessageListener @listener

        browser.postMessage method:'getPlaylist'
        browser.postMessage method:'getSettings'

    changeState: ->
        classes = ['play', 'pause']
        classes.reverse() if @model.get('state').paused
        
        $('#header .control.play')
            .removeClass(classes[0])
            .addClass(classes[1])

    artistInLine: (start_from, arr) ->
        length = arr.length
        counter = 0

        if start_from >= length
            return counter

        for item in arr[start_from+1..length-1]        
            if item.artist?.replaceEntities() is 
               arr[start_from].artist?.replaceEntities()                   
                counter += 1
            else
                return counter
                        
        return counter         

    updatePlaylist: ->    
        merge_rows = 0
        
        playlist_tmpl = $('#playlist_tmpl')        
        playlist = @model.get('playlist')
        
        for track in playlist
            track.artist_image = Scrobbler.getImage({ artist: track.artist })
        
        pane = $("#playlist").data('jsp')

        if pane
            pane
                .getContentPane()
                .html playlist_tmpl.tmpl({ playlist:playlist })
            
            pane.reinitialise()
        else
            $('#playlist').html playlist_tmpl.tmpl({ playlist: playlist})
                            
            $("#playlist").jScrollPane
                maintainPosition: true        

        $('#playlist').css visibility:'visible'

    listener: (msg) -> 
        if msg.method isnt 'updateState'
            console.log "Popup received message", msg.method, msg
        
        data = {}
        for param in ['playlist','state','settings']
            data[param] = msg[param] if msg[param]?
        
        @model.set data        
        
$ -> browser.onReady -> new PlayerView()        