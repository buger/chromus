_gaq ?= []


class Track extends Backbone.Model

    initialize: -> @set 'id': chromus.utils.uid()

    title: -> "#{@get('artist')} #{@get('song')}"


class Playlist extends Backbone.Collection
    model: Track
        

class MusicManager extends Backbone.Model

    lastfm: chromus.plugins.lastfm

    initialize: ->
        _.bindAll @, "onPlaylistReset", "updateState"

        @playlist = new Playlist()
        @state = new Backbone.Model()        

        @playlist.bind 'reset', @onPlaylistReset
        @playlist.reset()

        @setPlayer()

    
    setPlayer: (player = 'iframe_player') ->
        @player.state.unbind() if @player

        @player = chromus.audio_players[player]
        @player.state.bind 'change', @updateState


    pause: -> 
        @state.set 'name':'paused'
        @player.pause()

    play: (track) -> @player.play track.toJSON()
    preload: (track) -> @player.preload track.toJSON()    

    stop: -> 
        @unset 'current_track'
        @state.set 'name': 'stopped', silent: true
        @player.stop()
        

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

        if @state.get('name') is "stopped"
            return @playTrack @nextTrack()

        if track? and Math.round(@state.get('played')) >= Math.round(track.duration)
            return updateState name:"stopped"        


    searchTrack: (track, callback = ->) ->        
        results = []

        searchCallback = -> 
            # TODO: Should chouse best matching song
            match = results[0]

            track.set 'file_url': match.file_url

            callback track

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

        switch track.get('type')
            when 'artist'
                @lastfm.artist.getTopTracks track.get('artist'), (tracks) =>
                    @playlist.reset(tracks)
                                        
                    @playTrack @playlist.first().id
            when 'album'
                
            else
                @set 'current_track': track.id

                console.warn track                

                if track.get('file_url')
                    @play track
                else
                    @state.set 'name':'loading'

                    @searchTrack track, =>                        
                        @playTrack track
                                
                        
    showNotification: ->
        track = @currentTrack()
        show_notification = window.localStorage["show_notifications"] is "true" or window.localStorage["show_notifications"] is undefined

        if not show_notification or not track or not window.webkitNotifications 
            return


        notification = window.webkitNotifications.createNotification(track.image, track.song, track.artist)
        notification.show()
        setTimeout -> 
            notification.cancel()
        , 6000
    

    updateID3Info: (trackIndex, callback = ->) ->
        track = this.playlist[trackIndex]

        if track.file_url and not track.file_url.match(/^data/)
            file_name = track.file_url.substring(track.file_url.lastIndexOf("/")+1).replace(/\.\w{3}$/,'')

            ID3.loadTags track.file_url, ->
                tags = ID3.getAllTags(track.file_url)
                
                console.log("ID3 Tags:", tags);
                
                if tags.title
                    track.song = tags.title
                    track.artist = tags.artist or "Unknown"
                    track.album = tags.album

                    if not track.song
                        tack.song = file_name
                    
                    if trackIndex is this.current_track
                        @lastfm.setNowPlaying(track.artist, track.song, track.album, @state.get('duration'))
                        @showNotification()
                        @state.set name:"loading"
                    
                else
                    track.artist = "Unknown"
                    track.song = file_name
                    track.id3_empty = true                
                
                callback()


    updateTrackInfo: (trackIndex, callback) ->
        track = @currentTrack()
        callback ?= ->

        if track.artist is undefined
            if track.file_url is not track.id3_empty
                @updateID3Info trackIndex, =>
                    @updateTrackInfo trackIndex, callback
            else
                track.info = {}
                callback()

        else if not track.info
            @lastfm.trackInfo track.artist, track.song, (response) =>
                if response.track_info
                    track.info = response.track_info

                    if track.info.album
                        track.album = track.info.album.title
                        track.image = track.info.album.image
                
                if not track.image
                    @lastfm.artistInfo track.artist, (resp) ->
                        track.image = resp.image
                        callback()
                else
                    callback()     
        else
            callback()


    playRadio: (radio) ->
        @radio = radio

        @playlist.reset()

        @playNextTrack()    


    setVolume: (volume) ->
        if volume?
            @volume = volume        

        @player.setVolume @getVolume()


    getVolume: ->
        if @volume is undefined
            @volume = 100        

        @volume    

    love: ->
        track = @currentTrack()

        if(track)
            @lastfm.loveTrack track.artist, track.song    


    ban: ->
        track = @currentTrack()

        if track
            @lastfm.banTrack track.artist, track.song    

    getState: ->
        @state.toJSON()


chromus.registerPlugin("music_manager", new MusicManager())