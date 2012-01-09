vk = chromus.plugins.vkontakte

class VkUI extends Backbone.View
    
    template: Handlebars.templates['vkontakte.ui.tmpl']

    className: 'vkontakte'

    events:
        "click .login": "login"
        "click .logout": "logout"    

    initialize: ->
        _.bindAll @

        @render()   

        window.setVKSession = @setSession

    open: ->
        chromus.openPanel @el
    
    render: ->
        view = 
            logged: !!store.get('vk:token')

        $(@el).html @template view

        @delegateEvents()


    setSession: (session) ->
        store.set "vk:token", session.access_token
        store.set "vk:user_id", session.user_id

        $.ajax
            url: "#{chromus.baseURL}/api/token/add"
            data:
                token: session.access_token
            dataType:"jsonp"
            success: (resp) ->
                console.log 'token added'

        @render()

    
    login: ->
        window.open vk.authURL(),
                    "Vkontakte", 
                    "status=0,toolbar=0,location=0,menubar=0,resizable=1"

    logout: ->
        $.ajax
            url: "#{chromus.baseURL}/api/token/delete"
            data:
                token: store.get "vk:token"
            dataType:"jsonp"
            success: (resp) ->
                console.log 'token removed'

        store.remove "vk:token"
        store.remove "vk:user_id"

        @render()


ui = new VkUI()
                    
menu = $('<li class="vkontakte">Vkontakte</li>')
    .bind 'click', ->
        $('#main_menu').hide()        

        console.warn(ui.open, ui)
        ui.open()

chromus.addMenu menu