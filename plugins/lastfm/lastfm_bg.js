(function() {
  /*
      Track scrobbling 
  */
  var addNextTracks, last_scrobbled, lastfm, manager;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
          duration: track.get('duration')
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
  addNextTracks = function() {
    var loader, loaders, _i, _len;
    loaders = manager.playlist.filter(function(i) {
      return i.get('type') === 'lastfm:radio_loader';
    });
    for (_i = 0, _len = loaders.length; _i < _len; _i++) {
      loader = loaders[_i];
      loader.set({
        'song': "Loading..."
      });
    }
    return lastfm.radio.getPlaylist(function(tracks) {
      manager.playlist.remove(loaders);
      return manager.playlist.add(tracks);
    });
  };
  chromus.plugins.music_manager.bind('change:current_track', function() {
    var index, previous_tracks, track, _i, _len, _ref, _ref2;
    if ((_ref = manager.currentTrack()) != null ? _ref.get('lastfm_radio') : void 0) {
      index = manager.playlist.indexOf(manager.currentTrack());
      previous_tracks = _.first(manager.playlist.models, index);
      for (_i = 0, _len = previous_tracks.length; _i < _len; _i++) {
        track = previous_tracks[_i];
        if (track.get('radio')) {
          track.unset('file_url');
          track.unset('radio');
          track.unset('source_title');
          track.unset('source_icon');
          track.unset('type');
        }
      }
      if (((_ref2 = manager.nextTrack()) != null ? _ref2.get('type') : void 0) === "lastfm:radio_loader") {
        return addNextTracks();
      }
    }
  });
  chromus.registerMediaType("lastfm:radio_loader", function(track) {
    return addNextTracks();
  });
  chromus.registerMediaType("artist", function(track, callback) {
    return lastfm.artist.getTopTracks(track.get('artist'), callback);
  });
  chromus.registerMediaType("album", function(track, callback) {
    return lastfm.album.getInfo(track.get('artist'), track.get('album'), callback);
  });
  chromus.registerMediaType("lastfm:radio", function(track, callback) {
    manager.settings.set({
      'repeat': false,
      'shuffle': false
    });
    return lastfm.radio.tune(track.get('station'), function() {
      return lastfm.radio.getPlaylist(callback);
    });
  });
  chromus.registerMediaType("lastfm:stream_track", __bind(function(track, callback) {
    return $.ajax({
      url: "http://chromusapp.appspot.com/proxy?_callback=?",
      dataType: "jsonp",
      data: {
        '_url': track.get('file_url')
      },
      cache: true,
      success: function(resp) {
        return callback({
          file_url: resp.headers.location
        }, false);
      }
    });
  }, this));
}).call(this);
