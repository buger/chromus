global = @

VK =
    APP_ID: if global.debug then "2649785" else "2698877"    
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
        BaseURL =  "http://api.vk.com/api.php"
        SignURL = "http://chromusapp.appspot.com/sign_data"

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

                $.ajax
                    url: "#{VK.BaseURL}"
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

    
    searchAPI: (args, callback) ->
        console.warn 'searching as logged user'

        query = "#{args.artist} #{args.song}"

        data =
            q: query
            format: 'json'
            sort: 2
            count: 10

        if browser.isPokki
            data.access_token = pokki.descrumble store.get('vk:token')
        else
            data.access_token = store.get('vk:token')

        $.ajax
            url: "https://api.vkontakte.ru/method/audio.search"
            data: data,
            dataType: "jsonp"
            cache: true

            success: (result) ->
                return callback [] unless result.response

                records = _.map _.rest(result.response), (i) -> 
                    {
                        artist: i.artist
                        song: i.title
                        duration: parseInt(i.duration)
                        file_url: i.url
                        source_title: "Vkontakte"
                        source_icon: "http://vkontakte.ru/favicon.ico"
                    }
                                
                callback(records)        
                            
    
    search: (args, callback) ->
        if store.get('vk:user_id')
            VK.searchAPI(args, callback)
        else
            VK.searchWithoutLogin(args, callback)

    

@chromus.registerPlugin("vkontakte", VK)
@chromus.registerAudioSource("vkontakte", VK)