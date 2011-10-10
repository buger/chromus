class Player extends Backbone.Model
    initialize: ->
        _.bindAll @, "listener"

        browser.addMessageListener @listener


    play: (track = @get('current_track')) ->
        @set { 'current_track':track }

        @attributes.state.paused = false
        @trigger 'change:state'

        browser.postMessage { method:'play', track: parseInt(track) }


    pause: ->
        @attributes.state.paused = true
        @trigger 'change:state'

        browser.postMessage { method:'pause' }


    next: ->        
        browser.postMessage { method:'nextTrack' }

    
    getCurrentTrack: ->
        @get('playlist')[@get('current_track')]       


    listener: (msg) ->
        if msg.method isnt 'updateState'
            console.log "Popup received message", msg.method, msg
        
        data = {}
        for param in ['playlist','state','settings', 'current_track']
            data[param] = msg[param] if msg[param]?
        
        @set data        

        if msg.track
            @get('playlist')[msg.track_index] = msg.track
            
        switch msg.method
            when 'play', 'readyToPlay', 'loading'
                @attributes.playlist[msg.track_index] = msg.track
                @attributes.current_track = msg.track_index
                @trigger 'change:current_track'

            when 'stop'
                @attributes.state.paused = false
                @trigger 'change:state'   



class Controls extends Backbone.View
    el: $('#header') 
    events:
        "click .toggle": "togglePlaying"
        "click .next":   "nextTrack"
        "click .search": "toggleSearch"
        "keyup .search_bar .text": "search",
        "click .search_bar .result .sm2_button": "playSearchedTrack"

    initialize: ->
        _.bindAll @, "updateState", "togglePlaying", "search"

        @model.bind 'change:state', @updateState

    updateState: ->
        state = @model.get 'state'

        @$('.toggle')
            .removeClass('play pause')
            .addClass(
                if state.paused or state.finished then 'play' else 'pause'
            )

        state.played ?= 0
        @$('.inner').width(276.0*state.played/state.duration)
        @$('.time').html prettyTime(state.played)

        state.buffered ?= 0
        @$('.progress').width(278.0*state.buffered/state.duration)


    togglePlaying: ->
        if @model.get('state').paused
            @model.play()
        else
            @model.pause()        
    

    nextTrack: ->
        @model.next()

    
    toggleSearch: ->
        bar = @$('.search_bar').toggle()

        bar.find('input').focus() if bar.is ':visible'
    
    # Rate limiting search function, by adding slight delay
    # http://documentcloud.github.com/underscore/#debounce
    search: _.debounce (evt) ->            
        text = evt.currentTarget.value
        
        if not text.trim()
            @$('.search_bar .result').html('')
        else
            Scrobbler.search text, (response) =>
                @$('.search_bar .result').html(response.html)
    , 300   
    
    playSearchedTrack: (evt) ->
        track_info = getTrackInfo(evt.currentTarget)

        browser.postMessage
            method:   'play'
            track:    track_info
            playlist: [ track_info ]

        @toggleSearch()
                              

class TrackInfo extends Backbone.View
    el: $('#current_song')
    template: $('#track_info_tmpl')

    initialize: ->
        _.bindAll @, "updateInfo"

        @model.bind 'change:current_track', @updateInfo
        @model.bind 'change:playlist', @updateInfo

    updateInfo: ->
        # If nothing playing, hide all info
        if not @model.get('current_track')?
            return @el.empty()  
            
        
        track = @model.getCurrentTrack()        
        track.image = Scrobbler.getImage
                        artist: track.artist
                        song: track.song

        last_fm = "http://last.fm/music"
        track.artist_url = "#{last_fm}/#{track.artist}"
        track.album_url = "#{last_fm}/#{track.artist}/#{track.album}"
        track.song_url = "#{last_fm}/#{track.artist}/_/#{track.song}"
        
        @el.html(@template.tmpl(track))
            .show()

                                

class Playlist extends Backbone.View
    el: $('#playlist')

    events: 
        "click #playlist .song": "togglePlaying"

    initialize: ->
        _.bindAll @, 'updatePlaylist', 'updateCurrentTrack'

        @model.bind 'change:playlist', @updatePlaylist
        @model.bind 'change:current_track', @updateCurrentTrack

    
    togglePlaying: (evt) ->
        index = $.attr evt.currentTarget, 'data-index'        
        
        if @model.get('current_track') is index
            @model.pause()
        else
            @model.play index
        

    updateCurrentTrack: ->
        @$('.playing').removeClass('playing')

        @$(".song")
            .eq(@model.get('current_track'))
                .addClass("playing")
                                    

    artistPlaylistCount: (artist, start_from) ->        
        count = 0
        
        for track in @model.get('playlist')[start_from..]
            count += 1 if track.artist is artist

        count


    updatePlaylist: ->    
        merge_rows = 0
        
        playlist_tmpl = $('#playlist_tmpl')
        playlist = @model.get('playlist')
        
        for track in playlist
            track.artist_image = Scrobbler.getImage({ artist: track.artist })
            track.previous = playlist[_i-1]
            track.next = playlist[_i+1]

            if not track.previous or track.previous.artist isnt track.artist
                track.artist_playlist_count = @artistPlaylistCount(track.artist, _i)
        
        pane = @el.data('jsp')

        if pane
            pane.getContentPane()
                .html playlist_tmpl.tmpl({ playlist:playlist })
            
            pane.reinitialise()
        else
            @el.html playlist_tmpl.tmpl({ playlist: playlist})
                            
            @el.jScrollPane
                maintainPosition: true        

        $('#playlist').css visibility:'visible'


class App extends Backbone.View
    initialize: ->        
        @model = new Player()

        new Playlist { model:@model }
        new Controls { model:@model }
        new TrackInfo { model:@model }
        
    start: ->        
        browser.postMessage method:'getPlaylist'
        browser.postMessage method:'getSettings'

app = new App()


$ -> browser.onReady -> app.start()    
