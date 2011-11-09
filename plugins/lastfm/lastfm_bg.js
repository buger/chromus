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
        console.warn("scrobbling", track.id, last_scrobbled);
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
    var _ref;
    if (!manager.nextTrack() && ((_ref = manager.currentTrack()) != null ? _ref.get('radio') : void 0)) {
      return lastfm.radio.getPlaylist(function(tracks) {
        return manager.playlist.add(tracks);
      });
    }
  });
  chromus.registerMediaType("artist", function(track, callback) {
    return lastfm.artist.getTopTracks(track.artist, callback);
  });
  chromus.registerMediaType("album", function(track, callback) {
    return lastfm.album.getInfo(track.artist, track.album, callback);
  });
  chromus.registerMediaType("lastfm:radio", function(track, callback) {
    return lastfm.radio.tune(track.station, function() {
      return lastfm.radio.getPlaylist(callback);
    });
  });
}).call(this);
