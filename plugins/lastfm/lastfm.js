(function() {
  var LastFM, hashToQueryString;
  var __hasProp = Object.prototype.hasOwnProperty;
  hashToQueryString = function(hash) {
    var key, params, value;
    params = [];
    for (key in hash) {
      if (!__hasProp.call(hash, key)) continue;
      value = hash[key];
      params.push("" + key + "=" + value);
    }
    return params.join('&');
  };
  LastFM = {
    settings: {
      baseURL: "http://ws.audioscrobbler.com/2.0/",
      format: "json",
      api_key: pokki.getScrambled('lastfm_api_key'),
      api_secret: pokki.getScrambled('lastfm_api_secret')
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
    getSession: function() {
      if (browser.isPokki) {
        return pokki.descramble(store.get('lastfm:key'));
      } else {
        return store.get('lastfm:key');
      }
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
        if (!method.match(/^auth/)) {
          data.sk = LastFM.getSession();
        }
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
        data.sk = LastFM.getSession();
        data.api_key = LastFM.settings.api_key;
        signature = LastFM.getSignature(data);
        data.api_sig = signature;
        return LastFM.fakePostRequest("" + LastFM.settings.baseURL, data);
      },
      updateNowPlaying: function(data, callback) {
        var signature;
        data.method = 'track.updateNowPlaying';
        data.sk = LastFM.getSession();
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
              duration: parseInt(track.duration),
              images: track.image
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
              duration: parseInt(track.duration),
              images: track.images
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
    },
    radio: {
      getPlaylist: function(callback) {
        return LastFM.callMethod("radio.getPlaylist", {
          sig_call: true
        }, function(resp) {
          var tracks;
          tracks = resp.playlist.trackList.track;
          tracks = _.map(tracks, function(track) {
            return {
              artist: track.creator,
              song: track.title,
              file_url: track.location,
              images: [track.image],
              duration: track.duration / 1000,
              radio: true,
              source_title: resp.playlist.title,
              source_icon: "http://cdn.last.fm/flatness/favicon.2.ico"
            };
          });
          return callback(tracks);
        });
      },
      tune: function(station, callback) {
        var data, signature;
        if (station.match(/loved$/)) {
          LastFM._station = 'loved';
          return callback();
        }
        data = {
          station: station
        };
        data.method = 'radio.tune';
        data.sk = LastFM.getSession();
        data.api_key = LastFM.settings.api_key;
        signature = LastFM.getSignature(data);
        data.api_sig = signature;
        data.format = "json";
        data._url = "" + LastFM.settings.baseURL;
        data._method = "POST";
        return $.ajax({
          url: "http://chromusapp.appspot.com/proxy?_callback=?",
          data: data,
          dataType: "jsonp",
          cache: true,
          success: function(resp) {
            resp = JSON.parse(resp.response);
            if (!resp.error) {
              return callback();
            } else {
              return browser.postMessage({
                method: "lastfm:error",
                error: resp.error.code
              });
            }
          }
        });
      }
    }
  };
  this.chromus.registerPlugin("lastfm", LastFM);
}).call(this);
