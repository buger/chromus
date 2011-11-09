VK =
    settings:
        baseURL: "http://api.vk.com/api.php"
        signURL: "http://chromusapp.appspot.com/sign_data"

    search: (args, callback = ->) ->
        query = "#{args.artist} #{args.song}"

        callback_name = args.callback || "vkclb#{chromus.utils.uid()}"

        $.ajax
            url: "#{VK.settings.signURL}"
            data: 
                track: query
            dataType: "jsonp"
            cache: true
            jsonpCallback: callback_name

            success: (resp) ->
                console.log "search callback", resp

                data =
                    'api_id': resp.api_key
                    'method': 'audio.search'
                    'format': 'json'
                    'sig': resp.signed_data
                    'sort': 2 # popular first
                    'test_mode': 1
                    'count': 10
                    'q': query


                $.ajax 
                    url: "#{VK.settings.baseURL}"
                    data: data,
                    dataType: "jsonp"
                    cache: true
                    jsonpCallback: callback_name

                    success: (result) ->
                        return callback [] unless result.response

                        records = _.map _.rest(result.response), (i) -> 
                            {
                                artist: i.audio.artist
                                song: i.audio.title
                                duration: parseInt(i.audio.duration)
                                file_url: i.audio.url
                                source_title: "Vkontakte"
                                source_icon: "http://vkontakte.ru/favicon.ico"
                            }
                                        
                        callback(records)                                    


@chromus.registerAudioSource("vkontakte", VK)