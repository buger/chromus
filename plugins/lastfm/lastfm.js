(function() {
  var LastFM;
  LastFM = {
    settings: {
      baseURL: "http://ws.audioscrobbler.com/2.0/",
      format: "json",
      api_key: "170909e77e67705570080196aca5040b"
    },
    callMethod: function(method, data, callback) {
      if (data == null) {
        data = {};
      }
      data.format = this.settings.format;
      data.api_key = this.settings.api_key;
      data.method = method;
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
    track: {
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
      getTopTracks: function(string, callback) {
        return LastFM.callMethod("artist.getTopTracks", {
          artist: string
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
      search: function(string, callback) {
        return LastFM.callMethod("album.search", {
          album: string
        }, function(resp) {
          var _ref;
          return callback((_ref = resp.results.albummatches) != null ? _ref.album : void 0);
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
}).call(this);
