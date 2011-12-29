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
    			<h3 style="font-size:20px; font-weight: bold; margin-bottom: 10px;">Logged!</h3>
    			<p style="font-size: 14px;">Rest of functionality will be available in next update. Stay tuned!</p>
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

		$(@el).html template view

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


ui = new UI()
                    
menu = $('<li class="vkontakte">Vkontakte</li>')
    .bind 'click', ->
        $('#main_menu').hide()        

        ui.open()

chromus.addMenu menu