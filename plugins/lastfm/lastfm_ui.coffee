lastfm = chromus.plugins.lastfm

template = Handlebars.compile '    
    <div class="header">
        <a class="btn back">Back to playlist</a>
    </div>
    {{#if logged}}
        <form class="form">
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
                    {{#unless subscriber}}<span class="notice">Some radiostations available for subscribers only</span>{{/unless}}
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
        "click .back": "close"
        "click .logout": "logout"
        "click .toggler": "toggleScrobbling"
        "click .lastfm_radio": "playRadio"
        "click .loved_radio": "playLovedRadio"
    
    render: ->
        view = 
            logged: !!lastfm.getSession()
            scrobbling: !!store.get('lastfm:scrobbling')
            user: store.get('lastfm:user')
            subscriber: !!store.get('lastfm:subscriber')

        @el.innerHTML = template(view)

        $('#panel .container').html(@el)
        $('#panel').addClass('show')

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

        $('#panel').removeClass('show')


    playLovedRadio: (evt) ->
        track = 
            type: "lastfm:loved"
            artist: "LastFM Loved radio (free)"
            song: "Loading..."

        browser.postMessage 
            method: "play"
            track: track
            playlist: [track]

        $('#panel').removeClass('show')
                                

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
                store.set 'lastfm:subscriber', resp.session.subscriber

                console.warn resp.session.subscriber

                if browser.isPokki
                    store.set 'lastfm:key', pokki.scramble(resp.session.key)
                else
                    store.set 'lastfm:key', resp.session.key

                store.set 'lastfm:scrobbling', true                                
                @render()
        
        evt.stopPropagation()

    close: ->
        $('#panel').removeClass('show')


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
        new SettingsView().render()
        $('#main_menu').hide()
                 
                    
menu = new Menu()
chromus.addMenu(menu.el)


browser.addMessageListener (msg) ->
    switch msg.method
        when "lastfm:error"
            error_window.render()

#$('#main_menu').show()