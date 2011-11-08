(function() {
  var LastFM;
  var __hasProp = Object.prototype.hasOwnProperty;
  LastFM = {
    settings: {
      baseURL: "http://ws.audioscrobbler.com/2.0/",
      format: "json",
      api_key: "48e602d0f8c4d34f00b1b17d96ab88c1",
      api_secret: "c129f28ec70abc4311b21fa8473d34e7"
    },
    getSignature: function(data) {
      var key, signature, value;
      signature = [];
      for (key in data) {
        if (!__hasProp.call(data, key)) continue;
        value = data[key];
        if (key !== 'format') {
          signature.push(key + value);
        }
      }
      signature.sort();
      return MD5(signature.join('') + LastFM.settings.api_secret);
    },
    callMethod: function(method, data, callback) {
      if (data == null) {
        data = {};
      }
      data.format = this.settings.format;
      data.api_key = this.settings.api_key;
      data.method = method;
      if (data.sig_call) {
        delete data.sig_call;
        data.api_sig = this.getSignature(data);
      }
      return $.ajax({
        url: "" + this.settings.baseURL,
        data: data,
        cache: true,
        dataType: this.settings.format,
        success: function(resp) {
          console.log("Lastfm response:", resp);
          return callback(resp);
        }
      });
    },
    convertDateToUTC: function(date) {
      if (date == null) {
        date = new Date();
      }
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    },
    fakePostRequest: function(url, data) {
      var form, iframe, input, key, value;
      iframe = document.createElement('iframe');
      iframe.name = iframe.id = +new Date();
      document.body.appendChild(iframe);
      form = document.createElement('form');
      form.action = url;
      form.method = "post";
      form.target = iframe.id;
      for (key in data) {
        if (!__hasProp.call(data, key)) continue;
        value = data[key];
        input = document.createElement('input');
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      return setTimeout(function() {
        document.body.removeChild(iframe);
        return document.body.removeChild(form);
      }, 2000);
    },
    track: {
      scrobble: function(data, callback) {
        var signature;
        data.method = 'track.scrobble';
        data.timestamp = (+LastFM.convertDateToUTC()) / 1000;
        data.sk = store.get('lastfm:key');
        data.api_key = LastFM.settings.api_key;
        signature = LastFM.getSignature(data);
        data.api_sig = signature;
        return LastFM.fakePostRequest("" + LastFM.settings.baseURL, data);
      },
      updateNowPlaying: function(data, callback) {
        var signature;
        data.method = 'track.updateNowPlaying';
        data.sk = store.get('lastfm:key');
        data.api_key = LastFM.settings.api_key;
        signature = LastFM.getSignature(data);
        data.api_sig = signature;
        return LastFM.fakePostRequest("" + LastFM.settings.baseURL, data);
      },
      search: function(string, callback) {
        return LastFM.callMethod("track.search", {
          track: string
        }, function(resp) {
          var _ref;
          return callback((_ref = resp.results.trackmatches) != null ? _ref.track : void 0);
        });
      }
    },
    artist: {
      search: function(string, callback) {
        return LastFM.callMethod("artist.search", {
          artist: string
        }, function(resp) {
          var _ref;
          return callback((_ref = resp.results.artistmatches) != null ? _ref.artist : void 0);
        });
      },
      getTopTracks: function(artist, callback) {
        return LastFM.callMethod("artist.getTopTracks", {
          "artist": artist
        }, function(resp) {
          var tracks;
          tracks = resp.toptracks.track;
          tracks = _.map(tracks, function(track) {
            return {
              artist: track.artist.name,
              song: track.name,
              duration: parseInt(track.duration)
            };
          });
          return callback(tracks);
        });
      }
    },
    album: {
      search: function(album, callback) {
        return LastFM.callMethod("album.search", {
          "album": album
        }, function(resp) {
          var _ref;
          return callback((_ref = resp.results.albummatches) != null ? _ref.album : void 0);
        });
      },
      getInfo: function(artist, album, callback) {
        return LastFM.callMethod("album.getInfo", {
          "album": album,
          "artist": artist
        }, function(resp) {
          var tracks;
          tracks = resp.album.tracks.track;
          tracks = _.map(tracks, function(track) {
            return {
              artist: track.artist.name,
              song: track.name,
              duration: parseInt(track.duration)
            };
          });
          return callback(tracks);
        });
      }
    },
    image: function(options) {
      var method_prefix, params, _ref;
      if (!options.artist) {
        return;
      }
      if ((_ref = options.size) == null) {
        options.size = "mediumsquare";
      }
      params = [];
      if (options.album) {
        method_prefix = "album";
        params.push("album=" + encodeURIComponent(options.album));
      } else {
        method_prefix = "artist";
        params.push("artist=" + encodeURIComponent(options.artist));
      }
      return "" + LastFM.settings.baseURL + "?api_key=" + LastFM.settings.api_key + "&method=" + method_prefix + ".getImageRedirect&size=" + options.size + "&" + (params.join('&'));
    }
  };
  this.chromus.registerPlugin("lastfm", LastFM);
  if (browser.page_type === "background") {
    this.chromus.registerMediaType("artist", function(track, callback) {
      return LastFM.artist.getTopTracks(track.artist, callback);
    });
    this.chromus.registerMediaType("album", function(track, callback) {
      return LastFM.album.getInfo(track.artist, track.album, callback);
    });
  }
}).call(this);
