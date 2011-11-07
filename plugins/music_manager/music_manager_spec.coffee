manager = chromus.plugins.music_manager

fixtures =
    playlist: [
                { 'song': 'Song 1', 'artist': 'Beatles' }
                { 'song': 'Song 2', 'artist': 'Chuck Berry' }
                { 'song': 'Song 3', 'artist': 'Louess Reed' }
            ]

    searchResults: [
        { 'song': 'Help', 'artist': 'Beatles', 'file_url': 'http://a/1.mp3', 'duration': 100 }
        { 'song': 'Song 2', 'artist': 'Chuck Berry', 'file_url': 'http://a/2.mp3', 'duration':200 }
    ]


describe "Music manager", ->            

    beforeEach ->
        manager.playlist.reset()

    
    it "should load artist top tracks", ->          
        # FIX: Wrong fixture used
        top_spy = spyOn(manager.lastfm.artist, 'getTopTracks')
            .andCallFake (artist, callback) => callback fixtures.playlist

        search_spy = spyOn(manager, "searchTrack")

        play_spy = spyOn(manager, 'playTrack').andCallThrough()

        manager.playTrack
            type: "artist"
            artist: "Chuck Berry"

        expect(top_spy).toHaveBeenCalled()

        expect(manager.playlist.length).toBe(3)

        expect(play_spy.callCount).toBe(2)
        expect(search_spy).toHaveBeenCalled()

        first_track_id = manager.playlist.first().id

        expect(first_track_id).toBeDefined()
        expect(manager.get('current_track')).toBe(first_track_id)
            

    it "should play song after searching", ->
        search_spy = spyOn(manager, "searchTrack").andCallThrough()
        play_track_spy = spyOn(manager, "playTrack").andCallThrough()
        play_spy = spyOn(manager, "play")

        vk_spy = spyOn(chromus.audio_sources.vkontakte, "search")
            .andCallFake (track, callback) -> callback fixtures.searchResults

        manager.playlist.reset(fixtures.playlist)            
        manager.playTrack manager.playlist.first()

        expect(search_spy).toHaveBeenCalled()
        expect(vk_spy).toHaveBeenCalled()                            

        expect(manager.currentTrack().get('file_url')).toBe fixtures.searchResults[0].file_url

        expect(play_track_spy.callCount).toBe(2)

        expect(play_spy).toHaveBeenCalled()

    
    it "should change player state", ->
        manager.playlist.reset(fixtures.playlist)
        expect(manager.state.get('name')).toBe "stopped"

        state_spy = jasmine.createSpy()   
                 
        play_spy = spyOn(manager, "play")

        vk_spy = spyOn(chromus.audio_sources.vkontakte, "search")
            .andCallFake (track, callback) -> callback fixtures.searchResults

        manager.state.bind 'change', state_spy
        manager.playTrack manager.playlist.first()

        expect(state_spy).toHaveBeenCalled()
        expect(manager.state.get('name')).toBe 'loading'

        manager.player.state.set name:"playing"
        expect(manager.state.get('name')).toBe 'playing'
        
        manager.stop()
        expect(manager.state.get('name')).toBe 'stopped'

        manager.pause()
        expect(manager.state.get('name')).toBe 'paused'


    it "should change state to paused", ->
        manager.playlist.reset(fixtures.playlist)
        manager.pause()
                                
        expect(manager.state.get('name')).toBe "paused"

    
    it "should reset current_track after stop", ->
        manager.playlist.reset(fixtures.playlist)
        manager.set 'current_track': manager.playlist.first().id
        manager.state.set 'name':'playing'

        manager.stop()

        expect(manager.state.get('name')).toBe 'stopped'
        expect(manager.state.get('current_track')).toBeUndefined()


    it "should change next track after stopping", ->
        manager.playlist.reset(fixtures.playlist)
        manager.set 'current_track': manager.playlist.first().id
        manager.state.set 'name':'playing'
        
        update_state_spy = spyOn(manager, "updateState").andCallThrough()
        play_track_spy = spyOn(manager, "playTrack").andCallThrough()
        search_spy = spyOn(manager, "searchTrack").andCallThrough()

        vk_spy = spyOn(chromus.audio_sources.vkontakte, "search")
            .andCallFake (track, callback) -> callback fixtures.searchResults
        
        play_spy = spyOn(manager, "play").andCallFake ->
            manager.player.state.unset 'name', silent:true

        manager.player.state.set name:"stopped"

        expect(play_track_spy).toHaveBeenCalled()
        expect(search_spy).toHaveBeenCalled()
        expect(vk_spy).toHaveBeenCalled()
        
        expect(manager.get('current_track')).toBe manager.playlist.models[1].id

        manager.player.state.set name:"stopped"

        expect(manager.get('current_track')).toBe manager.playlist.models[2].id


    it "should stop if song ended", ->
        play_track_spy = spyOn(manager, "playTrack")
        
        manager.playlist.reset(fixtures.playlist)
        manager.set 'current_track': manager.playlist.first().id
        manager.state.set 'name':'playing'
        manager.currentTrack().set 'duration':100
                            
        manager.updateState "played":100

        expect(play_track_spy).toHaveBeenCalled()
        expect(manager.state.get('name')).toBe "stopped"

