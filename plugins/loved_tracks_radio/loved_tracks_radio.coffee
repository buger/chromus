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

        console.warn "LOVED", @page, @pages
              
        chromus.plugins.lastfm.callMethod "user.getlovedtracks", 
            user: store.get('lastfm:user')
            page: @page
        , (response) =>            
                tracks = _.difference response.lovedtracks.track, @played_tracks
                tracks = _.shuffle tracks
                
                if not tracks.length
                    @pages = _.without(@pages, @page)

                    return @getNext(callback)                

                unless @pages.length
                    @pages = response.lovedtracks["@attr"].totalPages
                    @pages = _.range 1, @pages
                
                tracks = _.first(tracks, 5)
                @played_tracks = _.union @played_tracks, tracks
                
                tracks = _.map tracks, (track) ->
                    song: track.name
                    artist: track.artist.name
                    
                    source_title: "Last.fm Loved Tracks Radio (Free)"
                    source_icon: browser.extension.getURL('/assets/icons/19x19-2.png')

                    loved_radio: true

                callback(tracks)

radio = new LastfmLovedRadio()

manager = chromus.plugins.music_manager
# Load next tracks if in radio mode
manager.bind 'change:current_track', ->   
    if not manager.nextTrack() and manager.currentTrack()?.get('loved_radio')

        radio.getNext (tracks) ->
            manager.playlist.add tracks
             
                    

chromus.registerMediaType "lastfm:loved", (track, callback) ->
    radio.reset()

    radio.getNext callback