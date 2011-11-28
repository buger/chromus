(function() {
  var music_manager;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  music_manager = chromus.plugins.music_manager;
  browser.addMessageListener(function(msg, sender, sendResponse) {
    var track, _i, _len, _ref, _results;
    if (!msg.method.match('(playerState|updateState)')) {
      console.log(msg.method, msg, sender);
    }
    switch (msg.method) {
      case "pause":
        return music_manager.pause();
      case "play":
        if (_.isArray(msg.track)) {
          music_manager.playlist.reset(msg.track);
          return music_manager.play(music_manager.playlist.first());
        } else {
          return music_manager.play(msg.track);
        }
        break;
      case "addToPlaylist":
        _ref = msg.tracks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          track = _ref[_i];
          _results.push(track.type ? (track = new Backbone.Model(track), chromus.media_types[track.get('type')](track, __bind(function(resp) {
            music_manager.playlist.remove(track);
            return music_manager.playlist.add(resp);
          }, this))) : music_manager.playlist.add(track));
        }
        return _results;
        break;
      case "nextTrack":
        return music_manager.play(music_manager.nextTrack());
      case "previousTrack":
        return music_manager.play(music_manager.prevTrack());
      case "setVolume":
        return music_manager.setVolume(msg.volume);
      case "setPosition":
        return music_manager.setPosition(msg.position);
      case "setSettings":
        return music_manager.settings.set(msg.data);
      case "clearPlaylist":
        return music_manager.playlist.reset();
    }
  });
}).call(this);
