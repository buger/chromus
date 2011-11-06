describe "LastFM plugin", -> 

    fixtures =
        top_tracks: {"toptracks":{"track":[{"name":"Karma Police","duration":"262","playcount":"579659","listeners":"175046","mbid":"","url":"http:\/\/www.last.fm\/music\/Radiohead\/_\/Karma+Police","streamable":{"#text":"1","fulltrack":"0"},"artist":{"name":"Radiohead","mbid":"a74b1b7f-71a5-4011-9441-d0b5e4122711","url":"http:\/\/www.last.fm\/music\/Radiohead"},"image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/66781226.png","size":"small"}],"@attr":{"rank":"1"}}],"@attr":{"artist":"Radiohead","page":"1","perPage":"50","totalPages":"20","total":"1000"}}}

    lastfm = chromus.plugins.lastfm

    
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