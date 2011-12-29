(function() {
  var VK, global;

  global = this;

  VK = {
    APP_ID: global.debug ? "2649785" : "2698877",
    SCOPE: "audio,offline",
    authURL: function() {
      var baseLocation, link, plugin_path, redirect_uri;
      if (browser.isChrome) {
        baseLocation = "" + chromus.baseURL + "/chromus/index.html";
      } else {
        baseLocation = document.location.toString();
      }
      plugin_path = chromus.plugins_info.vkontakte.path;
      plugin_path = plugin_path.replace("chrome-extension://oeghnnflghjikgempjanmfekicakholb/", "");
      redirect_uri = [baseLocation, "/../", plugin_path, "/oauth.html"].join('');
      return link = ["http://api.vkontakte.ru/oauth/authorize?", "client_id=" + VK.APP_ID, "scope=" + VK.SCOPE, "redirect_uri=" + redirect_uri, "display=popup", "response_type=token"].join('&');
    },
    searchWithoutLogin: function(args, callback) {
      return $.ajax({
        url: "" + chromus.baseURL + "/api/token/get",
        data: data,
        dataType: "jsonp",
        success: function(resp) {
          if (!resp.error) {
            args.access_token = resp.token;
            return VK.searchAPI(args, callback);
          }
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
      if (!args.access_token) {
        if (browser.isPokki) {
          data.access_token = pokki.descrumble(store.get('vk:token'));
        } else {
          data.access_token = store.get('vk:token');
        }
      } else {
        data.access_token = args.access_token;
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

  browser.addMessageListener(function(msg, sender, sendResponse) {
    switch (msg.method) {
      case "vk:auth":
        store.set("vk:token", msg.auth.access_token);
        store.set("vk:user_id", msg.auth.user_id);
        $.ajax({
          url: "" + chromus.baseURL + "/api/token/add",
          data: {
            token: msg.auth.access_token
          },
          dataType: "jsonp",
          success: function(resp) {
            return console.log('token added');
          }
        });
        return console.warn("logged!");
    }
  });

}).call(this);
