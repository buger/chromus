###
	Track scrobbling 
###

lastfm = chromus.plugins.lastfm
manager = chromus.plugins.music_manager

last_scrobbled = undefined

chromus.plugins.music_manager.state.bind 'change', (state) ->

	# User should be logged and scrobbling should be on
	return unless store.get('lastfm:scrobbling') and store.get('lastfm:key')

	track = manager.currentTrack()

	if state.get('name') is "playing" and track.id isnt last_scrobbled
		percent_played = (state.get('played') / track.get('duration'))*100
			
		if percent_played > 30 and track.get('duration') > 30
			console.warn "scrobbling", track.id, last_scrobbled
			last_scrobbled = track.id

			lastfm.track.scrobble
				artist: track.get('artist')
				track: track.get('song')
				duration: track.get('duration')			
	
	else if state.get('name') is 'stopped'				
		last_scrobbled = undefined

	if state.get('name') is "playing" and state.previous("name") isnt state.get('name')
		lastfm.track.updateNowPlaying
			artist: track.get('artist')
			track: track.get('song')
			duration: track.get('duration')					



	