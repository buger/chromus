(function() {
  var fixtures, manager;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  manager = chromus.plugins.music_manager;
  fixtures = {
    playlist: [
      {
        'song': 'Song 1',
        'artist': 'Beatles'
      }, {
        'song': 'Song 2',
        'artist': 'Chuck Berry'
      }, {
        'song': 'Song 3',
        'artist': 'Louess Reed'
      }
    ],
    searchResults: [
      {
        'song': 'Help',
        'artist': 'Beatles',
        'file_url': 'http://a/1.mp3'
      }, {
        'song': 'Song 2',
        'artist': 'Chuck Berry',
        'file_url': 'http://a/2.mp3'
      }
    ]
  };
  describe("Music manager", function() {
    beforeEach(function() {
      return manager.playlist.reset();
    });
    it("should load artist top tracks", function() {
      var first_track_id, play_spy, search_spy, top_spy;
      top_spy = spyOn(manager.lastfm.artist, 'getTopTracks').andCallFake(__bind(function(artist, callback) {
        return callback(fixtures.playlist);
      }, this));
      search_spy = spyOn(manager, "searchTrack");
      play_spy = spyOn(manager, 'playTrack').andCallThrough();
      manager.playTrack({
        type: "artist",
        artist: "Chuck Berry"
      });
      expect(top_spy).toHaveBeenCalled();
      expect(manager.playlist.length).toBe(3);
      expect(play_spy.callCount).toBe(2);
      expect(search_spy).toHaveBeenCalled();
      first_track_id = manager.playlist.first().id;
      expect(first_track_id).toBeDefined();
      return expect(manager.get('current_track')).toBe(first_track_id);
    });
    it("should play song after searching", function() {
      var play_spy, play_track_spy, search_spy, vk_spy;
      search_spy = spyOn(manager, "searchTrack").andCallThrough();
      play_track_spy = spyOn(manager, "playTrack").andCallThrough();
      play_spy = spyOn(manager, "play");
      vk_spy = spyOn(chromus.audio_sources.vkontakte, "search").andCallFake(function(track, callback) {
        return callback(fixtures.searchResults);
      });
      manager.playlist.reset(fixtures.playlist);
      manager.playTrack(manager.playlist.first());
      expect(search_spy).toHaveBeenCalled();
      expect(vk_spy).toHaveBeenCalled();
      expect(manager.currentTrack().get('file_url')).toBe(fixtures.searchResults[0].file_url);
      expect(play_track_spy.callCount).toBe(2);
      return expect(play_spy).toHaveBeenCalled();
    });
    it("should change player state", function() {
      var play_spy, state_spy, vk_spy;
      manager.playlist.reset(fixtures.playlist);
      expect(manager.state.get('name')).toBe("stopped");
      state_spy = jasmine.createSpy();
      play_spy = spyOn(manager, "play");
      vk_spy = spyOn(chromus.audio_sources.vkontakte, "search").andCallFake(function(track, callback) {
        return callback(fixtures.searchResults);
      });
      manager.state.bind('change', state_spy);
      manager.playTrack(manager.playlist.first());
      expect(state_spy).toHaveBeenCalled();
      expect(manager.state.get('name')).toBe('loading');
      manager.player.state.set({
        name: "playing"
      });
      expect(manager.state.get('name')).toBe('playing');
      manager.stop();
      expect(manager.state.get('name')).toBe('stopped');
      manager.pause();
      return expect(manager.state.get('name')).toBe('paused');
    });
    it("should change state to paused", function() {
      manager.playlist.reset(fixtures.playlist);
      manager.pause();
      return expect(manager.state.get('name')).toBe("paused");
    });
    it("should reset current_track after stop", function() {
      manager.playlist.reset(fixtures.playlist);
      manager.set({
        'current_track': manager.playlist.first().id
      });
      manager.state.set({
        'name': 'playing'
      });
      manager.stop();
      expect(manager.state.get('name')).toBe('stopped');
      return expect(manager.state.get('current_track')).toBeUndefined();
    });
    return it("should change next track after stopping", function() {
      var play_track_spy, search_spy, update_state_spy, vk_spy;
      manager.playlist.reset(fixtures.playlist);
      manager.set({
        'current_track': manager.playlist.first().id
      });
      manager.state.set({
        'name': 'playing'
      });
      update_state_spy = spyOn(manager, "updateState").andCallThrough();
      play_track_spy = spyOn(manager, "playTrack").andCallThrough();
      search_spy = spyOn(manager, "searchTrack").andCallThrough();
      vk_spy = spyOn(chromus.audio_sources.vkontakte, "search").andCallFake(function(track, callback) {
        return callback(fixtures.searchResults);
      });
      manager.player.state.set({
        name: "stopped"
      });
      expect(play_track_spy).toHaveBeenCalled();
      expect(search_spy).toHaveBeenCalled();
      expect(vk_spy).toHaveBeenCalled();
      expect(manager.get('current_track')).toBe(manager.playlist.models[1].id);
      manager.player.state.set({
        name: "stopped"
      });
      return expect(manager.get('current_track')).toBe(manager.playlist.models[2].id);
    });
  });
}).call(this);
