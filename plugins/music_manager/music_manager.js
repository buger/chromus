(function() {
  var MusicManager, Playlist, Track;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Track = (function() {
    __extends(Track, Backbone.Model);
    function Track() {
      Track.__super__.constructor.apply(this, arguments);
    }
    Track.prototype.initialize = function() {
      if (!this.id) {
        return this.set({
          'id': chromus.utils.uid()
        });
      }
    };
    Track.prototype.title = function() {
      return "" + (this.get('artist')) + " " + (this.get('song'));
    };
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
  MusicManager = (function() {
    __extends(MusicManager, Backbone.Model);
    function MusicManager() {
      MusicManager.__super__.constructor.apply(this, arguments);
    }
    MusicManager.prototype.initialize = function() {
      _.bindAll(this, "onPlaylistReset", "updateState");
      this.playlist = new Playlist();
      this.state = new Backbone.Model();
      this.settings = new Backbone.Model();
      this.playlist.bind('reset', this.onPlaylistReset);
      this.playlist.reset();
      this.setPlayer();
      return this.setVolume();
    };
    MusicManager.prototype.setPlayer = function(player) {
      if (player == null) {
        player = 'iframe_player';
      }
      if (this.player) {
        this.player.state.unbind();
      }
      this.player = chromus.audio_players[player];
      return this.player.state.bind('change', this.updateState);
    };
    MusicManager.prototype.pause = function() {
      this.state.set({
        'name': 'paused'
      });
      return this.player.pause();
    };
    MusicManager.prototype.play = function(track) {
      this.state.set({
        'name': 'playing'
      });
      return this.player.play(track.toJSON());
    };
    MusicManager.prototype.preload = function(track) {
      return this.player.preload(track.toJSON());
    };
    MusicManager.prototype.stop = function() {
      this.unset('current_track');
      this.state.set({
        'name': 'stopped'
      }, {
        silent: true
      });
      if (this.player) {
        this.player.stop();
      }
      return this.setEmptyState();
    };
    MusicManager.prototype.setPosition = function(value) {
      return this.player.setPosition(value);
    };
    MusicManager.prototype.onPlaylistReset = function() {
      return this.stop();
    };
    MusicManager.prototype.currentTrack = function() {
      return this.playlist.get(this.get('current_track'));
    };
    MusicManager.prototype.nextTrack = function() {
      var index, next_track;
      if (!this.get('current_track')) {
        return;
      }
      if (this.settings.get('shuffle')) {
        return this.playlist.models[Math.floor(Math.random() * this.playlist.length - 1)];
      } else {
        index = this.playlist.indexOf(this.currentTrack());
        next_track = this.playlist.models[index + 1];
        if (this.settings.get('repeat') && !next_track) {
          console.warn(this.playlist.first());
          return this.playlist.first();
        } else {
          return next_track;
        }
      }
    };
    MusicManager.prototype.prevTrack = function() {
      var index;
      index = this.playlist.indexOf(this.currentTrack());
      return this.playlist.models[index - 1];
    };
    MusicManager.prototype.setEmptyState = function() {
      return this.state.set({
        duration: 0,
        played: 0,
        buffered: 0,
        name: "stopped"
      });
    };
    MusicManager.prototype.updateState = function(state) {
      var track;
      this.state.set(state.toJSON());
      track = this.currentTrack();
      if (state.get('name') === "stopped") {
        console.warn('updateState', state.toJSON(), this.state.toJSON(), this.nextTrack().toJSON());
        return this.playTrack(this.nextTrack());
      }
    };
    MusicManager.prototype.searchTrack = function(track, callback) {
      var name, obj, results, searchCallback, _ref, _results;
      if (callback == null) {
        callback = function() {};
      }
      results = [];
      searchCallback = __bind(function() {
        var match;
        if (!_.isEmpty(results)) {
          match = results[0];
          track.set({
            'file_url': match.file_url,
            'duration': match.duration
          });
          if (!track.get('source_title')) {
            track.set({
              'source_title': match.source_title,
              'source_icon': match.source_icon
            });
          }
          return callback(track);
        } else {
          return this.playTrack(this.nextTrack());
        }
      }, this);
      _ref = chromus.audio_sources;
      _results = [];
      for (name in _ref) {
        obj = _ref[name];
        _results.push(obj.search({
          artist: track.get('artist'),
          song: track.get('song')
        }, function(tracks) {
          results = _.union(results, tracks);
          return searchCallback();
        }));
      }
      return _results;
    };
    MusicManager.prototype.playTrack = function(track) {
      if (_.isNumber(track)) {
        track = this.playlist.get(track);
      }
      if (!track) {
        return;
      }
      if (!_.isFunction(track.get)) {
        track = new Track(track);
      }
      if (!track.get('action')) {
        if (track !== this.currentTrack()) {
          console.warn('stopping');
          this.stop();
        }
        if (track.get('type') == null) {
          this.set({
            'current_track': track.id
          });
        }
        this.state.set({
          'name': 'loading'
        });
      }
      if (track.get('type') == null) {
        if (track.get('file_url')) {
          return this.play(track);
        } else {
          return this.searchTrack(track, __bind(function() {
            return this.playTrack(track);
          }, this));
        }
      } else {
        return chromus.media_types[track.get('type')](track, __bind(function(resp, reset) {
          if (reset == null) {
            reset = true;
          }
          if (reset) {
            this.playlist.reset(resp);
            return this.playTrack(this.playlist.first().id);
          } else {
            track.set(resp);
            track.unset('type');
            return this.playTrack(track);
          }
        }, this));
      }
    };
    MusicManager.prototype.setVolume = function(volume) {
      if (volume != null) {
        this.volume = volume;
      }
      return this.player.setVolume(this.volume);
    };
    MusicManager.prototype.getVolume = function() {
      var _ref;
      return (_ref = this.volume) != null ? _ref : 100;
    };
    MusicManager.prototype.getState = function() {
      return this.state.toJSON();
    };
    return MusicManager;
  })();
  chromus.registerPlugin("music_manager", new MusicManager());
}).call(this);
