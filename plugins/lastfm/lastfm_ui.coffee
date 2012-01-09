lastfm = chromus.plugins.lastfm

class SettingsView extends Backbone.View

    className: "lastfm"

    events: 
        "submit form.login": "login"
        "click .logout": "logout"
        "click .toggler": "toggleScrobbling"
        "click .lastfm_radio": "playRadio"
        "click .loved_radio": "playLovedRadio"

    initialize: ->
        chromus.openPanel @el
        @render()
    
    render: ->
        view = 
            logged: !!lastfm.getSession()
            scrobbling: !!store.get('lastfm:scrobbling')
            user: store.get('lastfm:user')
            subscriber: !!parseInt(store.get('lastfm:subscriber'))

        @el.innerHTML =  Handlebars.templates['lastfm.ui.tmpl'](view)
        
        @delegateEvents()

    logout: ->
        store.remove 'lastfm:user'
        store.remove 'lastfm:key'

        @render()

    toggleScrobbling: ->
        store.set 'lastfm:scrobbling', !store.get('lastfm:scrobbling')
        @$('.toggler').toggleClass('off', !store.get('lastfm:scrobbling'))

    
    playRadio: (evt) ->
        track = 
            type: "lastfm:radio"
            artist: "LastFM radio"
            song: "Loading..."
            station: $(evt.target).attr('data-radio')

        browser.postMessage 
            method: "play"
            track: track
            playlist: [track]

        chromus.closePanel()


    playLovedRadio: (evt) ->
        track = 
            type: "lastfm:loved"
            artist: "LastFM Loved radio (free)"
            song: "Loading..."

        browser.postMessage 
            method: "play"
            track: track
            playlist: [track]

        chromus.closePanel()
                                

    login: (evt) ->
        form = evt.target
        
        [username, password] = [form.username.value, form.password.value]
                
        @$('.login *').css 'visibility':'hidden'
        @spinner = new Spinner().spin(@el)        

        auth_token = MD5(username + MD5(password))

        lastfm.callMethod 'auth.getMobileSession', 
            sig_call: true,
            username: username,
            authToken: auth_token
        , (resp) =>
            @$('.login *').css 'visibility':'visible'

            if resp.error                
                @$('.error').show()
                @spinner.stop()
            else if resp.session            
                store.set 'lastfm:user', resp.session.name
                store.set 'lastfm:subscriber', parseInt(resp.session.subscriber)

                if browser.isPokki
                    store.set 'lastfm:key', pokki.scramble(resp.session.key)
                else
                    store.set 'lastfm:key', resp.session.key

                store.set 'lastfm:scrobbling', true                                
                @render()
        
        evt.stopPropagation()


class Menu extends Backbone.View

    tagName: 'li'

    className: 'lastfm'

    events: 
        "click": "openPanel"

    initialize: ->
        @container = $('#main_menu')        
        @render()

    render: ->                    
        @el.innerHTML = "Last.FM"        
        @delegateEvents()    

    openPanel: ->
        new SettingsView()
        $('#main_menu').hide()
                 
                    
menu = new Menu()
chromus.addMenu(menu.el)


browser.addMessageListener (msg) ->
    switch msg.method
        when "lastfm:error"
            error_window.render()

#$('#main_menu').show()