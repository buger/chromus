(function() {
  var Player, PlayerView;
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
    return Player;
  })();
  PlayerView = (function() {
    __extends(PlayerView, Backbone.View);
    function PlayerView() {
      PlayerView.__super__.constructor.apply(this, arguments);
    }
    PlayerView.prototype.el = $('#wrapper');
    PlayerView.prototype.model = new Player();
    PlayerView.prototype.initialize = function() {
      _.bindAll(this, 'listener', 'changeState', 'updatePlaylist');
      this.model.bind('change:state', this.changeState);
      this.model.bind('change:playlist', this.updatePlaylist);
      browser.addMessageListener(this.listener);
      browser.postMessage({
        method: 'getPlaylist'
      });
      return browser.postMessage({
        method: 'getSettings'
      });
    };
    PlayerView.prototype.changeState = function() {
      var classes;
      classes = ['play', 'pause'];
      if (this.model.get('state').paused) {
        classes.reverse();
      }
      return $('#header .control.play').removeClass(classes[0]).addClass(classes[1]);
    };
    PlayerView.prototype.artistInLine = function(start_from, arr) {
      var counter, item, length, _i, _len, _ref, _ref2, _ref3;
      length = arr.length;
      counter = 0;
      if (start_from >= length) {
        return counter;
      }
      _ref = arr.slice(start_from + 1, (length - 1 + 1) || 9e9);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (((_ref2 = item.artist) != null ? _ref2.replaceEntities() : void 0) === ((_ref3 = arr[start_from].artist) != null ? _ref3.replaceEntities() : void 0)) {
          counter += 1;
        } else {
          return counter;
        }
      }
      return counter;
    };
    PlayerView.prototype.updatePlaylist = function() {
      var merge_rows, pane, playlist, playlist_tmpl, track, _i, _len;
      merge_rows = 0;
      playlist_tmpl = $('#playlist_tmpl');
      playlist = this.model.get('playlist');
      for (_i = 0, _len = playlist.length; _i < _len; _i++) {
        track = playlist[_i];
        track.artist_image = Scrobbler.getImage({
          artist: track.artist
        });
      }
      pane = $("#playlist").data('jsp');
      if (pane) {
        pane.getContentPane().html(playlist_tmpl.tmpl({
          playlist: playlist
        }));
        pane.reinitialise();
      } else {
        $('#playlist').html(playlist_tmpl.tmpl({
          playlist: playlist
        }));
        $("#playlist").jScrollPane({
          maintainPosition: true
        });
      }
      return $('#playlist').css({
        visibility: 'visible'
      });
    };
    PlayerView.prototype.listener = function(msg) {
      var data, param, _i, _len, _ref;
      if (msg.method !== 'updateState') {
        console.log("Popup received message", msg.method, msg);
      }
      data = {};
      _ref = ['playlist', 'state', 'settings'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        if (msg[param] != null) {
          data[param] = msg[param];
        }
      }
      return this.model.set(data);
    };
    return PlayerView;
  })();
  $(function() {
    return browser.onReady(function() {
      return new PlayerView();
    });
  });
}).call(this);
