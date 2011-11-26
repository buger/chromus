(function() {
  var BandCamp;
  BandCamp = {
    bandURL: "http://api.bandcamp.com/api/band/3",
    albumURL: "http://api.bandcamp.com/api/album/2",
    trackURL: "http://api.bandcamp.com/api/track/1",
    api_key: "hneyxlanligrullhottrdorga",
    constructor: function() {
      return _.bindAll(this);
    },
    callMethod: function(args) {
      return $.ajax({
        url: args.url,
        data: _.defaults({
          key: BandCamp.api_key
        }, args.data),
        dataType: "jsonp",
        cache: true,
        success: function(resp) {
          return args.success(resp);
        }
      });
    },
    band: {
      search: function(artist, callback) {
        return BandCamp.callMethod({
          url: "" + BandCamp.bandURL + "/search",
          data: {
            name: artist
          },
          success: function(resp) {
            return callback(resp.results);
          }
        });
      },
      discography: function(band_ids, callback) {
        return BandCamp.callMethod({
          url: ("" + BandCamp.bandURL + "/discography?band_id=") + band_ids.join(','),
          success: function(resp) {
            return callback(resp);
          }
        });
      }
    },
    album: {
      info: function(album_id, callback) {
        return BandCamp.callMethod({
          url: "" + BandCamp.albumURL + "/info",
          data: {
            album_id: album_id
          },
          success: callback
        });
      }
    },
    search: function(args, callback) {
      var process_tracks, tracks;
      tracks = [];
      process_tracks = function() {
        tracks = _.flatten(tracks);
        tracks = _.map(tracks, function(t) {
          var resp;
          return resp = {
            file_url: t.streaming_url,
            artist: t.artist,
            song: t.title,
            source_title: 'Bandcamp'
          };
        });
        tracks = _.reject(tracks, function(t) {
          return t.file_url === void 0 || !t.song.toLowerCase().match(args.song.toLowerCase());
        });
        return callback(tracks);
      };
      return BandCamp.band.search(args.artist, function(resp) {
        var band_ids;
        if (resp.length) {
          band_ids = _.pluck(resp, "band_id");
          return BandCamp.band.discography(band_ids, function(resp) {
            var discogs, obj, _i, _len, _results;
            discogs = resp.discography;
            if (!discogs) {
              discogs = _.map(resp, function(value, key) {
                return value.discography;
              });
              discogs = _.flatten(discogs);
            }
            process_tracks = _.after(discogs.length, process_tracks);
            _results = [];
            for (_i = 0, _len = discogs.length; _i < _len; _i++) {
              obj = discogs[_i];
              _results.push(obj.track_id ? (tracks.push(obj), process_tracks()) : BandCamp.album.info(obj.album_id, function(album) {
                album.tracks = _.map(album.tracks, function(t) {
                  t.artist = obj.artist;
                  return t;
                });
                tracks.push(album.tracks);
                return process_tracks();
              }));
            }
            return _results;
          });
        }
      });
    }
  };
  this.chromus.registerPlugin("bandcamp", BandCamp);
  this.chromus.registerAudioSource("bandcamp", BandCamp);
}).call(this);
