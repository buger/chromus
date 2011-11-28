(function() {
  var event, music_manager, _i, _len, _ref;
  music_manager = chromus.plugins.music_manager;
  music_manager.state.bind('change', function(state) {
    var time_left, track;
    track = music_manager.currentTrack();
    if (track) {
      browser.toolbarItem.setTitle(track.title());
    }
    time_left = state.get('duration') - state.get('played');
    if (state.get('name') === "stopped" || time_left <= 0) {
      browser.toolbarItem.setText("");
    } else {
      browser.toolbarItem.setText(prettyTime(time_left));
    }
    return browser.broadcastMessage({
      method: "updateState",
      state: state,
      track: track
    });
  });
  _ref = ['reset', 'add', 'create', 'change:song'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    event = _ref[_i];
    music_manager.playlist.bind(event, function() {
      return browser.postMessage({
        method: "loadPlaylist",
        playlist: music_manager.playlist.toJSON(),
        current_track: music_manager.get('current_track'),
        state: music_manager.state.toJSON()
      });
    });
  }
  music_manager.settings.bind('change', function(settings) {
    return browser.postMessage({
      method: "updateSettings",
      settings: settings.toJSON()
    });
  });
  browser.addMessageListener(function(msg, sender, sendResponse) {
    switch (msg.method) {
      case "ui:init":
        return browser.postMessage({
          method: "loadPlaylist",
          playlist: music_manager.playlist.toJSON(),
          current_track: music_manager.get('current_track'),
          state: music_manager.state.toJSON(),
          volume: music_manager.getVolume(),
          settings: music_manager.settings.toJSON()
        });
    }
  });
}).call(this);
