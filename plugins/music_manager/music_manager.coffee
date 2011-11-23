class Track extends Backbone.Model

    initialize: -> 
        if not @id
            @set 'id': chromus.utils.uid()

    title: -> "#{@get('artist')} #{@get('song')}"


class Playlist extends Backbone.Collection
    model: Track
        

class MusicManager extends Backbone.Model

    initialize: ->
        _.bindAll @, "onPlaylistReset", "updateState"

        @playlist = new Playlist()
        @state = new Backbone.Model()
        @settings = new Backbone.Model()

        @playlist.bind 'reset', @onPlaylistReset
        @playlist.reset()

        @setPlayer()
        @setVolume()

    
    setPlayer: (player = 'iframe_player') ->
        @player.state.unbind() if @player

        @player = chromus.audio_players[player]
        @player.state.bind 'change', @updateState


    pause: -> 
        @state.set 'name':'paused'
        @player.pause()

    play: (track) -> 
        @state.set 'name':'playing'
        @player.play track.toJSON()

    preload: (track) -> @player.preload track.toJSON()    

    stop: -> 
        @unset 'current_track'
        @state.set {'name': 'stopped'}, silent: true
        @player.stop() if @player
        @setEmptyState()


    setPosition: (value) ->
        @player.setPosition(value)
    

    onPlaylistReset:-> @stop()


    currentTrack: ->
        @playlist.get @get 'current_track'


    nextTrack: ->
        return if not @get 'current_track'
        
        if @settings.get('shuffle')
            @playlist.models[Math.floor(Math.random()*@playlist.length-1)]
        else
            index = @playlist.indexOf @currentTrack()
            next_track = @playlist.models[index + 1] 
            
            if @settings.get('repeat') and !next_track
                console.warn @playlist.first()
                return @playlist.first()
            else
                return next_track


    prevTrack: ->        
        index = @playlist.indexOf @currentTrack()
        @playlist.models[index - 1]


    setEmptyState: ->
        @state.set
            duration: 0
            played: 0
            buffered: 0
            name: "stopped"

    updateState: (state) ->
        @state.set state

        track = @currentTrack()
        
        track?.attributes.duration ?= state.duration     

        if @state.get('name') is "stopped"
            @playTrack @nextTrack()
        else if false and track?.get('duration') and ((@state.get('played') - track.get('duration'))|0) >= 0        
            @updateState name:"stopped"


    searchTrack: (track, callback = ->) ->        
        results = []

        searchCallback = => 
            unless _.isEmpty results
                # TODO: Should chouse best matching song
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
                @playTrack @nextTrack()

        for name, obj of chromus.audio_sources            
            obj.search 
                artist: track.get('artist')
                song: track.get('song')
            , (tracks) ->                
                results = _.union(results, tracks)
                searchCallback()
        

    playTrack: (track) ->
        if _.isNumber(track)
            track = @playlist.get(track)
        
        return unless track

        if not _.isFunction track.get
            track = new Track(track)


        if track isnt @currentTrack()
            @stop()
                    
        @state.set 'name':'loading'

        unless track.get('type')?
            @set 'current_track': track.id

            if track.get('file_url')
                @play track
            else                
                @searchTrack track, =>
                    @playTrack track
        else
            chromus.media_types[track.get('type')] track.toJSON(), (resp, reset = true) =>
                if reset
                    @playlist.reset resp
                    @playTrack @playlist.first().id
                else
                    track.set resp
                    track.unset 'type'

                    @playTrack track
                                

    setVolume: (volume) ->
        @volume = volume if volume?

        @player.setVolume @volume


    getVolume: -> @volume ? 100


    getState: ->
        @state.toJSON()

chromus.registerPlugin("music_manager", new MusicManager())