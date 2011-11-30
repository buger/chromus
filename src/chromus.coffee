global = @

class Chromus   

    baseURL: "http://chromusapp.appspot.com"
    
    audio_players: {}

    audio_sources: {}

    media_types: {}

    plugins: {}

    plugins_info: {}

    plugins_list: [
        'iframe_player'
        'music_manager'
        'ui'
        'echonest'
        'lastfm'
        'loved_tracks_radio'    
    #   'local_files_player'
        'vkontakte'
        #'4shared'  
        #'bandcamp'
        'about'
    ]

    constructor: ->     
        _.bindAll @

        @loadPlugins()
    

    injectPluginFiles: ->       
        files = []

        for plugin in @plugins_list
            meta = @plugins_info[plugin]

            files.push _.map meta['files'], (file) ->
                match = file.match(/(.*!)?(.*)/)

                "#{match[1]||''}#{meta.path}/#{match[2]}?#{+new Date()}"    

        yepnope
            load: _.flatten files
            complete: @pluginsLoadedCallback
        

    loadPlugins: ->     
        callback = _.after @plugins_list.length, @injectPluginFiles             
        for plugin in @plugins_list                     
            do (plugin) =>                            
                plugin_path = browser.extension.getURL "/plugins/#{plugin}"
                package_path = "#{plugin_path}/package.json?#{+new Date()}"             
                $.getJSON package_path, (package) =>                    
                    @plugins_info[plugin] = package
                    @plugins_info[plugin].path = plugin_path
                    
                    callback()
                    

    pluginsLoadedCallback: ->
        if global.isTestMode()
            jasmine.getEnv().addReporter(new jasmine.TrivialReporter())
            jasmine.getEnv().execute()

    registerPlugin: (name, context) ->
        @plugins[name] = context


    registerPlayer: (name, context) ->
        @audio_players[name] = context

    registerAudioSource: (name, context) ->
        @audio_sources[name] = context

    registerMediaType: (name, context) ->
        @media_types[name] = context

    # UI features
    addMenu: (el) ->
        $('#main_menu').append(el)

    # Creates standard panel    
    openPanel: (content) ->         
        panel = $('<div class="panel">')
            .html(content)
            .appendTo($("#wrapper"))
            .delegate '.back', 'click', ->                
                panel.removeClass('show')

                _.delay ->
                    panel.remove()
                , 300       
        
        # Without defer jquery adds class immidiatly, without animation
        _.defer -> panel.addClass('show')

        panel
                
    
    # Close latest created panel, by triggering close event
    closePanel: ->
        latest_panel = _.last($('.panel'))

        $(latest_panel).find('.back')
            .trigger('click')
        

    


@chromus = new Chromus()


@chromus.utils = {
    uid:->
        @uid_start ?= +new Date()
        @uid_start++
}