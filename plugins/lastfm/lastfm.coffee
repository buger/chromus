hashToQueryString = (hash) ->
        params = []

        for own key, value of hash            
            params.push "#{key}=#{value}"

        params.join('&')


LastFM = 
    settings: 
        baseURL: "http://ws.audioscrobbler.com/2.0/"
        format: "json"
        api_key: "48e602d0f8c4d34f00b1b17d96ab88c1"
        api_secret: "c129f28ec70abc4311b21fa8473d34e7"

    
    getSignature: (data) ->
        signature = []

        for own key, value of data                
            signature.push(key + value) if key isnt 'format'

        signature.sort()

        MD5(signature.join('') + LastFM.settings.api_secret)


    callMethod: (method, data = {}, callback) ->
        data.format = @settings.format
        data.api_key = @settings.api_key
        data.method = method

        if data.sig_call
            delete data.sig_call

            data.sk = store.get('lastfm:key')
        
            data.api_sig = @getSignature(data)  

        $.ajax
            url: "#{@settings.baseURL}"
            data: data
            cache: true
            dataType: @settings.format
            success: (resp) ->
                console.log "Lastfm response:", resp
                callback resp


    convertDateToUTC: (date = new Date()) ->
        new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())

    
    # Trick to emulate POST request. Useful when we can't use Cross-Origin XHR
    fakePostRequest: (url, data) ->
        iframe = document.createElement('iframe')
        iframe.name = iframe.id = (+ new Date())
        document.body.appendChild(iframe)

        form = document.createElement('form')
        form.action = url
        form.method = "post"
        form.target = iframe.id

        for own key, value of data
            input = document.createElement('input')
            input.name = key
            input.value = value

            form.appendChild(input)            

        document.body.appendChild(form)
        form.submit()

        # Clean up
        setTimeout ->            
            document.body.removeChild(iframe)
            document.body.removeChild(form)
        , 2000


    track:
        scrobble: (data, callback) ->
            data.method = 'track.scrobble'
            data.timestamp = (+ LastFM.convertDateToUTC()) / 1000
            data.sk = store.get('lastfm:key')
            data.api_key = LastFM.settings.api_key

            signature = LastFM.getSignature(data)
            data.api_sig = signature

            LastFM.fakePostRequest("#{LastFM.settings.baseURL}", data)

        
        updateNowPlaying: (data, callback) ->
            data.method = 'track.updateNowPlaying'
            data.sk = store.get('lastfm:key')            
            data.api_key = LastFM.settings.api_key

            signature = LastFM.getSignature(data)
            data.api_sig = signature

            LastFM.fakePostRequest("#{LastFM.settings.baseURL}", data)
                

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

    radio:
        getPlaylist: (callback) ->            
            LastFM.callMethod "radio.getPlaylist",
                sig_call: true
            , (resp) ->
                tracks = resp.playlist.trackList.track

                console.warn resp

                tracks = _.map tracks, (track) ->
                    artist: track.creator
                    song: track.title
                    file_url: track.location
                    image: track.image
                    duration: track.duration/1000
                    radio: true
                    source_title: resp.playlist.title
                    source_icon: "http://cdn.last.fm/flatness/favicon.2.ico"


                callback tracks    
                                

        tune: (station, callback) ->
            if station.match(/loved$/)
                LastFM._station = 'loved'
                return callback()
                        
            data = station: station            
            data.method = 'radio.tune'
            data.sk = store.get('lastfm:key')            
            data.api_key = LastFM.settings.api_key


            signature = LastFM.getSignature(data)
            data.api_sig = signature
            data.format = "json"

            data._url = "#{LastFM.settings.baseURL}"
            data._method = "POST"

            $.ajax
                url: "http://chromusapp.appspot.com/proxy?_callback=?"
                data: data
                dataType:"jsonp"
                cache: true
                success: (resp) ->
                    resp = JSON.parse(resp.response)
                    
                    unless resp.error                    
                        callback()                            
                    else
                        browser.postMessage
                            method: "lastfm:error"
                            error: resp.error.code                    

@chromus.registerPlugin "lastfm", LastFM