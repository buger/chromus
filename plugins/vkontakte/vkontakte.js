(function() {
  var VK;
  VK = {
    settings: {
      baseURL: "http://api.vk.com/api.php",
      signURL: "http://chromusapp.appspot.com/sign_data"
    },
    search: function(args, callback) {
      var callback_name, query;
      if (callback == null) {
        callback = function() {};
      }
      query = "" + args.artist + " " + args.song;
      callback_name = args.callback || ("vkclb" + (chromus.utils.uid()));
      return $.ajax({
        url: "" + VK.settings.signURL,
        data: {
          track: query
        },
        dataType: "jsonp",
        cache: true,
        jsonpCallback: callback_name,
        success: function(resp) {
          var data;
          console.log("search callback", resp);
          data = {
            'api_id': resp.api_key,
            'method': 'audio.search',
            'format': 'json',
            'sig': resp.signed_data,
            'sort': 2,
            'test_mode': 1,
            'count': 10,
            'q': query
          };
          return $.ajax({
            url: "" + VK.settings.baseURL,
            data: data,
            dataType: "jsonp",
            cache: true,
            jsonpCallback: callback_name,
            success: function(result) {
              var records;
              if (!result.response) {
                return callback([]);
              }
              records = _.map(_.rest(result.response), function(i) {
                return {
                  artist: i.audio.artist,
                  song: i.audio.title,
                  duration: parseInt(i.audio.duration),
                  file_url: i.audio.url,
                  source_title: "Vkontakte",
                  source_icon: "http://vkontakte.ru/favicon.ico"
                };
              });
              return callback(records);
            }
          });
        }
      });
    }
  };
  this.chromus.registerAudioSource("vkontakte", VK);
}).call(this);
