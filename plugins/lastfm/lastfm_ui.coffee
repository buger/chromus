lastfm = chromus.plugins.lastfm

template = Handlebars.compile '    
    <header>
        <a class="back"></a>
        <h3>Last.FM</h3>
    </header>
    {{#if logged}}
        <form class="form">
            <div class="logo"></div>
            <ul>          
                <li class="username">
                    <label>Logged as <a href="http://last.fm/user/{{user}}" target="_blank">{{user}}</a></label>
                </li>
                <li class="toggle">
                    <label>Scrobbling</label>
                    <div class="toggler {{#unless scrobbling}}off{{/unless}}">
                        <div></div>
                    </div>                    
                </li>
                <li class="clearfix"></li>
                
                <li class="header">
                    <span>Your Stations</span>
                    {{#unless subscriber}}<span class="notice">Some stations available for subscribers only</span>{{/unless}}
                </li>

                <li class="stations {{#unless subscriber}}subscribe{{/unless}}">
                    <ul>                    
                        <li class="loved_radio free">Loved Tracks</li>

                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/personal">Library Radio</li>
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/mix">Mix Radio</li>
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/recommended">Recommended Radio</li>
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/friends">Friends Radio</li>
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/neighbours">Neighbourhood Radio</li>
                    </ul>
                </li>
                <li class="clearfix"></li>
                            
                <li class="logout btn danger">Logout</li>
            </ul>
        </form>    
    {{else}}
    <form class="form login" onsubmit="return false">
        <div class="logo"></div>
        <ul>            
            <li>
                <label>Username <span class="error" style="display:none">Wrong credentials</span></label>
                <input name="username" autofocus/>
            </li>
            <li>
                <label>Password</label>
                <input type="password" name="password" />
            </li>
            <li class="buttons">
                <input type="submit" value="Login" class="btn" />
            </li>
        </ul>
    </form>
    {{/if}}
    '


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

        @el.innerHTML = template(view)
        
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