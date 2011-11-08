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
      return browser.addMessageListener(this.listener);
    };
    Player.prototype.listener = function(msg) {
      var _ref;
      switch (msg.method) {
        case 'localPlayer:fileContent':
          if ((_ref = this.callback) == null) {
            this.callback = function() {};
          }
          console.warn('received file content', msg);
          return this.callback({
            file_url: msg.content
          });
      }
    };
    Player.prototype.search = function(track, callback) {
      browser.postMessage({
        method: "localPlayer:getContent",
        id: track.id
      });
      return this.callback = callback;
    };
    return Player;
  })();
  this.chromus.registerPlayer("local_files_player", new Player());
}).call(this);
