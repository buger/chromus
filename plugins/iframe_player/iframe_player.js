(function() {
  var Player;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Player = (function() {

    __extends(Player, Backbone.Model);

    function Player() {
      Player.__super__.constructor.apply(this, arguments);
    }

    Player.prototype.player_url = "http://chromusapp.appspot.com/";

    Player.prototype.initialize = function() {
      _.bindAll(this);
      this.path = chromus.plugins_info['iframe_player'].path;
      this.state = new Backbone.Model();
      return this.createFrame();
    };

    Player.prototype.createFrame = function() {
      this.player_frame = document.createElement("iframe");
      this.player_frame.id = 'player_frame';
      this.player_frame.style.display = 'none';
      if (!browser.isFrame && !browser.isSafari) {
        this.player_frame.src = this.player_url + "sm2_iframe";
      } else {
        this.player_frame.src = ("" + this.path + "/lib/iframe.htm?") + (+new Date());
      }
      document.body.appendChild(this.player_frame);
      this.player_ready = false;
      return window.addEventListener('message', this.listener, false);
    };

    Player.prototype.listener = function(evt) {
      var msg;
      if (!evt.data) return;
      msg = JSON.parse(evt.data);
      switch (msg.method) {
        case 'sm2:playerState':
          return this.state.set(msg.state);
        case 'sm2:ready':
          return this.player_ready = true;
        case 'sm2:finished':
          this.state.set({
            name: "stopped"
          });
          return this.state.unset('name', {
            silent: true
          });
      }
    };

    Player.prototype.postMessageToPlayer = function(data) {
      return this.player_frame.contentWindow.postMessage(JSON.stringify(data), '*');
    };

    Player.prototype.play = function(track) {
      this.state.unset('name', {
        silent: true
      });
      this.postMessageToPlayer({
        'method': 'play',
        'url': track.file_url,
        'track': track.id,
        'use_flash': track.use_flash
      });
      return this.setVolume();
    };

    Player.prototype.preload = function(track) {
      return this.postMessageToPlayer({
        'method': 'preload',
        'url': track.file_url,
        'track': track.id,
        'use_flash': track.use_flash
      });
    };

    Player.prototype.pause = function() {
      return this.postMessageToPlayer({
        'method': 'pause'
      });
    };

    Player.prototype.stop = function() {
      return this.postMessageToPlayer({
        'method': 'stop'
      });
    };

    Player.prototype.setVolume = function(value) {
      if (value == null) value = this.value;
      this.value = value != null ? value : 100;
      return this.postMessageToPlayer({
        'method': 'setVolume',
        'volume': this.value
      });
    };

    Player.prototype.setPosition = function(value) {
      return this.postMessageToPlayer({
        'method': 'setPosition',
        'position': value
      });
    };

    return Player;

  })();

  this.chromus.registerPlayer("iframe_player", new Player());

}).call(this);
