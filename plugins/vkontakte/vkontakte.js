(function() {
  var VK, global;

  global = this;

  VK = {
    APP_ID: global.debug ? "2649785" : "2698877",
    SCOPE: "audio,offline",
    authURL: function() {
      var link, redirect_uri;
      redirect_uri = [document.location.toString(), "/../", chromus.plugins_info.vkontakte.path, "/oauth.html"].join('');
      return link = ["http://api.vkontakte.ru/oauth/authorize?", "client_id=" + VK.APP_ID, "scope=" + VK.SCOPE, "redirect_uri=" + redirect_uri, "display=popup", "response_type=token"].join('&');
    },
    searchWithoutLogin: function(args, callback) {
      var BaseURL, SignURL, callback_name, query;
      var _this = this;
      BaseURL = "http://api.vk.com/api.php";
      SignURL = "http://chromusapp.appspot.com/sign_data";
      query = "" + args.artist + " " + args.song;
      callback_name = "vkclb" + (chromus.utils.uid());
      return $.ajax({
        url: "" + SignURL,
        data: {
          track: query
        },
        dataType: "jsonp",
        cache: true,
        jsonpCallback: callback_name,
        success: function(resp) {
          var data;
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
            url: "" + BaseURL,
            data: data,
            dataType: "jsonp",
            cache: true,
            jsonpCallback: callback_name,
            success: function(result) {
              var records;
              if (!result.response) return callback([]);
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
    },
    searchAPI: function(args, callback) {
      var data, query;
      console.warn('searching as logged user');
      query = "" + args.artist + " " + args.song;
      data = {
        q: query,
        format: 'json',
        sort: 2,
        count: 10
      };
      if (browser.isPokki) {
        data.access_token = pokki.descrumble(store.get('vk:token'));
      } else {
        data.access_token = store.get('vk:token');
      }
      return $.ajax({
        url: "https://api.vkontakte.ru/method/audio.search",
        data: data,
        dataType: "jsonp",
        cache: true,
        success: function(result) {
          var records;
          if (!result.response) return callback([]);
          records = _.map(_.rest(result.response), function(i) {
            return {
              artist: i.artist,
              song: i.title,
              duration: parseInt(i.duration),
              file_url: i.url,
              source_title: "Vkontakte",
              source_icon: "http://vkontakte.ru/favicon.ico"
            };
          });
          return callback(records);
        }
      });
    },
    search: function(args, callback) {
      if (store.get('vk:user_id')) {
        return VK.searchAPI(args, callback);
      } else {
        return VK.searchWithoutLogin(args, callback);
      }
    }
  };

  this.chromus.registerPlugin("vkontakte", VK);

  this.chromus.registerAudioSource("vkontakte", VK);

}).call(this);
