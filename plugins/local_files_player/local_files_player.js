(function() {
  var Player;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Player = (function() {
    __extends(Player, Backbone.Model);
    function Player() {
      Player.__super__.constructor.apply(this, arguments);
    }
    Player.prototype.initialize = function() {
      this.iframe_player = chromus.audio_players.iframe_player;
      this.background_playing = browser.isChrome || browser.isFirefox;
      _.bindAll(this);
      browser.addMessageListener(this.listener);
      return this.listener();
    };
    Player.prototype.listener = function(msg) {
      if (!msg) {
        return;
      }
      switch (msg.method) {
        case "localPlayer:addFiles":
          console.log('adding files to playlist');
          return chromus.music_manager.playlist.add(msg.files);
      }
    };
    Player.prototype.play = function(track) {};
    Player.prototype.preload = function(track) {};
    Player.prototype.pause = function() {};
    Player.prototype.setVolume = function(value) {};
    return Player;
  })();
  this.chromus.registerPlayer("local_files_player", new Player());
}).call(this);
