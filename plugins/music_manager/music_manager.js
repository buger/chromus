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
      return this.player.stop();
    };
    MusicManager.prototype.setPosition = function(value) {
      return this.player.setPosition(value);
    };
    MusicManager.prototype.onPlaylistReset = function() {
      return this.setEmptyState();
    };
    MusicManager.prototype.currentTrack = function() {
      return this.playlist.get(this.get('current_track'));
    };
    MusicManager.prototype.nextTrack = function() {
      var index;
      index = this.playlist.indexOf(this.currentTrack());
      return this.playlist.models[index + 1];
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
      var track, _base, _ref;
      this.state.set(state);
      track = this.currentTrack();
      if (track != null) {
        if ((_ref = (_base = track.attributes).duration) == null) {
          _base.duration = state.duration;
        }
      }
      if (this.state.get('name') === "stopped") {
        return this.playTrack(this.nextTrack());
      } else if ((track != null ? track.get('duration') : void 0) && (this.state.get('played') - track.get('duration')) >= 0) {
        return this.updateState({
          name: "stopped"
        });
      }
    };
    MusicManager.prototype.searchTrack = function(track, callback) {
      var name, obj, player, results, searchCallback, _ref, _results;
      if (callback == null) {
        callback = function() {};
      }
      results = [];
      if (!track.get('player')) {
        searchCallback = function() {
          var match;
          if (!_.isEmpty(results)) {
            match = results[0];
            track.set({
              'file_url': match.file_url,
              'duration': match.duration,
              'source_title': match.source_title,
              'source_icon': match.source_icon
            });
            return callback(track);
          }
        };
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
      } else {
        player = chromus.audio_players[track.get('player')];
        return player.search(track, function(result) {
          track.set({
            'file_url': result.file_url.slice(0, 201)
          });
          return callback(track);
        });
      }
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
      if (track !== this.currentTrack()) {
        this.stop();
      }
      if (track.get('type') == null) {
        this.set({
          'current_track': track.id
        });
        if (track.get('file_url')) {
          return this.play(track);
        } else {
          this.state.set({
            'name': 'loading'
          });
          return this.searchTrack(track, __bind(function() {
            return this.playTrack(track);
          }, this));
        }
      } else {
        return chromus.media_types[track.get('type')](track.toJSON(), __bind(function(tracks) {
          this.playlist.reset(tracks);
          return this.playTrack(this.playlist.first().id);
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
