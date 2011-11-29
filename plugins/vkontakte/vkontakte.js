(function() {
  var VK, global;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  global = this;
  VK = {
    APP_ID: global.debug ? "2649785" : "2698877",
    BaseURL: "http://api.vk.com/api.php",
    SignURL: "http://chromusapp.appspot.com/sign_data",
    SCOPE: "audio,offline",
    authURL: function() {
      var link, redirect_uri;
      redirect_uri = [document.location.toString(), "/../", chromus.plugins_info.vkontakte.path, "/oauth.html"].join('');
      return link = ["http://api.vkontakte.ru/oauth/authorize?", "client_id=" + VK.APP_ID, "scope=" + VK.SCOPE, "redirect_uri=" + redirect_uri, "display=popup", "response_type=token"].join('&');
    },
    searchWithoutLogin: function(args, callback) {
      var callback_name, query;
      query = "" + args.artist + " " + args.song;
      callback_name = "vkclb" + (chromus.utils.uid());
      return $.ajax({
        url: "" + VK.SignURL,
        data: {
          track: query
        },
        dataType: "jsonp",
        cache: true,
        jsonpCallback: callback_name,
        success: __bind(function(resp) {
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
          return this.searchAPI(data, callback_name, callback);
        }, this)
      });
    },
    searchAPI: function(data, jsonpCallback, callback) {
      return $.ajax({
        url: "" + VK.BaseURL,
        data: data,
        dataType: "jsonp",
        cache: true,
        jsonpCallback: jsonpCallback,
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
    },
    search: function(args, callback) {
      return VK.searchWithoutLogin(args, callback);
    }
  };
  this.chromus.registerPlugin("vkontakte", VK);
  this.chromus.registerAudioSource("vkontakte", VK);
}).call(this);
