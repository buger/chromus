(function() {
  var LastfmLovedRadio, addNextTracks, manager, radio;

  LastfmLovedRadio = (function() {

    function LastfmLovedRadio() {}

    LastfmLovedRadio.prototype.initialize = function() {
      return this.reset();
    };

    LastfmLovedRadio.prototype.reset = function() {
      this.pages = [];
      this.page = 1;
      return this.played_tracks = [];
    };

    LastfmLovedRadio.prototype.getNext = function(callback) {
      var _this = this;
      if (this.pages.length) {
        this.pages = _.shuffle(this.pages);
        this.page = this.pages[0];
      }
      return chromus.plugins.lastfm.callMethod("user.getlovedtracks", {
        user: store.get('lastfm:user'),
        page: this.page
      }, function(response) {
        var tracks;
        if (!_this.pages.length) {
          _this.pages = response.lovedtracks["@attr"].totalPages;
          _this.pages = _.range(1, _this.pages);
          if (response.lovedtracks.track.length) {
            return _this.getNext(callback);
          } else {
            return callback([]);
          }
        }
        tracks = _.difference(response.lovedtracks.track, _this.played_tracks);
        tracks = _.shuffle(tracks);
        if (!tracks.length) {
          _this.pages = _.without(_this.pages, _this.page);
          return _this.getNext(callback);
        }
        tracks = _.first(tracks, 3);
        _this.played_tracks = _.union(_this.played_tracks, tracks);
        tracks = _.map(tracks, function(track) {
          return {
            song: track.name,
            artist: track.artist.name,
            source_title: "Last.fm Loved Tracks Radio (Free)",
            source_icon: browser.extension.getURL('/assets/icons/19x19.png'),
            loved_radio: true
          };
        });
        tracks.push({
          song: "Load next tracks",
          artist: "",
          type: "lastfm:loved_loader",
          action: true
        });
        return callback(tracks);
      });
    };

    return LastfmLovedRadio;

  })();

  radio = new LastfmLovedRadio();

  manager = chromus.plugins.music_manager;

  addNextTracks = function() {
    var loader, loaders, _i, _len;
    loaders = manager.playlist.filter(function(i) {
      return i.get('type') === 'lastfm:loved_loader';
    });
    for (_i = 0, _len = loaders.length; _i < _len; _i++) {
      loader = loaders[_i];
      loader.set({
        'song': 'Loading...'
      });
    }
    return radio.getNext(function(tracks) {
      manager.playlist.remove(loaders);
      return manager.playlist.add(tracks);
    });
  };

  manager.bind('change:current_track', function() {
    var track, _ref;
    track = manager.currentTrack();
    if ((track != null ? track.get('loved_radio') : void 0) && ((_ref = manager.nextTrack()) != null ? _ref.get('type') : void 0) === "lastfm:loved_loader") {
      return addNextTracks();
    }
  });

  chromus.registerMediaType("lastfm:loved_loader", function(track) {
    return addNextTracks();
  });

  chromus.registerMediaType("lastfm:loved", function(track, callback) {
    radio.reset();
    manager.settings.set({
      'repeat': false,
      'shuffle': false
    });
    return radio.getNext(callback);
  });

}).call(this);
