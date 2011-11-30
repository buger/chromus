Echo = 
	settings: 
		baseURL: "http://developer.echonest.com/api/v4"
		format: "jsonp"
		api_key: "D3QELXPGA1KC6AJ6U"

	callMethod: (method, data = {}, callback) ->
		data.format = @settings.format
		data.api_key = @settings.api_key

		$.ajax
			url: "#{@settings.baseURL}/#{method}"
			data: data
			cache: true
			dataType: @settings.format
			success: (resp) ->
				console.log "Echo response:", resp

				callback resp.response

	song:
		search: (string, callback) ->
			Echo.callMethod "song/search",
		 		combined: string
		 		sort: "artist_familiarity-desc"
#		 		bucket: "audio_summary"
			, (resp) -> callback resp.songs
	
	artist:
		suggest: (string, callback) ->
			Echo.callMethod "artist/suggest",
		 		name: string
			, (resp) -> callback resp.artists


@chromus?.registerPlugin "echo", Echo