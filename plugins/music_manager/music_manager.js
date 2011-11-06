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
  if (typeof _gaq === "undefined" || _gaq === null) {
    _gaq = [];
  }
  Track = (function() {
    __extends(Track, Backbone.Model);
    function Track() {
      Track.__super__.constructor.apply(this, arguments);
    }
    Track.prototype.initialize = function() {
      return this.set({
        'id': chromus.utils.uid()
      });
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
    MusicManager.prototype.lastfm = chromus.plugins.lastfm;
    MusicManager.prototype.initialize = function() {
      _.bindAll(this, "onPlaylistReset", "updateState");
      this.playlist = new Playlist();
      this.state = new Backbone.Model();
      this.playlist.bind('reset', this.onPlaylistReset);
      this.playlist.reset();
      return this.setPlayer();
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
      return this.player.play(track.toJSON());
    };
    MusicManager.prototype.preload = function(track) {
      return this.player.preload(track.toJSON());
    };
    MusicManager.prototype.stop = function() {
      this.unset('current_track');
      this.state.set({
        'name': 'stopped',
        silent: true
      });
      return this.player.stop();
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
      var track;
      this.state.set(state);
      track = this.currentTrack();
      if (this.state.get('name') === "stopped") {
        return this.playTrack(this.nextTrack());
      }
      if ((track != null) && Math.round(this.state.get('played')) >= Math.round(track.duration)) {
        return updateState({
          name: "stopped"
        });
      }
    };
    MusicManager.prototype.searchTrack = function(track, callback) {
      var name, obj, results, searchCallback, _ref, _results;
      if (callback == null) {
        callback = function() {};
      }
      results = [];
      searchCallback = function() {
        var match;
        match = results[0];
        track.set({
          'file_url': match.file_url
        });
        return callback(track);
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
      switch (track.get('type')) {
        case 'artist':
          return this.lastfm.artist.getTopTracks(track.get('artist'), __bind(function(tracks) {
            this.playlist.reset(tracks);
            return this.playTrack(this.playlist.first().id);
          }, this));
        case 'album':
          break;
        default:
          this.set({
            'current_track': track.id
          });
          console.warn(track);
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
      }
    };
    MusicManager.prototype.showNotification = function() {
      var notification, show_notification, track;
      track = this.currentTrack();
      show_notification = window.localStorage["show_notifications"] === "true" || window.localStorage["show_notifications"] === void 0;
      if (!show_notification || !track || !window.webkitNotifications) {
        return;
      }
      notification = window.webkitNotifications.createNotification(track.image, track.song, track.artist);
      notification.show();
      return setTimeout(function() {
        return notification.cancel();
      }, 6000);
    };
    MusicManager.prototype.updateID3Info = function(trackIndex, callback) {
      var file_name, track;
      if (callback == null) {
        callback = function() {};
      }
      track = this.playlist[trackIndex];
      if (track.file_url && !track.file_url.match(/^data/)) {
        file_name = track.file_url.substring(track.file_url.lastIndexOf("/") + 1).replace(/\.\w{3}$/, '');
        return ID3.loadTags(track.file_url, function() {
          var tags;
          tags = ID3.getAllTags(track.file_url);
          console.log("ID3 Tags:", tags);
          if (tags.title) {
            track.song = tags.title;
            track.artist = tags.artist || "Unknown";
            track.album = tags.album;
            if (!track.song) {
              tack.song = file_name;
            }
            if (trackIndex === this.current_track) {
              this.lastfm.setNowPlaying(track.artist, track.song, track.album, this.state.get('duration'));
              this.showNotification();
              this.state.set({
                name: "loading"
              });
            }
          } else {
            track.artist = "Unknown";
            track.song = file_name;
            track.id3_empty = true;
          }
          return callback();
        });
      }
    };
    MusicManager.prototype.updateTrackInfo = function(trackIndex, callback) {
      var track;
      track = this.currentTrack();
      if (callback == null) {
        callback = function() {};
      }
      if (track.artist === void 0) {
        if (track.file_url === !track.id3_empty) {
          return this.updateID3Info(trackIndex, __bind(function() {
            return this.updateTrackInfo(trackIndex, callback);
          }, this));
        } else {
          track.info = {};
          return callback();
        }
      } else if (!track.info) {
        return this.lastfm.trackInfo(track.artist, track.song, __bind(function(response) {
          if (response.track_info) {
            track.info = response.track_info;
            if (track.info.album) {
              track.album = track.info.album.title;
              track.image = track.info.album.image;
            }
          }
          if (!track.image) {
            return this.lastfm.artistInfo(track.artist, function(resp) {
              track.image = resp.image;
              return callback();
            });
          } else {
            return callback();
          }
        }, this));
      } else {
        return callback();
      }
    };
    MusicManager.prototype.playRadio = function(radio) {
      this.radio = radio;
      this.playlist.reset();
      return this.playNextTrack();
    };
    MusicManager.prototype.setVolume = function(volume) {
      if (volume != null) {
        this.volume = volume;
      }
      return this.player.setVolume(this.getVolume());
    };
    MusicManager.prototype.getVolume = function() {
      if (this.volume === void 0) {
        this.volume = 100;
      }
      return this.volume;
    };
    MusicManager.prototype.love = function() {
      var track;
      track = this.currentTrack();
      if (track) {
        return this.lastfm.loveTrack(track.artist, track.song);
      }
    };
    MusicManager.prototype.ban = function() {
      var track;
      track = this.currentTrack();
      if (track) {
        return this.lastfm.banTrack(track.artist, track.song);
      }
    };
    MusicManager.prototype.getState = function() {
      return this.state.toJSON();
    };
    return MusicManager;
  })();
  chromus.registerPlugin("music_manager", new MusicManager());
}).call(this);
