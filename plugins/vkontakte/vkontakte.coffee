global = @

VK =
    APP_ID: if global.debug then "2649785" else "2698877"
    BaseURL: "http://api.vk.com/api.php"
    SignURL: "http://chromusapp.appspot.com/sign_data"
    SCOPE: "audio,offline"

    
    authURL: ->
        redirect_uri = [
            document.location.toString()            
            "/../"
            chromus.plugins_info.vkontakte.path
            "/oauth.html"
        ].join('')

        link = [  
            "http://api.vkontakte.ru/oauth/authorize?"
            "client_id=" + VK.APP_ID
            "scope=" + VK.SCOPE
            "redirect_uri=" + redirect_uri
            "display=popup"
            "response_type=token"
        ].join('&')        


    searchWithoutLogin: (args, callback) ->
        query = "#{args.artist} #{args.song}"

        callback_name = "vkclb#{chromus.utils.uid()}"

        $.ajax
            url: "#{VK.SignURL}"
            data: 
                track: query
            dataType: "jsonp"
            cache: true 
            jsonpCallback: callback_name           

            success: (resp) =>
                data =
                    'api_id': resp.api_key
                    'method': 'audio.search'
                    'format': 'json'
                    'sig': resp.signed_data
                    'sort': 2 # popular first
                    'test_mode': 1
                    'count': 10
                    'q': query

                @searchAPI data, callback_name ,callback
    

    searchAPI: (data, jsonpCallback, callback) ->        
        $.ajax
            url: "#{VK.BaseURL}"
            data: data,
            dataType: "jsonp"
            cache: true
            jsonpCallback: jsonpCallback

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

    search: (args, callback) -> VK.searchWithoutLogin(args, callback)

@chromus.registerPlugin("vkontakte", VK)
@chromus.registerAudioSource("vkontakte", VK)