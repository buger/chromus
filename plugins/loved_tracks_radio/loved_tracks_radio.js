(function() {
  var LastfmLovedRadio, addNextTracks, manager, radio;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
      if (this.pages.length) {
        this.pages = _.shuffle(this.pages);
        this.page = this.pages[0];
      }
      return chromus.plugins.lastfm.callMethod("user.getlovedtracks", {
        user: store.get('lastfm:user'),
        page: this.page
      }, __bind(function(response) {
        var tracks;
        tracks = _.difference(response.lovedtracks.track, this.played_tracks);
        tracks = _.shuffle(tracks);
        if (!tracks.length) {
          this.pages = _.without(this.pages, this.page);
          return this.getNext(callback);
        }
        if (!this.pages.length) {
          this.pages = response.lovedtracks["@attr"].totalPages;
          this.pages = _.range(1, this.pages);
        }
        tracks = _.first(tracks, 3);
        this.played_tracks = _.union(this.played_tracks, tracks);
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
      }, this));
    };
    return LastfmLovedRadio;
  })();
  radio = new LastfmLovedRadio();
  manager = chromus.plugins.music_manager;
  addNextTracks = function() {
    return radio.getNext(function(tracks) {
      var loaders;
      loaders = manager.playlist.filter(function(i) {
        return i.get('type') === 'lastfm:loved_loader';
      });
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
    track.set({
      'song': "Loading..."
    });
    console.warn("ZZZZZ");
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
