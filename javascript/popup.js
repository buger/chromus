(function() {
  var App, Controls, Player, Playlist, TrackInfo, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Player = (function() {
    __extends(Player, Backbone.Model);
    function Player() {
      Player.__super__.constructor.apply(this, arguments);
    }
    Player.prototype.initialize = function() {
      _.bindAll(this, "listener");
      return browser.addMessageListener(this.listener);
    };
    Player.prototype.play = function(track) {
      if (track == null) {
        track = this.get('current_track');
      }
      this.set({
        'current_track': track
      });
      this.attributes.state.paused = false;
      this.trigger('change:state');
      return browser.postMessage({
        method: 'play',
        track: parseInt(track)
      });
    };
    Player.prototype.pause = function() {
      this.attributes.state.paused = true;
      this.trigger('change:state');
      return browser.postMessage({
        method: 'pause'
      });
    };
    Player.prototype.next = function() {
      return browser.postMessage({
        method: 'nextTrack'
      });
    };
    Player.prototype.getCurrentTrack = function() {
      return this.get('playlist')[this.get('current_track')];
    };
    Player.prototype.listener = function(msg) {
      var data, param, _i, _len, _ref;
      if (msg.method !== 'updateState') {
        console.log("Popup received message", msg.method, msg);
      }
      data = {};
      _ref = ['playlist', 'state', 'settings', 'current_track'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        if (msg[param] != null) {
          data[param] = msg[param];
        }
      }
      this.set(data);
      if (msg.track) {
        this.get('playlist')[msg.track_index] = msg.track;
      }
      switch (msg.method) {
        case 'play':
        case 'readyToPlay':
        case 'loading':
          this.attributes.playlist[msg.track_index] = msg.track;
          this.attributes.current_track = msg.track_index;
          return this.trigger('change:current_track');
        case 'stop':
          this.attributes.state.paused = false;
          return this.trigger('change:state');
      }
    };
    return Player;
  })();
  Controls = (function() {
    __extends(Controls, Backbone.View);
    function Controls() {
      Controls.__super__.constructor.apply(this, arguments);
    }
    Controls.prototype.el = $('#header');
    Controls.prototype.events = {
      "click .toggle": "togglePlaying",
      "click .next": "nextTrack",
      "click .search": "toggleSearch",
      "keyup .search_bar .text": "search",
      "click .search_bar .result .sm2_button": "playSearchedTrack"
    };
    Controls.prototype.initialize = function() {
      _.bindAll(this, "updateState", "togglePlaying", "search");
      return this.model.bind('change:state', this.updateState);
    };
    Controls.prototype.updateState = function() {
      var state, _ref, _ref2;
      state = this.model.get('state');
      this.$('.toggle').removeClass('play pause').addClass(state.paused || state.finished ? 'play' : 'pause');
            if ((_ref = state.played) != null) {
        _ref;
      } else {
        state.played = 0;
      };
      this.$('.inner').width(276.0 * state.played / state.duration);
      this.$('.time').html(prettyTime(state.played));
            if ((_ref2 = state.buffered) != null) {
        _ref2;
      } else {
        state.buffered = 0;
      };
      return this.$('.progress').width(278.0 * state.buffered / state.duration);
    };
    Controls.prototype.togglePlaying = function() {
      if (this.model.get('state').paused) {
        return this.model.play();
      } else {
        return this.model.pause();
      }
    };
    Controls.prototype.nextTrack = function() {
      return this.model.next();
    };
    Controls.prototype.toggleSearch = function() {
      var bar;
      bar = this.$('.search_bar').toggle();
      if (bar.is(':visible')) {
        return bar.find('input').focus();
      }
    };
    Controls.prototype.search = _.debounce(function(evt) {
      var text;
      text = evt.currentTarget.value;
      if (!text.trim()) {
        return this.$('.search_bar .result').html('');
      } else {
        return Scrobbler.search(text, __bind(function(response) {
          return this.$('.search_bar .result').html(response.html);
        }, this));
      }
    }, 300);
    Controls.prototype.playSearchedTrack = function(evt) {
      var track_info;
      track_info = getTrackInfo(evt.currentTarget);
      browser.postMessage({
        method: 'play',
        track: track_info,
        playlist: [track_info]
      });
      return this.toggleSearch();
    };
    return Controls;
  })();
  TrackInfo = (function() {
    __extends(TrackInfo, Backbone.View);
    function TrackInfo() {
      TrackInfo.__super__.constructor.apply(this, arguments);
    }
    TrackInfo.prototype.el = $('#current_song');
    TrackInfo.prototype.template = $('#track_info_tmpl');
    TrackInfo.prototype.initialize = function() {
      _.bindAll(this, "updateInfo");
      this.model.bind('change:current_track', this.updateInfo);
      return this.model.bind('change:playlist', this.updateInfo);
    };
    TrackInfo.prototype.updateInfo = function() {
      var last_fm, track;
      if (!(this.model.get('current_track') != null)) {
        return this.el.empty();
      }
      track = this.model.getCurrentTrack();
      track.image = Scrobbler.getImage({
        artist: track.artist,
        song: track.song
      });
      last_fm = "http://last.fm/music";
      track.artist_url = "" + last_fm + "/" + track.artist;
      track.album_url = "" + last_fm + "/" + track.artist + "/" + track.album;
      track.song_url = "" + last_fm + "/" + track.artist + "/_/" + track.song;
      return this.el.html(this.template.tmpl(track)).show();
    };
    return TrackInfo;
  })();
  Playlist = (function() {
    __extends(Playlist, Backbone.View);
    function Playlist() {
      Playlist.__super__.constructor.apply(this, arguments);
    }
    Playlist.prototype.el = $('#playlist');
    Playlist.prototype.events = {
      "click #playlist .song": "togglePlaying"
    };
    Playlist.prototype.initialize = function() {
      _.bindAll(this, 'updatePlaylist', 'updateCurrentTrack');
      this.model.bind('change:playlist', this.updatePlaylist);
      return this.model.bind('change:current_track', this.updateCurrentTrack);
    };
    Playlist.prototype.togglePlaying = function(evt) {
      var index;
      index = $.attr(evt.currentTarget, 'data-index');
      if (this.model.get('current_track') === index) {
        return this.model.pause();
      } else {
        return this.model.play(index);
      }
    };
    Playlist.prototype.updateCurrentTrack = function() {
      this.$('.playing').removeClass('playing');
      return this.$(".song").eq(this.model.get('current_track')).addClass("playing");
    };
    Playlist.prototype.artistPlaylistCount = function(artist, start_from) {
      var count, track, _i, _len, _ref;
      count = 0;
      _ref = this.model.get('playlist').slice(start_from);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        if (track.artist === artist) {
          count += 1;
        }
      }
      return count;
    };
    Playlist.prototype.updatePlaylist = function() {
      var merge_rows, pane, playlist, playlist_tmpl, track, _i, _len;
      merge_rows = 0;
      playlist_tmpl = $('#playlist_tmpl');
      playlist = this.model.get('playlist');
      for (_i = 0, _len = playlist.length; _i < _len; _i++) {
        track = playlist[_i];
        track.artist_image = Scrobbler.getImage({
          artist: track.artist
        });
        track.previous = playlist[_i - 1];
        track.next = playlist[_i + 1];
        if (!track.previous || track.previous.artist !== track.artist) {
          track.artist_playlist_count = this.artistPlaylistCount(track.artist, _i);
        }
      }
      pane = this.el.data('jsp');
      if (pane) {
        pane.getContentPane().html(playlist_tmpl.tmpl({
          playlist: playlist
        }));
        pane.reinitialise();
      } else {
        this.el.html(playlist_tmpl.tmpl({
          playlist: playlist
        }));
        this.el.jScrollPane({
          maintainPosition: true
        });
      }
      return $('#playlist').css({
        visibility: 'visible'
      });
    };
    return Playlist;
  })();
  App = (function() {
    __extends(App, Backbone.View);
    function App() {
      App.__super__.constructor.apply(this, arguments);
    }
    App.prototype.initialize = function() {
      this.model = new Player();
      new Playlist({
        model: this.model
      });
      new Controls({
        model: this.model
      });
      return new TrackInfo({
        model: this.model
      });
    };
    App.prototype.start = function() {
      browser.postMessage({
        method: 'getPlaylist'
      });
      return browser.postMessage({
        method: 'getSettings'
      });
    };
    return App;
  })();
  app = new App();
  $(function() {
    return browser.onReady(function() {
      return app.start();
    });
  });
}).call(this);
