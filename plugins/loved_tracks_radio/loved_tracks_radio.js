(function() {
  var LastfmLovedRadio, manager, radio;
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
      console.warn("LOVED", this.page, this.pages);
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
            source_icon: browser.extension.getURL('/assets/icons/19x19-2.png'),
            loved_radio: true
          };
        });
        return callback(tracks);
      }, this));
    };
    return LastfmLovedRadio;
  })();
  radio = new LastfmLovedRadio();
  manager = chromus.plugins.music_manager;
  manager.bind('change:current_track', function() {
    var _ref;
    if (!manager.nextTrack() && ((_ref = manager.currentTrack()) != null ? _ref.get('loved_radio') : void 0)) {
      return radio.getNext(function(tracks) {
        return manager.playlist.add(tracks);
      });
    }
  });
  chromus.registerMediaType("lastfm:loved", function(track, callback) {
    radio.reset();
    return radio.getNext(callback);
  });
}).call(this);
