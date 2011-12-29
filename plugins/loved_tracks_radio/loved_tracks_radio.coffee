class LastfmLovedRadio
    
    initialize: ->
        @reset()

    reset: ->
        @pages = []
        @page = 1
        @played_tracks = []


    getNext: (callback) ->
        if @pages.length
            @pages = _.shuffle @pages
            @page = @pages[0]


        chromus.plugins.lastfm.callMethod "user.getlovedtracks", 
            user: 'teleekom'
            page: @page
        , (response) =>            
                console.warn @page, response.lovedtracks.track.length, @pages
        
                # If this is first call
                unless @pages.length
                    @pages = response.lovedtracks["@attr"].totalPages

                    @pages = _.range 1, @pages+1
                                
                    # If user have to loved tracks, return empty array
                    if response.lovedtracks.track.length
                        return @getNext(callback)
                    else
                        return callback []


                tracks = _.difference response.lovedtracks.track, @played_tracks
                tracks = _.shuffle tracks
                
                if not tracks.length
                    @pages = _.without(@pages, @page)

                    return @getNext(callback)                                
                
                tracks = _.first(tracks, 3)
                @played_tracks = _.union @played_tracks, tracks
                
                tracks = _.map tracks, (track) ->
                    song: track.name
                    artist: track.artist.name
                    
                    source_title: "Last.fm Loved Tracks Radio (Free)"
                    source_icon: browser.extension.getURL('/assets/icons/19x19.png')

                    loved_radio: true
                    
                tracks.push
                    song: "Load next tracks"
                    artist: ""
                    type: "lastfm:loved_loader"
                    action: true


                callback(tracks)


radio = new LastfmLovedRadio()

manager = chromus.plugins.music_manager


addNextTracks = ->
    loaders = manager.playlist.filter (i) -> 
        i.get('type') is 'lastfm:loved_loader'
    
    for loader in loaders
        loader.set 'song': 'Loading...'

    radio.getNext (tracks) ->
        manager.playlist.remove loaders        
        manager.playlist.add tracks


manager.bind 'change:current_track', ->
    track = manager.currentTrack()

    if track?.get('loved_radio') and manager.nextTrack()?.get('type') is "lastfm:loved_loader"

        addNextTracks()
                               

chromus.registerMediaType "lastfm:loved_loader", (track) -> 
    addNextTracks()

                    

chromus.registerMediaType "lastfm:loved", (track, callback) ->
    radio.reset()

    manager.settings.set 
        'repeat': false
        'shuffle': false

    radio.getNext callback