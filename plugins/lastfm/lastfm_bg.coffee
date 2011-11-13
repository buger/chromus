###
    Track scrobbling 
###

lastfm = chromus.plugins.lastfm
manager = chromus.plugins.music_manager

last_scrobbled = undefined

chromus.plugins.music_manager.state.bind 'change', (state) ->

    # User should be logged and scrobbling should be on
    return unless store.get('lastfm:scrobbling') and store.get('lastfm:key')

    track = manager.currentTrack()

    if state.get('name') is "playing" and track.id isnt last_scrobbled
        percent_played = (state.get('played') / track.get('duration'))*100
            
        if percent_played > 30 and track.get('duration') > 30
            last_scrobbled = track.id

            lastfm.track.scrobble
                artist: track.get('artist')
                track: track.get('song')
                duration: track.get('duration')
                radio: true
                                
    else if state.get('name') is 'stopped'              
        last_scrobbled = undefined

    if state.get('name') is "playing" and state.previous("name") isnt state.get('name')
        lastfm.track.updateNowPlaying
            artist: track.get('artist')
            track: track.get('song')
            duration: track.get('duration')


# Load next tracks if in radio mode
chromus.plugins.music_manager.bind 'change:current_track', ->       
    if manager.currentTrack()?.get('radio')

        index = manager.playlist.indexOf manager.currentTrack()
        previous_tracks = _.first manager.playlist.models, index

        # LastFm did't support playing previous tracks
        for track in previous_tracks
            if track.get('radio')                
                track.unset 'file_url'
                track.unset 'radio'
                track.unset 'source_title'
                track.unset 'source_icon'
        
        # If last track, load more
        if not manager.nextTrack()
            lastfm.radio.getPlaylist (tracks) ->
                manager.playlist.add tracks
    


chromus.registerMediaType "artist", (track, callback) ->
    lastfm.artist.getTopTracks track.artist, callback

chromus.registerMediaType "album", (track, callback) ->
    lastfm.album.getInfo track.artist, track.album, callback

chromus.registerMediaType "lastfm:radio", (track, callback) ->
    manager.settings.set 
        'repeat': false
        'shuffle': false

    lastfm.radio.tune track.station, ->
        lastfm.radio.getPlaylist callback