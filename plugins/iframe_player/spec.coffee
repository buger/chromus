describe "Iframe music player", ->

	manager = chromus.plugins.music_manager
	player = chromus.audio_players.iframe_player


	it "should be defined", ->
		expect(player).toBeDefined()


	it "should load frame from same host", ->
		expect(player.player_frame).not.toMatch /chromusapp.com/

		waitsFor ->
			player.player_ready
		, "player frame not loaded", 2000	