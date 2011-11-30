BandCamp =

    bandURL: "http://api.bandcamp.com/api/band/3"     
    albumURL: "http://api.bandcamp.com/api/album/2"   
    trackURL: "http://api.bandcamp.com/api/track/1"

    api_key: "hneyxlanligrullhottrdorga"

    constructor: ->
        _.bindAll @

    callMethod: (args) ->
        $.ajax
            url: args.url
            data: _.defaults { key: BandCamp.api_key }, args.data
            dataType: "jsonp"
            cache: true
            success: (resp) -> 
                args.success resp

    band:
        search: (artist, callback) ->
            BandCamp.callMethod                
                url: "#{BandCamp.bandURL}/search"
                data:
                    name: artist

                success: (resp) -> callback resp.results
                    
        discography: (band_ids, callback) ->
            BandCamp.callMethod            
                url: "#{BandCamp.bandURL}/discography?band_id="+band_ids.join(',')
                success: (resp) -> callback resp
                    
    album:
        info: (album_id, callback) ->
            BandCamp.callMethod
                url: "#{BandCamp.albumURL}/info"
                data:
                    album_id: album_id                    
                success: callback


    search: (args, callback) ->
        tracks = []        

        process_tracks = ->            
            tracks = _.flatten tracks
            tracks = _.map tracks, (t) ->
                resp =
                    file_url: t.streaming_url
                    artist: t.artist
                    song: t.title
                    source_title: 'Bandcamp'
                                   
            tracks = _.reject tracks, (t) -> 
                t.file_url is undefined or not t.song.toLowerCase().match args.song.toLowerCase()

            callback tracks


        BandCamp.band.search args.artist, (resp) ->
            if resp.length
                band_ids = _.pluck resp, "band_id"

                BandCamp.band.discography band_ids, (resp) ->
                    discogs = resp.discography
                    unless discogs
                        discogs = _.map resp, (value, key) -> value.discography
                        discogs = _.flatten discogs

                    process_tracks = _.after discogs.length, process_tracks

                    for obj in discogs
                        if obj.track_id
                            tracks.push(obj)
                            process_tracks()
                        else
                            BandCamp.album.info obj.album_id, (album) ->
                                album.tracks = _.map album.tracks, (t) ->
                                    t.artist = obj.artist
                                    t
                                tracks.push album.tracks

                                process_tracks()



@chromus.registerPlugin("bandcamp", BandCamp)
@chromus.registerAudioSource("bandcamp", BandCamp)