Handlebars.registerHelper 'spinner', (context) ->
    "<span class='spinner'></span>"


# TODO: Refactor
Handlebars.registerHelper 'lfm_img', (context) ->
    context.images ?= context.image
    return "about:blank" unless context.images

    image = context.images[0]
    
    if typeof(context.images[0]) isnt "string"
        try
            context.images[1]["#text"]
        catch
            console.warn context.images
    else
        context.images[0]


class Track extends Backbone.Model    

class Playlist extends Backbone.Collection
    model: Track


class Player extends Backbone.Model
    initialize: ->
        _.bindAll @, "listener"

        @playlist = new Playlist()

        @state = new Backbone.Model()

        @settings = new Backbone.Model
            repeat: false
            shuffle: false

        browser.addMessageListener @listener

    
    currentTrack: ->
        @playlist.get @get 'current_track'        


    play: (track = @get('current_track')) ->
        @set 'current_track':track
        @playlist.trigger 'reset'

        @state.set 'name':'playing'

        browser.postMessage { method:'play', track: parseInt(track) }


    pause: ->
        @state.set 'name':'paused'    
        browser.postMessage { method:'pause' }


    next: ->        
        browser.postMessage { method:'nextTrack' }

    setPosition: (position) ->
        @state.set 'played': position

        browser.postMessage { method:'setPosition', position:position }

    setVolume: (volume) ->
        @set 'volume': volume

        browser.postMessage { method:'setVolume', volume:volume }

    setSettings: (data) ->
        @settings.set data

        browser.postMessage { method: 'setSettings', data: data }

    listener: (msg) ->
        return if msg.method.match("^sm2")

        if !msg.method.match('(playerState|updateState)')
            console.log "Popup received message", msg.method, msg
        else
            if msg.state.name in ["playing", "loading"]                
                @playlist.get(msg.track.id).set(msg.track)
                @set 'current_track': msg.track.id
        
        @settings.set msg.settings if msg.settings?

        @set 'volume': msg.volume if msg.volume?
        @state.set msg.state if msg.state?                    
        
        @playlist.reset msg.playlist if msg.playlist
                


class Controls extends Backbone.View    

    el: $('#header') 

    search_template: Handlebars.compile($('#search_result_tmpl').html()),

    events:
        "click .inner": "setPosition"
        "click .progress": "setPosition"
        "click .toggle": "togglePlaying"
        "click .next":   "nextTrack"
        "click .search": "toggleSearch"
        "keyup .search_bar .text": "search"
        "click .search_bar .result a": "playSearchedTrack"
                

    initialize: ->
        _.bindAll @, "updateState", "togglePlaying", "search"

        @model.state.bind 'change', @updateState

        opts = 
            lines: 8
            length: 2
            width: 2
            radius: 3
            color: "#fff"

        @spinner = new Spinner(opts)

        @updateState(@model.state)


    updateState: (state) ->
        track = @model.currentTrack()
        state = state.toJSON()

        toggle = @$('.toggle').removeClass('play pause')

        @spinner.stop()
            
        switch state.name
            when "playing","stopped" then toggle.addClass('play')
            when "paused" then toggle.addClass('pause')
            when "loading" then @spinner.spin(toggle[0])
            else toggle.addClass('play')

        
        if track?.get('duration')
            @$('.inner').width(276.0*state.played/track.get('duration'))
            @$('.time').html "-"+prettyTime(track.get('duration') - state.played)

            state.buffered ?= 0
            @$('.progress').width(278.0*state.buffered/track.get('duration'))
        else
            @$('.time').html prettyTime(0)
    

    setPosition: (evt) ->
        track = @model.currentTrack()

        position = (evt.offsetX/278) * track.get('duration')

        @model.setPosition position
                

    togglePlaying: ->
        if @model.state.get('name') is "paused"
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
        return if evt.keyCode in [40,45,37,39,38]        

        text = evt.currentTarget.value
        
        if not text.trim()
            @$('.search_bar .result').html('')
        else
            view =
                'show_tracks': (fn) -> if not @tracks or @tracks?.length then fn(this)
                'show_albums': (fn) -> if not @albums or @albums?.length then fn(this)
                'show_artists': (fn) -> if not @artists or @artists?.length then fn(this)            

            render = =>
                @$('.search_bar .result').html(@search_template(view))
                    .end()
                    .find('.loader').spin('small');

            render()

            chromus.plugins.lastfm.artist.search text, (artists = []) =>
                view.artists = _.first(artists, 4)
                render()
            
            chromus.plugins.lastfm.track.search text, (tracks = []) =>
                view.tracks = _.first(tracks, 4)
                render()                            

            chromus.plugins.lastfm.album.search text, (albums = []) =>
                view.albums = _.first(albums, 4)
                render()
    , 500

    
    playSearchedTrack: (evt) ->
        track_info = getTrackInfo(evt.currentTarget)

        browser.postMessage
            method:   'play'
            track:    track_info
            playlist: [ track_info ]

        @toggleSearch()    
                              

class TrackInfo extends Backbone.View
    el: $('#current_song')

    events: 
        "click .album_img": "albumCover"

    template: Handlebars.compile($('#track_info_tmpl').html()),

    initialize: ->
        _.bindAll @, "updateInfo"

        @model.bind 'change:current_track', @updateInfo
        @model.playlist.bind 'all', @updateInfo
        
                
    updateInfo: ->
        track = @model.currentTrack()?.toJSON()

        # If nothing playing, hide all info
        if not track
            return @el.empty()                      

        track.images ?= [chromus.plugins.lastfm.image artist: track.artist]

        last_fm = "http://last.fm/music"
        track.artist_url = "#{last_fm}/#{track.artist}"
        track.album_url = "#{last_fm}/#{track.artist}/#{track.album}"
        track.song_url = "#{last_fm}/#{track.artist}/_/#{track.song}"        
        
        @el.html(@template(track))
            .show()

    
    albumCover: ->
        return false

        track = @model.currentTrack()        

        if track.get('images').length
            img = new Image()

            src = _.last track.get('images')
            src = src['#text'] if typeof(src) isnt "string"                

            img.src = src

            img.onclick = ->
                $('#dialog').hide()

            $('#dialog .content').html img
            $('#dialog').show()


class Footer extends Backbone.View
    el: $('#footer')

    events:
        "click .menu": "toggleMenu"
        "click .volume": "toggleVolume"
        "click .volume_bar .bar_bg": "setVolume"
        "click .shuffle": "toggleShuffle"
        "click .repeat": "toggleRepeat"

    initialize: ->
        _.bindAll @

        @model.bind 'change:volume', @updateVolume
        @model.settings.bind 'change', @updateSettings
        @updateVolume()


    toggleMenu: ->
        $('#main_menu').toggle()

    
    toggleVolume: ->
        @model.setVolume(0)        

    setVolume: (evt) ->
        total_width = @$('.volume_bar .bar_bg').width()
        volume = evt.layerX/total_width * 100
        
        @model.setVolume(volume)
                

    updateVolume: ->
        @$('.volume_bar .bar').css width: @model.get('volume')+"%"


    toggleShuffle: ->
        @model.setSettings 'shuffle':!@$('.shuffle').hasClass('active')
    
    toggleRepeat: ->
        @model.setSettings 'repeat':!@$('.repeat').hasClass('active')

    updateSettings: ->
        @$('.shuffle').toggleClass('active', @model.settings.get('shuffle'))
        @$('.repeat').toggleClass('active', @model.settings.get('repeat'))
    
                                    

class PlaylistView extends Backbone.View

    el: $('#playlist')

    template: Handlebars.compile($('#playlist_tmpl').html()),

    events: 
        "click #playlist .song": "togglePlaying"

    initialize: ->
        _.bindAll @, 'updatePlaylist'

        @model.playlist.bind 'all', @updatePlaylist
        @model.bind "change:current_track", @updatePlaylist

        @scroll = new iScroll('playlist', { bounce: false })
                
    
    togglePlaying: (evt) ->
        id = + $.attr evt.currentTarget, 'data-id'
        
        if @model.get('current_track') is id
            @model.pause()
        else
            @model.play id
        
    artistPlaylistCount: (artist, start_from) ->        
        count = 0

        for track in @model.playlist.models[start_from..start_from+3]
            count++ if track.get('artist') is artist

        count


    updatePlaylist: ->
        merge_rows = 0
                
        playlist = @model.playlist.toJSON()
        
        for track in playlist
            track.images ?= [chromus.plugins.lastfm.image artist: track.artist]
            track.previous = playlist[_i-1]
            track.next = playlist[_i+1]

            if not track.previous or track.previous.artist isnt track.artist
                track.artist_playlist_count = @artistPlaylistCount(track.artist, _i)    

        view = 
            playlist: playlist        

        model = @model
            
        helpers =
            is_previous: (fn) ->
                if not @previous or @previous.artist isnt @artist then fn(@)

            is_next: (fn) ->                
                if not @next or @next.artist isnt @artist then fn(@)

            title: (fn) -> 
                if @type is 'artist'
                    "Loading..."
                else
                    @song or @name

            more_then_two: (fn) -> if @artist_playlist_count > 2 then fn(@)

            is_current: (fn) -> if @id is model.get('current_track') then fn(@)


        helpers = _.defaults helpers, Handlebars.helpers        
    
        @el.find('.container').html @template view, helpers: helpers        
        @el.css visibility:'visible'

        @el.find('.track_container:odd').addClass('odd')

        @scroll.refresh()

        if @scroll.vScrollbar and playlist.length and model.get('current_track')
            @scroll.scrollToElement @el.find(".track_container[data-id=#{model.get('current_track')}]")[0]


class App extends Backbone.View
    initialize: ->        
        @model = new Player()

        @playlist = new PlaylistView { model:@model }
        @controls = new Controls { model:@model }
        @track_info = new TrackInfo { model:@model }
        @footer = new Footer { model:@model }

        $('#dialog').bind 'click', (evt) ->
            if evt.target.id is "dialog"
                $('#dialog').hide()

        if browser.isPokki
            $('#minimize').bind 'click', ->
            pokki.closePopup()

                
    start: ->        
        browser.postMessage method:'ui:init'

@app = new App()


$ -> browser.onReady -> app.start()