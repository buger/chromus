(function() {
  var music_manager;
  browser.toolbarItem.setBackgroundColor([51, 153, 204, 255]);
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
  music_manager.playlist.bind('all', function() {
    return browser.postMessage({
      method: "loadPlaylist",
      playlist: music_manager.playlist.toJSON(),
      current_track: music_manager.get('current_track'),
      state: music_manager.getState()
    });
  });
  browser.addMessageListener(function(msg, sender, sendResponse) {
    if (!msg.method.match('(playerState|updateState)')) {
      console.log(msg.method, msg, sender);
    }
    switch (msg.method) {
      case "auth_token":
        return scrobbler.getSession(msg.token, function(response) {
          if (response.session) {
            window.localStorage['lastfm_session'] = response.session;
            window.localStorage['lastfm_username'] = response.username;
          }
          return chrome.tabs.update(sender.tab.id, {
            url: chrome.extension.getURL()
          });
        });
      case "pause":
        return music_manager.pause();
      case "play":
        browser.broadcastMessage({
          method: "stop"
        });
        if (msg.playlist) {
          music_manager.playlist.reset(msg.playlist);
          music_manager.playTrack(music_manager.playlist.first());
        } else {
          music_manager.playTrack(msg.track);
        }
        return music_manager.radio = void 0;
      case "addToPlaylist":
        return music_manager.playlist.add(msg.tracks);
      case "togglePlaying":
        if (music_manager.state.get('name') === "paused" && music_manager.currentTrack()) {
          return music_manager.play();
        } else {
          return music_manager.pause();
        }
        break;
      case "nextTrack":
        return music_manager.playTrack(music_manager.nextTrack());
      case "previousTrack":
        return music_manager.playTrack(music_manager.prevTrack());
      case "getPlaylist":
        return browser.postMessage({
          method: "loadPlaylist",
          playlist: music_manager.playlist.toJSON(),
          current_track: music_manager.get('current_track'),
          state: music_manager.getState(),
          volume: music_manager.getVolume()
        });
      case "setVolume":
        return music_manager.setVolume(msg.volume);
      case "setPosition":
        return music_manager.setPosition(msg.position);
      case "clearPlaylist":
        music_manager.radio = void 0;
        return music_manager.playlist.reset();
    }
  });
  if (browser.isChrome) {
    chrome.contextMenus.create({
      "title": "Search in Chromus",
      "onclick": searchMenuClick,
      "contexts": ["selection"]
    });
    chrome.tabs.onSelectionChanged.addListener(function(tab_id, select_info) {
      return console.log("Tab selected", tab_id, select_info);
    });
  }
  if (browser.isPokki) {
    chromus.plugins.music_manager.state.bind('change', function(state) {
      if (state.get('name') === 'playing') {
        return pokki.setIdleDetect('background', false);
      } else {
        return pokki.setIdleDetect('background', true);
      }
    });
  }
}).call(this);
