
  describe("Iframe music player", function() {
    var manager, player;
    manager = chromus.plugins.music_manager;
    player = chromus.audio_players.iframe_player;
    it("should be defined", function() {
      return expect(player).toBeDefined();
    });
    return it("should load frame from same host", function() {
      expect(player.player_frame).not.toMatch(/chromusapp.com/);
      return waitsFor(function() {
        return player.player_ready;
      }, "player frame not loaded", 2000);
    });
  });
