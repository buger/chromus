LastFM = 
    settings: 
        baseURL: "http://ws.audioscrobbler.com/2.0/"
        format: "json"
        api_key: "170909e77e67705570080196aca5040b"     

    callMethod: (method, data = {}, callback) ->
        data.format = @settings.format
        data.api_key = @settings.api_key
        data.method = method

        $.ajax
            url: "#{@settings.baseURL}"
            data: data
            cache: true
            dataType: @settings.format
            success: (resp) ->
                console.log "Lastfm response:", resp
                callback resp


    track:
        search: (string, callback) ->
            LastFM.callMethod "track.search",
                track: string
            , (resp) -> callback resp.results.trackmatches?.track

    
    artist:
        search: (string, callback) ->
            LastFM.callMethod "artist.search",
                artist: string
            , (resp) -> callback resp.results.artistmatches?.artist

        getTopTracks: (artist, callback) ->
            LastFM.callMethod "artist.getTopTracks",
                "artist": artist
            , (resp) -> 
                tracks = resp.toptracks.track
                tracks = _.map tracks, (track) ->
                    artist: track.artist.name
                    song: track.name
                    duration: parseInt(track.duration)

                callback tracks
        
    album:
        search: (album, callback) ->
            LastFM.callMethod "album.search",
                "album": album
            , (resp) -> callback resp.results.albummatches?.album

        getInfo: (artist, album, callback) ->
            LastFM.callMethod "album.getInfo",
                "album": album
                "artist": artist
            , (resp) -> 
                tracks = resp.album.tracks.track
                
                tracks = _.map tracks, (track) ->
                    artist: track.artist.name
                    song: track.name
                    duration: parseInt(track.duration)

                callback tracks


    image: (options) ->     
        if not options.artist then return

        options.size ?= "mediumsquare"
        params = []

        if options.album
            method_prefix = "album"         
            params.push "album=" + encodeURIComponent(options.album)
        else
            method_prefix = "artist"
            params.push "artist=" + encodeURIComponent(options.artist)
         
                
        "#{LastFM.settings.baseURL}?api_key=#{LastFM.settings.api_key}&method=#{method_prefix}.getImageRedirect&size=#{options.size}&#{params.join('&')}"     


@chromus.registerPlugin "lastfm", LastFM

@chromus.registerMediaType "artist", (track, callback) ->
    LastFM.artist.getTopTracks track.artist, callback

@chromus.registerMediaType "album", (track, callback) ->
    LastFM.album.getInfo track.artist, track.album, callback