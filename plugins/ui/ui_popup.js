(function() {
  var App, Controls, Footer, Player, Playlist, PlaylistView, Track, TrackInfo;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Handlebars.registerHelper('spinner', function(context) {
    return "<span class='spinner'></span>";
  });
  Handlebars.registerHelper('lfm_img', function(size, context) {
    var image;
    return image = chromus.plugins.lastfm.image({
      artist: context.artist || context.name,
      size: size
    });
  });
  Track = (function() {
    __extends(Track, Backbone.Model);
    function Track() {
      Track.__super__.constructor.apply(this, arguments);
    }
    return Track;
  })();
  Playlist = (function() {
    __extends(Playlist, Backbone.Collection);
    function Playlist() {
      Playlist.__super__.constructor.apply(this, arguments);
    }
    Playlist.prototype.model = Track;
    return Playlist;
  })();
  Player = (function() {
    __extends(Player, Backbone.Model);
    function Player() {
      Player.__super__.constructor.apply(this, arguments);
    }
    Player.prototype.initialize = function() {
      _.bindAll(this, "listener");
      this.playlist = new Playlist();
      this.state = new Backbone.Model();
      return browser.addMessageListener(this.listener);
    };
    Player.prototype.currentTrack = function() {
      return this.playlist.get(this.get('current_track'));
    };
    Player.prototype.play = function(track) {
      if (track == null) {
        track = this.get('current_track');
      }
      this.set({
        'current_track': track
      });
      this.playlist.trigger('reset');
      this.state.set({
        'name': 'playing'
      });
      return browser.postMessage({
        method: 'play',
        track: parseInt(track)
      });
    };
    Player.prototype.pause = function() {
      this.state.set({
        'name': 'paused'
      });
      return browser.postMessage({
        method: 'pause'
      });
    };
    Player.prototype.next = function() {
      return browser.postMessage({
        method: 'nextTrack'
      });
    };
    Player.prototype.setPosition = function(position) {
      this.state.set({
        'played': position
      });
      return browser.postMessage({
        method: 'setPosition',
        position: position
      });
    };
    Player.prototype.setVolume = function(volume) {
      this.set({
        'volume': volume
      });
      return browser.postMessage({
        method: 'setVolume',
        volume: volume
      });
    };
    Player.prototype.listener = function(msg) {
      var _ref;
      if (msg.method.match("^sm2")) {
        return;
      }
      if (!msg.method.match('(playerState|updateState)')) {
        console.log("Popup received message", msg.method, msg);
      } else {
        if ((_ref = msg.state.name) === "playing" || _ref === "loading") {
          this.playlist.get(msg.track.id).set(msg.track);
          this.set({
            'current_track': msg.track.id
          });
        }
      }
      this.set({
        'settings': msg.settings != null ? msg.settings : void 0
      });
      this.set({
        'volume': msg.volume != null ? msg.volume : void 0
      });
      if (msg.state != null) {
        this.state.set(msg.state);
      }
      if (msg.volume != null) {
        console.warn(msg);
      }
      if (msg.playlist) {
        return this.playlist.reset(msg.playlist);
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
    Controls.prototype.search_template = Handlebars.compile($('#search_result_tmpl').html());
    Controls.prototype.events = {
      "click .inner": "setPosition",
      "click .progress": "setPosition",
      "click .toggle": "togglePlaying",
      "click .next": "nextTrack",
      "click .search": "toggleSearch",
      "keyup .search_bar .text": "search",
      "click .search_bar .result a": "playSearchedTrack"
    };
    Controls.prototype.initialize = function() {
      var opts;
      _.bindAll(this, "updateState", "togglePlaying", "search");
      this.model.state.bind('change', this.updateState);
      opts = {
        lines: 8,
        length: 2,
        width: 2,
        radius: 3,
        color: "#fff"
      };
      this.spinner = new Spinner(opts);
      return this.updateState(this.model.state);
    };
    Controls.prototype.updateState = function(state) {
      var toggle, track, _ref;
      track = this.model.currentTrack();
      state = state.toJSON();
      toggle = this.$('.toggle').removeClass('play pause');
      this.spinner.stop();
      switch (state.name) {
        case "playing":
        case "stopped":
          toggle.addClass('play');
          break;
        case "paused":
          toggle.addClass('pause');
          break;
        case "loading":
          this.spinner.spin(toggle[0]);
          break;
        default:
          toggle.addClass('play');
      }
      if (track != null ? track.get('duration') : void 0) {
        this.$('.inner').width(276.0 * state.played / track.get('duration'));
        this.$('.time').html("-" + prettyTime(track.get('duration') - state.played));
        if ((_ref = state.buffered) == null) {
          state.buffered = 0;
        }
        return this.$('.progress').width(278.0 * state.buffered / track.get('duration'));
      } else {
        return this.$('.time').html(prettyTime(0));
      }
    };
    Controls.prototype.setPosition = function(evt) {
      var position, track;
      track = this.model.currentTrack();
      position = (evt.offsetX / 278) * track.get('duration');
      return this.model.setPosition(position);
    };
    Controls.prototype.togglePlaying = function() {
      if (this.model.state.get('name') === "paused") {
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
      var render, text, view, _ref;
      if ((_ref = evt.keyCode) === 40 || _ref === 45 || _ref === 37 || _ref === 39 || _ref === 38) {
        return;
      }
      text = evt.currentTarget.value;
      if (!text.trim()) {
        return this.$('.search_bar .result').html('');
      } else {
        view = {
          'show_tracks': function(fn) {
            var _ref2;
            if (!this.tracks || ((_ref2 = this.tracks) != null ? _ref2.length : void 0)) {
              return fn(this);
            }
          },
          'show_albums': function(fn) {
            var _ref2;
            if (!this.albums || ((_ref2 = this.albums) != null ? _ref2.length : void 0)) {
              return fn(this);
            }
          },
          'show_artists': function(fn) {
            var _ref2;
            if (!this.artists || ((_ref2 = this.artists) != null ? _ref2.length : void 0)) {
              return fn(this);
            }
          }
        };
        render = __bind(function() {
          return this.$('.search_bar .result').html(this.search_template(view)).end().find('.loader').spin('small');
        }, this);
        render();
        chromus.plugins.lastfm.artist.search(text, __bind(function(artists) {
          if (artists == null) {
            artists = [];
          }
          view.artists = _.first(artists, 4);
          return render();
        }, this));
        chromus.plugins.lastfm.track.search(text, __bind(function(tracks) {
          if (tracks == null) {
            tracks = [];
          }
          view.tracks = _.first(tracks, 4);
          return render();
        }, this));
        return chromus.plugins.lastfm.album.search(text, __bind(function(albums) {
          if (albums == null) {
            albums = [];
          }
          view.albums = _.first(albums, 4);
          return render();
        }, this));
      }
    }, 500);
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
    TrackInfo.prototype.template = Handlebars.compile($('#track_info_tmpl').html());
    TrackInfo.prototype.initialize = function() {
      _.bindAll(this, "updateInfo");
      this.model.bind('change:current_track', this.updateInfo);
      return this.model.playlist.bind('all', this.updateInfo);
    };
    TrackInfo.prototype.updateInfo = function() {
      var last_fm, track, _ref;
      track = (_ref = this.model.currentTrack()) != null ? _ref.toJSON() : void 0;
      if (!track) {
        return this.el.empty();
      }
      track.image = chromus.plugins.lastfm.image({
        artist: track.artist,
        song: track.song
      });
      last_fm = "http://last.fm/music";
      track.artist_url = "" + last_fm + "/" + track.artist;
      track.album_url = "" + last_fm + "/" + track.artist + "/" + track.album;
      track.song_url = "" + last_fm + "/" + track.artist + "/_/" + track.song;
      return this.el.html(this.template(track)).show();
    };
    return TrackInfo;
  })();
  Footer = (function() {
    __extends(Footer, Backbone.View);
    function Footer() {
      Footer.__super__.constructor.apply(this, arguments);
    }
    Footer.prototype.el = $('#footer');
    Footer.prototype.events = {
      "click .menu": "toggleMenu",
      "click .volume": "toggleVolume",
      "click .volume_bar .bar_bg": "setVolume"
    };
    Footer.prototype.initialize = function() {
      _.bindAll(this);
      this.model.bind('change:volume', this.updateVolume);
      return this.updateVolume();
    };
    Footer.prototype.toggleMenu = function() {
      return $('#main_menu').toggle();
    };
    Footer.prototype.toggleVolume = function() {
      return this.model.setVolume(0);
    };
    Footer.prototype.setVolume = function(evt) {
      var total_width, volume;
      total_width = this.$('.volume_bar .bar_bg').width();
      volume = evt.layerX / total_width * 100;
      return this.model.setVolume(volume);
    };
    Footer.prototype.updateVolume = function() {
      return this.$('.volume_bar .bar').css({
        width: this.model.get('volume') + "%"
      });
    };
    return Footer;
  })();
  PlaylistView = (function() {
    __extends(PlaylistView, Backbone.View);
    function PlaylistView() {
      PlaylistView.__super__.constructor.apply(this, arguments);
    }
    PlaylistView.prototype.el = $('#playlist');
    PlaylistView.prototype.template = Handlebars.compile($('#playlist_tmpl').html());
    PlaylistView.prototype.events = {
      "click #playlist .song": "togglePlaying"
    };
    PlaylistView.prototype.initialize = function() {
      _.bindAll(this, 'updatePlaylist');
      this.model.playlist.bind('all', this.updatePlaylist);
      this.model.bind("change:current_track", this.updatePlaylist);
      return this.scroll = new iScroll('playlist', {
        bounce: false
      });
    };
    PlaylistView.prototype.togglePlaying = function(evt) {
      var id;
      id = +$.attr(evt.currentTarget, 'data-id');
      if (this.model.get('current_track') === id) {
        return this.model.pause();
      } else {
        return this.model.play(id);
      }
    };
    PlaylistView.prototype.artistPlaylistCount = function(artist, start_from) {
      var count, track, _i, _len, _ref;
      count = 0;
      _ref = this.model.playlist.models.slice(start_from);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        if (track.get('artist') === artist) {
          count++;
        }
      }
      return count;
    };
    PlaylistView.prototype.updatePlaylist = function() {
      var helpers, merge_rows, model, playlist, track, view, _i, _len;
      merge_rows = 0;
      playlist = this.model.playlist.toJSON();
      for (_i = 0, _len = playlist.length; _i < _len; _i++) {
        track = playlist[_i];
        track.artist_image = chromus.plugins.lastfm.image({
          artist: track.artist
        });
        track.previous = playlist[_i - 1];
        track.next = playlist[_i + 1];
        if (!track.previous || track.previous.artist !== track.artist) {
          track.artist_playlist_count = this.artistPlaylistCount(track.artist, _i);
        }
      }
      view = {
        playlist: playlist
      };
      model = this.model;
      helpers = {
        is_previous: function(fn) {
          if (!this.previous || this.previous.artist !== this.artist) {
            return fn(this);
          }
        },
        is_next: function(fn) {
          if (!this.next || this.next.artist !== this.artist) {
            return fn(this);
          }
        },
        title: function(fn) {
          if (this.type === 'artist') {
            return "Loading...";
          } else {
            return this.song || this.name;
          }
        },
        more_then_two: function(fn) {
          if (this.artist_playlist_count > 2) {
            return fn(this);
          }
        },
        is_current: function(fn) {
          if (this.id === model.get('current_track')) {
            return fn(this);
          }
        }
      };
      helpers = _.defaults(helpers, Handlebars.helpers);
      this.el.find('.container').html(this.template(view, {
        helpers: helpers
      }));
      this.el.css({
        visibility: 'visible'
      });
      this.el.find('.track_container:odd').addClass('odd');
      return this.scroll.refresh();
    };
    return PlaylistView;
  })();
  App = (function() {
    __extends(App, Backbone.View);
    function App() {
      App.__super__.constructor.apply(this, arguments);
    }
    App.prototype.initialize = function() {
      this.model = new Player();
      this.playlist = new PlaylistView({
        model: this.model
      });
      this.controls = new Controls({
        model: this.model
      });
      this.track_info = new TrackInfo({
        model: this.model
      });
      this.footer = new Footer({
        model: this.model
      });
      return $('#dialog').bind('click', function(evt) {
        if (evt.target.id === "dialog") {
          return $('#dialog').hide();
        }
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
  this.app = new App();
  $(function() {
    return browser.onReady(function() {
      return app.start();
    });
  });
}).call(this);
