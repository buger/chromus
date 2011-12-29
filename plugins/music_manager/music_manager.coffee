# Track
# ------
class Track extends Backbone.Model    
    
    # All tracks should have it's unique random-generated id  
    initialize: -> 
        @set 'id': chromus.utils.uid() if not @id      
        
    title: ->
        "#{@get('song')} — #{@get('artist')}"


# Playlist
# ---------

# Contains Track objects
class Playlist extends Backbone.Collection
    model: Track
        

# Music manager
# ------------

# It manage all operations with playlist and controls playing.
class MusicManager extends Backbone.Model

    # Initialize manager with initial values
    initialize: ->
        _.bindAll @, "onPlaylistReset", "updateState"

        @playlist = new Playlist()
        @state = new Backbone.Model()
        @settings = new Backbone.Model()

        @playlist.bind 'reset', @onPlaylistReset
        @playlist.reset()

        @setPlayer()
        @setVolume()

    
    # Set object, used for playing music.
    # Right now only `iframe_player` is available.
    # In future will be added other players, like YouTube and etc...
    setPlayer: (player = 'iframe_player') ->
        @player.state.unbind() if @player

        @player = chromus.audio_players[player]
        @player.state.bind 'change', @updateState    
    

    # Stop playing if we reseting playlist
    onPlaylistReset:-> @stop()


    # Helper for getting current track object
    currentTrack: -> @playlist.get @get 'current_track'


    # Helper for getting next track
    nextTrack: ->
        return if not @get 'current_track'
        
        # If shuffle mode enabled, returning random track from playlist
        # FIXME: Thats not rights, tracks should not repeat
        if @settings.get('shuffle')
            @playlist.models[Math.floor(Math.random()*@playlist.length-1)]
        else            
            index = @playlist.indexOf @currentTrack()
            next_track = @playlist.models[index + 1] 
            
            # If repeat mode and playlist ended, first track
            # NOTE: Right now it's repeating only playlist not track
            if @settings.get('repeat') and !next_track
                return @playlist.first()
            else
                return next_track


    # Helper for getting previous track
    prevTrack: ->        
        index = @playlist.indexOf @currentTrack()
        @playlist.models[index - 1]

    
    # Clear state with default values
    setEmptyState: ->
        @state.set
            duration: 0
            played: 0
            buffered: 0
            name: "stopped"

    
    # It listens for `player.state` object change
    updateState: (state) ->        
        # Updating manager state. 
        # `player.state' object return 'buffered', 'played', 'duration' and 'state' variables
        @state.set state.toJSON()

        # Play next track if previous is finished
        if state.get('name') is "stopped"
            @play @nextTrack()

    
    # Searching audio url
    # Search is using sources defined in `chrous.audio_sources` dict
    searchTrack: (track, callback = ->) ->
        results = []

        # callback is called for each audio source
        searchCallback = => 
            unless _.isEmpty results
                # FIXME: Should chouse best matching song
                match = results[0]

                track.set
                    'file_url': match.file_url
                    'duration': match.duration

                if not track.get('source_title')
                    track.set
                        'source_title': match.source_title
                        'source_icon': match.source_icon

                callback track
            else 
                callback()

        for name, obj of chromus.audio_sources            
            obj.search 
                artist: track.get('artist')
                song: track.get('song')
            , (tracks) ->                
                results = _.union(results, tracks)
                searchCallback()
        
    
    # Play track
    #    
    # If you want to play track that already in `playlist`, 
    # you should pass Track object, or track_id
    play: (track) ->
        return unless track

        unless _.isObject track
            track = @playlist.get track

        unless _.isFunction track.get
            track = new Track(track)
        
        # If track is tagged as `action`, it is just trigger, 
        # and should not affect playing
        # Example: Last.FM radio -> 'Load next tracks'
        unless track.get('action')
            if track isnt @currentTrack() then @stop()
            
            # If media `type` is set, `current_track` should be changed 
            # after processing by `handleMediaType` function
            unless track.get('type')?
                @set 'current_track': track.id
            
            @state.set 'name':'loading'

        console.warn "trying to play track", track

        unless track.get 'type'
            # If track already have file_url, we can start playling immideatly
            if track.get 'file_url'
                @state.set 'name':'playing'
                @player.play track.toJSON()
            else
                # If search was successful play track, if not, 
                # try to get next track
                @searchTrack track, (track) => 
                    if track
                        @play track
                    else
                        @play @nextTrack()
        else
            @_handleMediaType track

    
    # Handle media type, registed by one of plugins    
    # Plugins can register it using `chromus.registerMediaType`
    _handleMediaType: (track, media_type = track.get('type')) ->
        console.warn "trying to handle media type", track

        unless media_handler = chromus.media_types[media_type]
            throw "Can't find handler for media type `#{media_type}`"

        media_handler track, (resp) =>
            # If handler returs multiple elements we should reset playlist
            # May change in future

            console.warn "resp", resp

            if _.isArray resp
                @playlist.reset resp
                @play @playlist.first()
            else
                track.set resp
                track.unset 'type'

                @play track
            
    
    # Pause playing
    pause: -> 
        @state.set 'name':'paused'
        @player.pause()

    
    # Preload given track
    preload: (track) -> 
        @player.preload track.toJSON()    

    
    # Stop playing, and reset variables containing information 
    # about previous track
    stop: -> 
        @unset 'current_track'
        @state.set {'name': 'stopped'}, silent: true
        @player.stop() if @player
        @setEmptyState()

    
    # Set track position. `value` should be in seconds.
    setPosition: (value) ->
        @player.setPosition(value)

    
    # Update overall volume. Shoud be between 0 and 100.
    setVolume: (volume) ->
        @volume = volume if volume?
        @player.setVolume @volume


    # Helper for getting volume
    getVolume: -> @volume ? 100

music_manager = new MusicManager()

# Register plugin
chromus.registerPlugin("music_manager", music_manager)


# Manage pokki idle detection
if browser.isPokki    
    music_manager.state.bind 'change', (state) ->
        if state.get('name') is 'playing'
            pokki.setIdleDetect('background', false)
        else
            pokki.setIdleDetect('background', true)