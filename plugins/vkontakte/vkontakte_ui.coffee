template = Handlebars.compile '    
    <header>
        <a class="back"></a>
        <h3>Vkontakte</h3>
    </header>
    <form class="form">
    	<div class="logo"></div>
	{{#if logged}}        		
    	<ul>
    		<li>
    			<b>Logged!</b>
    		</li>
    		<li>
    			<a class="btn logout" style="color: red">Logout</a>
    		</li>
    	</ul>       	
    {{else}}    
    	<ul>
    		<li style="text-align: center">
    			<a class="btn login">Login to Vkontakte</a>
    		</li>
    	</ul>
    {{/if}}
    </form>
'

vk = chromus.plugins.vkontakte

class UI extends Backbone.View

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

		@el.innerHTML = template view		

		@delegateEvents()


	setSession: (session) ->
		store.set "vk:token", session.access_token
		store.set "vk:user_id", session.user_id

		@render()

	
	login: ->
		window.open vk.authURL(),
					"Vkontakte", 
					"status=0,toolbar=0,location=0,menubar=0,resizable=1"

	logout: ->		
		store.remove "vk:token"
		store.remove "vk:user_id"

		@render()


ui = new UI()
                    
menu = $('<li class="vkontakte">Vkontakte</li>')
    .bind 'click', ->
        $('#main_menu').hide()        

        ui.open()

chromus.addMenu menu