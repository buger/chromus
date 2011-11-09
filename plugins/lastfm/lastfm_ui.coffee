lastfm = chromus.plugins.lastfm

login_template = '
    <form class="form">
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
                <a class="close">close</a>
                <input type="submit" value="Login" />
            </li>
        </ul>
    </form>'


class LoginView extends Backbone.View

    events: 
        "submit form": "login"
        "click .close": "close"
    
    render: ->
        @el.innerHTML = login_template
        @delegateEvents()

        $('#dialog .content').html(@el)
        $('#dialog').show()

    login: (evt) ->
        form = evt.target
        
        [username, password] = [form.username.value, form.password.value]
        
        @$('*').css 'visibility':'hidden'

        @spinner = new Spinner().spin(@el)

        auth_token = MD5(username + MD5(password))

        lastfm.callMethod 'auth.getMobileSession', 
            sig_call: true,
            username: username,
            authToken: auth_token
        , (resp) =>
            if resp.error
                @$('*').css 'visibility':'visible'
                @$('.error').show()
                @spinner.stop()
            else if resp.session
                store.set 'lastfm:user', resp.session.name
                store.set 'lastfm:key', resp.session.key
                store.set 'lastfm:scrobbling', true
                
                @el.innerHTML = '               
                    <label class="success">Logged!</label>
                    <a class="close">close</a>
                '                

                @delegateEvents()

                menu.render()

        false #stop propagation
    

    close: ->
        $('#dialog').hide()


error_template = Handlebars.compile '
    <ul>
        <li>
            <span>This channel available only for paid Last.fm subscribers</span>
        </li>
        <li class="buttons">
            <a class="close">Close</a>
        </li>
    </ul>
'


class ErrorWindow extends Backbone.View

    events: 
        "click .close": "close"
    
    render: ->
        @el.innerHTML = error_template()
        @delegateEvents()

        $('#dialog .content').html(@el)
        $('#dialog').show()

    close: ->
        $('#dialog').hide()

error_window = new ErrorWindow()



menu_template = Handlebars.compile '            
<span>Last.fm</span>            
<ul class="menu_container">
    {{#if username}}
        {{#if scrobbling}}
            <li class="toggle enabled">Scrobbling enabled</li>
        {{else}}
            <li class="toggle disabled">Scrobbling disabled</li>
        {{/if}}
        <li class="header">Logged as {{username}}</li>
        <li><a href="http://last.fm/user/{{username}}" target="_blank">Profile page</a></li>        
        <li class="loved_radio">Loved Tracks Radio</li>
        <li class="header">Subscribers radio</li>
        <li class="lastfm_radio" data-radio="lastfm://user/{{username}}/personal">Library Radio</li>
        <li class="lastfm_radio" data-radio="lastfm://user/{{username}}/mix">Mix Radio</li>
        <li class="lastfm_radio" data-radio="lastfm://user/{{username}}/recommended">Recommendation Radio</li>
        <li class="lastfm_radio" data-radio="lastfm://user/{{username}}/neighbours">Neighbours Radio</li>
        <li class="logout">Logout</li>
    {{else}}
        <li class="scrobbling not_logged">Want scrobbling?</li>
    {{/if}}
</ul> 
'


class Menu extends Backbone.View

    tagName: 'li'

    className: 'lastfm'

    events: 
        "click .not_logged": "login"
        "click .logout": "logout"
        "click .toggle": "toggle"
        "click .lastfm_radio": "playRadio"
        "click .loved_radio": "playLovedRadio"


    initialize: ->
        @container = $('#main_menu')
        @container.append @el

        @render()


    render: ->
        view = 
            username: store.get('lastfm:user')
            scrobbling: store.get('lastfm:scrobbling')
                    
        @el.innerHTML = menu_template view

        @delegateEvents()


    login: ->
        @container.hide()
        new LoginView().render()

    
    logout: ->
        store.remove 'lastfm:user'
        store.remove 'lastfm:key'

        @render()


    toggle: ->
        store.set 'lastfm:scrobbling', !store.get('lastfm:scrobbling')
        @render()


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


    playLovedRadio: (evt) ->
        track = 
            type: "lastfm:loved"
            artist: "LastFM Loved radio (free)"
            song: "Loading..."

        browser.postMessage 
            method: "play"
            track: track
            playlist: [track]                   

            
menu = new Menu()

browser.addMessageListener (msg) ->
    switch msg.method
        when "lastfm:error"
            error_window.render()

$('#main_menu').show()