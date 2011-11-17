yepnope.addPrefix 'bg', (resource) ->
	resource.bypass = browser.page_type isnt "background"
	resource

yepnope.addPrefix 'popup', (resource) ->
	resource.bypass = browser.page_type isnt "popup"
	resource

yepnope.addPrefix 'bg_spec', (resource) ->
	resource.bypass = !(window.jasmine && browser.page_type is "background")
	resource

yepnope.addPrefix 'popup_spec', (resource) ->
	resource.bypass = !(window.jasmine && browser.page_type is "popup")
	resource

yepnope.addPrefix 'css', (resource) ->
	resource.bypass = browser.page_type isnt "popup"
	resource.forceCSS = true
	resource



class Chromus
	
	audio_players: {}

	audio_sources: {}

	media_types: {}

	plugins: {}

	plugins_info: {}

	plugins_list: [
		'iframe_player'
		'music_manager'
		'echonest'
		'lastfm'
		'loved_tracks_radio'	
	#	'local_files_player'
		'vkontakte'
		'ui'
	]

	constructor: ->		
		_.bindAll @

		@pluginsLoadedCallback = ->
		@loadPlugins()
	

	injectPluginFiles: ->
		console.log 'injecting files'

		files = []

		for plugin, meta of @plugins_info
			files.push _.map meta['files'], (file) ->
				match = file.match(/(.*!)?(.*)/)				
				"#{match[1]}#{meta.path}/#{match[2]}?#{+new Date()}"
		
		yepnope
			load: _.flatten files
			complete: @pluginsLoadedCallback
		

	loadPlugins: ->		
		callback = _.after @plugins_list.length, @injectPluginFiles				
		for plugin in @plugins_list						
			do (plugin) =>
				plugin_path = browser.extension.getURL "/plugins/#{plugin}"
				package_path = "#{plugin_path}/package.json"								
				$.getJSON package_path, (package) =>					
					@plugins_info[plugin] = package
					@plugins_info[plugin].path = plugin_path
					
					callback()																		

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
		$('#main_menu').prepend(el)


@chromus = new Chromus()


@chromus.utils = {
	uid:->
    	@uid_start ?= +new Date()
    	@uid_start++
}