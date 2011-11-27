(function() {
  var event, music_manager, _i, _len, _ref;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
  _ref = ['reset', 'add', 'create', 'change:song'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    event = _ref[_i];
    music_manager.playlist.bind(event, function() {
      return browser.postMessage({
        method: "loadPlaylist",
        playlist: music_manager.playlist.toJSON(),
        current_track: music_manager.get('current_track'),
        state: music_manager.getState()
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
    var track, _j, _len2, _ref2, _results;
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
        _ref2 = msg.tracks;
        _results = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          track = _ref2[_j];
          _results.push(track.type ? chromus.media_types[track.type](track, __bind(function(resp) {
            music_manager.playlist.remove(track);
            return music_manager.playlist.add(resp);
          }, this)) : music_manager.playlist.add(track));
        }
        return _results;
        break;
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
      case "ui:init":
        return browser.postMessage({
          method: "loadPlaylist",
          playlist: music_manager.playlist.toJSON(),
          current_track: music_manager.get('current_track'),
          state: music_manager.getState(),
          volume: music_manager.getVolume(),
          settings: music_manager.settings.toJSON()
        });
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
