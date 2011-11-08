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
        @player.stop()


    setPosition: (value) ->
        @player.setPosition(value)
        

    onPlaylistReset:->
        @setEmptyState()


    currentTrack: ->
        @playlist.get @get 'current_track'


    nextTrack: ->
        index = @playlist.indexOf @currentTrack()
        @playlist.models[index + 1]


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
        else if track?.get('duration') and (@state.get('played') - track.get('duration')) >= 0        
            @updateState name:"stopped"


    searchTrack: (track, callback = ->) ->        
        results = []

        unless track.get('player')
            searchCallback = -> 
                unless _.isEmpty results
                    # TODO: Should chouse best matching song
                    match = results[0]

                    track.set 'file_url': match.file_url
                    track.set 'duration': match.duration

                    callback track

            for name, obj of chromus.audio_sources            
                obj.search 
                    artist: track.get('artist')
                    song: track.get('song')
                , (tracks) ->                
                    results = _.union(results, tracks)
                    searchCallback()
        else
            player = chromus.audio_players[track.get('player')]
            player.search track, (result) ->
                track.set 'file_url': result.file_url[0..200]
                callback track


    playTrack: (track) ->
        if _.isNumber(track)
            track = @playlist.get(track)
        
        return unless track

        if not _.isFunction track.get
            track = new Track(track)


        if track isnt @currentTrack()
            @stop()
                    

        unless track.get('type')?
            @set 'current_track': track.id

            if track.get('file_url')
                @play track
            else
                @state.set 'name':'loading'

                @searchTrack track, =>
                    @playTrack track
        else
            chromus.media_types[track.get('type')] track.toJSON(), (tracks) =>
                @playlist.reset tracks
                @playTrack @playlist.first().id                
                                

    setVolume: (volume) ->
        @volume = volume if volume?

        @player.setVolume @volume


    getVolume: -> @volume ? 100


    getState: ->
        @state.toJSON()


chromus.registerPlugin("music_manager", new MusicManager())