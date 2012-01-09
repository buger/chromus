(function() {
  var Menu, SettingsView, lastfm, menu;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  lastfm = chromus.plugins.lastfm;

  SettingsView = (function() {

    __extends(SettingsView, Backbone.View);

    function SettingsView() {
      SettingsView.__super__.constructor.apply(this, arguments);
    }

    SettingsView.prototype.className = "lastfm";

    SettingsView.prototype.events = {
      "submit form.login": "login",
      "click .logout": "logout",
      "click .toggler": "toggleScrobbling",
      "click .lastfm_radio": "playRadio",
      "click .loved_radio": "playLovedRadio"
    };

    SettingsView.prototype.initialize = function() {
      chromus.openPanel(this.el);
      return this.render();
    };

    SettingsView.prototype.render = function() {
      var view;
      view = {
        logged: !!lastfm.getSession(),
        scrobbling: !!store.get('lastfm:scrobbling'),
        user: store.get('lastfm:user'),
        subscriber: !!parseInt(store.get('lastfm:subscriber'))
      };
      this.el.innerHTML = Handlebars.templates['lastfm.ui.tmpl'](view);
      return this.delegateEvents();
    };

    SettingsView.prototype.logout = function() {
      store.remove('lastfm:user');
      store.remove('lastfm:key');
      return this.render();
    };

    SettingsView.prototype.toggleScrobbling = function() {
      store.set('lastfm:scrobbling', !store.get('lastfm:scrobbling'));
      return this.$('.toggler').toggleClass('off', !store.get('lastfm:scrobbling'));
    };

    SettingsView.prototype.playRadio = function(evt) {
      var track;
      track = {
        type: "lastfm:radio",
        artist: "LastFM radio",
        song: "Loading...",
        station: $(evt.target).attr('data-radio')
      };
      browser.postMessage({
        method: "play",
        track: track,
        playlist: [track]
      });
      return chromus.closePanel();
    };

    SettingsView.prototype.playLovedRadio = function(evt) {
      var track;
      track = {
        type: "lastfm:loved",
        artist: "LastFM Loved radio (free)",
        song: "Loading..."
      };
      browser.postMessage({
        method: "play",
        track: track,
        playlist: [track]
      });
      return chromus.closePanel();
    };

    SettingsView.prototype.login = function(evt) {
      var auth_token, form, password, username, _ref;
      var _this = this;
      form = evt.target;
      _ref = [form.username.value, form.password.value], username = _ref[0], password = _ref[1];
      this.$('.login *').css({
        'visibility': 'hidden'
      });
      this.spinner = new Spinner().spin(this.el);
      auth_token = MD5(username + MD5(password));
      lastfm.callMethod('auth.getMobileSession', {
        sig_call: true,
        username: username,
        authToken: auth_token
      }, function(resp) {
        _this.$('.login *').css({
          'visibility': 'visible'
        });
        if (resp.error) {
          _this.$('.error').show();
          return _this.spinner.stop();
        } else if (resp.session) {
          store.set('lastfm:user', resp.session.name);
          store.set('lastfm:subscriber', parseInt(resp.session.subscriber));
          if (browser.isPokki) {
            store.set('lastfm:key', pokki.scramble(resp.session.key));
          } else {
            store.set('lastfm:key', resp.session.key);
          }
          store.set('lastfm:scrobbling', true);
          return _this.render();
        }
      });
      return evt.stopPropagation();
    };

    return SettingsView;

  })();

  Menu = (function() {

    __extends(Menu, Backbone.View);

    function Menu() {
      Menu.__super__.constructor.apply(this, arguments);
    }

    Menu.prototype.tagName = 'li';

    Menu.prototype.className = 'lastfm';

    Menu.prototype.events = {
      "click": "openPanel"
    };

    Menu.prototype.initialize = function() {
      this.container = $('#main_menu');
      return this.render();
    };

    Menu.prototype.render = function() {
      this.el.innerHTML = "Last.FM";
      return this.delegateEvents();
    };

    Menu.prototype.openPanel = function() {
      new SettingsView();
      return $('#main_menu').hide();
    };

    return Menu;

  })();

  menu = new Menu();

  chromus.addMenu(menu.el);

  browser.addMessageListener(function(msg) {
    switch (msg.method) {
      case "lastfm:error":
        return error_window.render();
    }
  });

}).call(this);
