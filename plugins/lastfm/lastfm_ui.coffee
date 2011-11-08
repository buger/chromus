lastfm = chromus.plugins.lastfm

template = '
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
        @el.innerHTML = template
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

        false #stop propagation
    

    close: ->
        $('#dialog').hide()


$('#main_menu .scrobbling').live 'click', ->
    $('#main_menu').hide()

    new LoginView().render()