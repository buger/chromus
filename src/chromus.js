(function() {
  var Chromus, global;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  global = this;
  Chromus = (function() {
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
          return "" + match[1] + meta.path + "/" + match[2] + "?" + (+new Date());
        }));
      }
      return yepnope({
        load: _.flatten(files),
        complete: this.pluginsLoadedCallback
      });
    };
    Chromus.prototype.loadPlugins = function() {
      var callback, plugin, _i, _len, _ref, _results;
      callback = _.after(this.plugins_list.length, this.injectPluginFiles);
      _ref = this.plugins_list;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plugin = _ref[_i];
        _results.push(__bind(function(plugin) {
          var package_path, plugin_path;
          plugin_path = browser.extension.getURL("/plugins/" + plugin);
          package_path = "" + plugin_path + "/package.json";
          return $.getJSON(package_path, __bind(function(package) {
            this.plugins_info[plugin] = package;
            this.plugins_info[plugin].path = plugin_path;
            return callback();
          }, this));
        }, this)(plugin));
      }
      return _results;
    };
    Chromus.prototype.pluginsLoadedCallback = function() {
      if (global.isTestMode()) {
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
    return Chromus;
  })();
  this.chromus = new Chromus();
  this.chromus.utils = {
    uid: function() {
      var _ref;
      if ((_ref = this.uid_start) == null) {
        this.uid_start = +new Date();
      }
      return this.uid_start++;
    }
  };
}).call(this);
