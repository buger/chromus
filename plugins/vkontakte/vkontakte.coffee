global = @

VK =
    APP_ID: if global.debug then "2649785" else "2698877"    
    SCOPE: "audio,offline"

    authURL: ->
        if browser.isChrome
            baseLocation = "#{chromus.baseURL}/chromus/index.html"
        else
            baseLocation = document.location.toString()

        plugin_path = chromus.plugins_info.vkontakte.path
        plugin_path = plugin_path.replace("chrome-extension://oeghnnflghjikgempjanmfekicakholb/","")

        redirect_uri = [
            baseLocation
            "/../"
            plugin_path
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
        $.ajax
            url: "#{chromus.baseURL}/api/token/get"
            dataType:"jsonp"
            success: (resp) ->
                unless resp.error
                    args.access_token = resp.token 
                    VK.searchAPI(args, callback)        

    
    searchAPI: (args, callback) ->
        console.warn 'searching as logged user'

        query = "#{args.artist} #{args.song}"

        data =
            q: query
            format: 'json'
            sort: 2
            count: 10

        unless args.access_token
            if browser.isPokki
                data.access_token = pokki.descrumble store.get('vk:token')
            else
                data.access_token = store.get('vk:token')
        else
            data.access_token = args.access_token

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


# Listen for messages
browser.addMessageListener (msg, sender, sendResponse) ->
    switch msg.method
        when "vk:auth"
            store.set "vk:token", msg.auth.access_token
            store.set "vk:user_id", msg.auth.user_id

            $.ajax
                url: "#{chromus.baseURL}/api/token/add"
                data:
                    token: msg.auth.access_token
                dataType:"jsonp"
                success: (resp) ->
                    console.log 'token added'

            console.warn "logged!"