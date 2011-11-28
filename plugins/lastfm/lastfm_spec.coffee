describe "LastFM plugin", -> 

    fixtures =        
        top_tracks: {"toptracks":{"track":[{"name":"Karma Police","duration":"262","playcount":"579659","listeners":"175046","mbid":"","url":"http:\/\/www.last.fm\/music\/Radiohead\/_\/Karma+Police","streamable":{"#text":"1","fulltrack":"0"},"artist":{"name":"Radiohead","mbid":"a74b1b7f-71a5-4011-9441-d0b5e4122711","url":"http:\/\/www.last.fm\/music\/Radiohead"},"image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/66781226.png","size":"small"}],"@attr":{"rank":"1"}}],"@attr":{"artist":"Radiohead","page":"1","perPage":"50","totalPages":"20","total":"1000"}}}

        playlist: [
            { 'song': 'Song 1', 'artist': 'Beatles', 'duration': 100 }
            { 'song': 'Song 2', 'artist': 'Chuck Berry', 'duration': 30 }
            { 'song': 'Song 3', 'artist': 'Louess Reed' }
        ]

        store: 
            "lastfm:scrobbling": "true"
            "lastfm:key": "123123"
            "lastfm:username": "test"


    lastfm = chromus.plugins.lastfm
    manager = chromus.plugins.music_manager

    beforeEach ->
        spyOn(store, "get").andCallFake (key) -> fixtures.store[key]

    
    it "it should load top tracks", ->
        ajax_spy = spyOn($, "ajax").andCallFake (args) ->            
            args.success fixtures.top_tracks

        callback_spy = jasmine.createSpy()

        lastfm.artist.getTopTracks "Radiohead", callback_spy           
       
        expect(callback_spy).toHaveBeenCalled()

        expect(callback_spy.mostRecentCall.args[0].length).toBe(1)

        expect(callback_spy.mostRecentCall.args[0][0]).toEqual
            artist: "Radiohead"
            song: "Karma Police"
            duration: 262


    it "should load artist top tracks", ->
        manager.playlist.reset()

        # FIX: Wrong fixture used
        top_spy = spyOn(lastfm.artist, 'getTopTracks')
            .andCallFake (artist, callback) => callback fixtures.playlist

        search_spy = spyOn(manager, "searchTrack")

        play_spy = spyOn(manager, 'play').andCallThrough()

        manager.play
            type: "artist"
            artist: "Chuck Berry"

        expect(top_spy).toHaveBeenCalled()

        expect(manager.playlist.length).toBe(3)

        expect(play_spy.callCount).toBe(2)
        expect(search_spy).toHaveBeenCalled()

        first_track_id = manager.playlist.first().id

        expect(first_track_id).toBeDefined()
        expect(manager.get('current_track')).toBe(first_track_id)


    it "should set now playing and scrobble track", ->
        manager.playlist.reset(fixtures.playlist)

        update_playing_spy = spyOn(lastfm.track, "updateNowPlaying")
        scrobble_spy = spyOn(lastfm.track, "scrobble")

        manager.set 'current_track': manager.playlist.first().id
        manager.state.set 'name':'playing'

        expect(update_playing_spy).toHaveBeenCalled()        

        manager.state.set 'played': 50

        expect(scrobble_spy).toHaveBeenCalled()

    
    it "should not scrobble short track", ->
        manager.playlist.reset(fixtures.playlist)

        update_playing_spy = spyOn(lastfm.track, "updateNowPlaying")
        scrobble_spy = spyOn(lastfm.track, "scrobble")

        manager.set 'current_track': manager.playlist.models[1].id
        manager.currentTrack().set 'duration': 30
        manager.state.set 'name':'playing'

        expect(update_playing_spy).toHaveBeenCalled()

        manager.state.set 'played': 20

        expect(scrobble_spy).not.toHaveBeenCalled()

    
    it "should not scrobble same track to times in row", ->
        manager.playlist.reset(fixtures.playlist)

        update_playing_spy = spyOn(lastfm.track, "updateNowPlaying")
        scrobble_spy = spyOn(lastfm.track, "scrobble")

        manager.set 'current_track': manager.playlist.first().id
        manager.currentTrack().set 'duration': 100
        manager.state.set 'name':'playing'

        manager.state.set 'played': 50

        manager.state.set 'name':'paused'
        manager.state.set 'name':'playing'

        expect(scrobble_spy.callCount).toBe 1                