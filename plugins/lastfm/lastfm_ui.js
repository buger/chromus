(function() {
  var Menu, SettingsView, lastfm, menu, template;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  lastfm = chromus.plugins.lastfm;
  template = Handlebars.compile('    \
    <header>\
        <a class="back"></a>\
        <h3>Last.FM</h3>\
    </header>\
    {{#if logged}}\
        <form class="form">\
            <div class="logo"></div>\
            <ul>          \
                <li class="username">\
                    <label>Logged as <a href="http://last.fm/user/{{user}}" target="_blank">{{user}}</a></label>\
                </li>\
                <li class="toggle">\
                    <label>Scrobbling</label>\
                    <div class="toggler {{#unless scrobbling}}off{{/unless}}">\
                        <div></div>\
                    </div>                    \
                </li>\
                <li class="clearfix"></li>\
                \
                <li class="header">\
                    <span>Your Stations</span>\
                    {{#unless subscriber}}<span class="notice">Some radiostations available for subscribers only</span>{{/unless}}\
                </li>\
\
                <li class="stations {{#unless subscriber}}subscribe{{/unless}}">\
                    <ul>                    \
                        <li class="loved_radio free">Loved Tracks</li>\
\
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/personal">Library Radio</li>\
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/mix">Mix Radio</li>\
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/recommended">Recommended Radio</li>\
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/friends">Friends Radio</li>\
                        <li class="lastfm_radio pay" data-radio="lastfm://user/{{user}}/neighbours">Neighbourhood Radio</li>\
                    </ul>\
                </li>\
                <li class="clearfix"></li>\
                            \
                <li class="logout btn danger">Logout</li>\
            </ul>\
        </form>    \
    {{else}}\
    <form class="form login" onsubmit="return false">\
        <div class="logo"></div>\
        <ul>            \
            <li>\
                <label>Username <span class="error" style="display:none">Wrong credentials</span></label>\
                <input name="username" autofocus/>\
            </li>\
            <li>\
                <label>Password</label>\
                <input type="password" name="password" />\
            </li>\
            <li class="buttons">\
                <input type="submit" value="Login" class="btn" />\
            </li>\
        </ul>\
    </form>\
    {{/if}}\
    ');
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
      this.el.innerHTML = template(view);
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
      }, __bind(function(resp) {
        this.$('.login *').css({
          'visibility': 'visible'
        });
        if (resp.error) {
          this.$('.error').show();
          return this.spinner.stop();
        } else if (resp.session) {
          store.set('lastfm:user', resp.session.name);
          store.set('lastfm:subscriber', parseInt(resp.session.subscriber));
          if (browser.isPokki) {
            store.set('lastfm:key', pokki.scramble(resp.session.key));
          } else {
            store.set('lastfm:key', resp.session.key);
          }
          store.set('lastfm:scrobbling', true);
          return this.render();
        }
      }, this));
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
