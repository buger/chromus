(function() {
  var Chromus, global;

  global = this;

  Chromus = (function() {

    Chromus.prototype.baseURL = "http://chromusapp-v2.appspot.com";

    Chromus.prototype.audio_players = {};

    Chromus.prototype.audio_sources = {};

    Chromus.prototype.media_types = {};

    Chromus.prototype.plugins = {};

    Chromus.prototype.plugins_info = {};

    Chromus.prototype.plugins_list = ['iframe_player', 'music_manager', 'ui', 'echonest', 'lastfm', 'loved_tracks_radio', 'vkontakte', 'about'];

    function Chromus() {
      _.bindAll(this);
      this.loadPlugins();
    }

    Chromus.prototype.injectPluginFiles = function() {
      var files, meta, plugin, _i, _len, _ref;
      files = [];
      _ref = this.plugins_list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plugin = _ref[_i];
        meta = this.plugins_info[plugin];
        files.push(_.map(meta['files'], function(file) {
          var match;
          match = file.match(/(.*!)?(.*)/);
          return "" + (match[1] || '') + meta.path + "/" + match[2] + "?" + (+new Date());
        }));
      }
      return yepnope({
        load: _.flatten(files),
        complete: this.pluginsLoadedCallback
      });
    };

    Chromus.prototype.loadPlugins = function() {
      var callback, plugin, _i, _len, _ref, _results;
      var _this = this;
      callback = _.after(this.plugins_list.length, this.injectPluginFiles);
      _ref = this.plugins_list;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plugin = _ref[_i];
        _results.push((function(plugin) {
          var package_path, plugin_path;
          plugin_path = browser.extension.getURL("/plugins/" + plugin);
          package_path = "" + plugin_path + "/package.json?" + (+new Date());
          if (global.debug || (typeof exports !== "undefined" && exports !== null)) {
            return $.getJSON(package_path, function(package) {
              _this.plugins_info[plugin] = package;
              _this.plugins_info[plugin].path = plugin_path;
              return callback();
            });
          } else {
            _this.plugins_info[plugin] = {};
            return _this.plugins_info[plugin].path = plugin_path;
          }
        })(plugin));
      }
      return _results;
    };

    Chromus.prototype.pluginsLoadedCallback = function() {
      if (typeof global.isTestMode === "function" ? global.isTestMode() : void 0) {
        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        return jasmine.getEnv().execute();
      }
    };

    Chromus.prototype.registerPlugin = function(name, context) {
      return this.plugins[name] = context;
    };

    Chromus.prototype.registerPlayer = function(name, context) {
      return this.audio_players[name] = context;
    };

    Chromus.prototype.registerAudioSource = function(name, context) {
      return this.audio_sources[name] = context;
    };

    Chromus.prototype.registerMediaType = function(name, context) {
      return this.media_types[name] = context;
    };

    Chromus.prototype.addMenu = function(el) {
      return $('#main_menu').append(el);
    };

    Chromus.prototype.openPanel = function(content) {
      var panel;
      panel = $('<div class="panel">').html(content).appendTo($("#wrapper")).delegate('.back', 'click', function() {
        panel.removeClass('show');
        return _.delay(function() {
          return panel.remove();
        }, 300);
      });
      _.defer(function() {
        return panel.addClass('show');
      });
      return panel;
    };

    Chromus.prototype.closePanel = function() {
      var latest_panel;
      latest_panel = _.last($('.panel'));
      return $(latest_panel).find('.back').trigger('click');
    };

    return Chromus;

  })();

  this.chromus = new Chromus();

  this.chromus.utils = {
    uid: function() {
      var _ref;
      if ((_ref = this.uid_start) == null) this.uid_start = +new Date();
      return this.uid_start++;
    }
  };

}).call(this);
