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

    return unless track

    if state.get('name') is "playing" and track.id isnt last_scrobbled
        percent_played = (state.get('played') / track.get('duration'))*100
            
        if percent_played > 30 and track.get('duration') > 30
            last_scrobbled = track.id

            lastfm.track.scrobble
                artist: track.get('artist')
                track: track.get('song')
                duration: track.get('duration')
                                
    else if state.get('name') is 'stopped'              
        last_scrobbled = undefined

    if state.get('name') is "playing" and state.previous("name") isnt state.get('name')
        lastfm.track.updateNowPlaying
            artist: track.get('artist')
            track: track.get('song')
            duration: track.get('duration')


addNextTracks = ->
    loaders = manager.playlist.filter (i) -> 
            i.get('type') is 'lastfm:radio_loader'
    
    for loader in loaders        
        loader.set 'song': "Loading..."

    lastfm.radio.getPlaylist (tracks) ->
        manager.playlist.remove loaders        
        manager.playlist.add tracks


# Load next tracks if in radio mode
chromus.plugins.music_manager.bind 'change:current_track', ->       
    if manager.currentTrack()?.get('lastfm_radio')

        index = manager.playlist.indexOf manager.currentTrack()
        previous_tracks = _.first manager.playlist.models, index

        # LastFM did't support playing previous tracks
        for track in previous_tracks
            if track.get('radio')                
                track.unset 'file_url'
                track.unset 'radio'
                track.unset 'source_title'
                track.unset 'source_icon'
                track.unset 'type'
        
        # If last track, load more
        if manager.nextTrack()?.get('type') is "lastfm:radio_loader"
            addNextTracks()
            

chromus.registerMediaType "lastfm:radio_loader", (track) ->     
    addNextTracks()


chromus.registerMediaType "artist", (track, callback) ->
    lastfm.artist.getTopTracks track.get('artist'), callback

chromus.registerMediaType "album", (track, callback) ->
    lastfm.album.getInfo track.get('artist'), track.get('album'), callback

chromus.registerMediaType "lastfm:radio", (track, callback) ->
    manager.settings.set 
        'repeat': false
        'shuffle': false

    lastfm.radio.tune track.get('station'), ->
        lastfm.radio.getPlaylist callback

chromus.registerMediaType "lastfm:stream_track", (track, callback) =>
    $.ajax
        url: "http://chromusapp.appspot.com/proxy?_callback=?"
        dataType: "jsonp",
        data:
            '_url': track.get('file_url')
        cache: true,
        success: (resp) ->
            callback 
                file_url: resp.headers.location
            , false 