(function() {
  /*
      Track scrobbling 
  */
  var last_scrobbled, lastfm, manager;
  lastfm = chromus.plugins.lastfm;
  manager = chromus.plugins.music_manager;
  last_scrobbled = void 0;
  chromus.plugins.music_manager.state.bind('change', function(state) {
    var percent_played, track;
    if (!(store.get('lastfm:scrobbling') && store.get('lastfm:key'))) {
      return;
    }
    track = manager.currentTrack();
    if (state.get('name') === "playing" && track.id !== last_scrobbled) {
      percent_played = (state.get('played') / track.get('duration')) * 100;
      if (percent_played > 30 && track.get('duration') > 30) {
        last_scrobbled = track.id;
        lastfm.track.scrobble({
          artist: track.get('artist'),
          track: track.get('song'),
          duration: track.get('duration'),
          radio: true
        });
      }
    } else if (state.get('name') === 'stopped') {
      last_scrobbled = void 0;
    }
    if (state.get('name') === "playing" && state.previous("name") !== state.get('name')) {
      return lastfm.track.updateNowPlaying({
        artist: track.get('artist'),
        track: track.get('song'),
        duration: track.get('duration')
      });
    }
  });
  chromus.plugins.music_manager.bind('change:current_track', function() {
    var index, previous_tracks, track, _i, _len, _ref;
    if ((_ref = manager.currentTrack()) != null ? _ref.get('radio') : void 0) {
      index = manager.playlist.indexOf(manager.currentTrack());
      previous_tracks = _.first(manager.playlist.models, index);
      for (_i = 0, _len = previous_tracks.length; _i < _len; _i++) {
        track = previous_tracks[_i];
        if (track.get('radio')) {
          track.unset('file_url');
          track.unset('radio');
          track.unset('source_title');
          track.unset('source_icon');
        }
      }
      if (!manager.nextTrack()) {
        return lastfm.radio.getPlaylist(function(tracks) {
          return manager.playlist.add(tracks);
        });
      }
    }
  });
  chromus.registerMediaType("artist", function(track, callback) {
    return lastfm.artist.getTopTracks(track.artist, callback);
  });
  chromus.registerMediaType("album", function(track, callback) {
    return lastfm.album.getInfo(track.artist, track.album, callback);
  });
  chromus.registerMediaType("lastfm:radio", function(track, callback) {
    manager.settings.set({
      'repeat': false,
      'shuffle': false
    });
    return lastfm.radio.tune(track.station, function() {
      return lastfm.radio.getPlaylist(callback);
    });
  });
}).call(this);
