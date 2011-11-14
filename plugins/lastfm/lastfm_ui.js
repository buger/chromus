(function() {
  var ErrorWindow, LoginView, Menu, error_template, error_window, lastfm, login_template, menu, menu_template;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  lastfm = chromus.plugins.lastfm;
  login_template = '\
    <form class="form">\
        <ul>\
            <li>\
                <center>\
                <img src="http://cdn.last.fm/flatness/badges/lastfm_red.gif"/>\
                </center>\
            </li>\
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
                <a class="close">close</a>\
            </li>\
        </ul>\
    </form>';
  LoginView = (function() {
    __extends(LoginView, Backbone.View);
    function LoginView() {
      LoginView.__super__.constructor.apply(this, arguments);
    }
    LoginView.prototype.events = {
      "submit form": "login",
      "click .close": "close"
    };
    LoginView.prototype.render = function() {
      this.el.innerHTML = login_template;
      this.delegateEvents();
      $('#dialog .content').html(this.el);
      return $('#dialog').show();
    };
    LoginView.prototype.login = function(evt) {
      var auth_token, form, password, username, _ref;
      form = evt.target;
      _ref = [form.username.value, form.password.value], username = _ref[0], password = _ref[1];
      this.$('*').css({
        'visibility': 'hidden'
      });
      this.spinner = new Spinner().spin(this.el);
      auth_token = MD5(username + MD5(password));
      lastfm.callMethod('auth.getMobileSession', {
        sig_call: true,
        username: username,
        authToken: auth_token
      }, __bind(function(resp) {
        if (resp.error) {
          this.$('*').css({
            'visibility': 'visible'
          });
          this.$('.error').show();
          return this.spinner.stop();
        } else if (resp.session) {
          store.set('lastfm:user', resp.session.name);
          if (browser.isPokki) {
            store.set('lastfm:key', pokki.scramble(resp.session.key));
          } else {
            store.set('lastfm:key', resp.session.key);
          }
          store.set('lastfm:scrobbling', true);
          this.el.innerHTML = '\
                    <form class="form">\
                    <ul>             \
                        <li style="text-align: center">   \
                            <label class="success" style="color: green; font-weight: bold;">Successfully Logged</label>\
                        </li>                        \
                        <li class="buttons">\
                            <a class="close" style="margin-left: 0px">close</a>\
                        </li>\
                    </ul>\
                    </form>\
                ';
          this.delegateEvents();
          return menu.render();
        }
      }, this));
      return false;
    };
    LoginView.prototype.close = function() {
      return $('#dialog').hide();
    };
    return LoginView;
  })();
  error_template = Handlebars.compile('\
    <ul>\
        <li>\
            <span>This channel available only for paid Last.fm subscribers</span>\
        </li>\
        <li class="buttons">\
            <a class="close">Close</a>\
        </li>\
    </ul>\
');
  ErrorWindow = (function() {
    __extends(ErrorWindow, Backbone.View);
    function ErrorWindow() {
      ErrorWindow.__super__.constructor.apply(this, arguments);
    }
    ErrorWindow.prototype.events = {
      "click .close": "close"
    };
    ErrorWindow.prototype.render = function() {
      this.el.innerHTML = error_template();
      this.delegateEvents();
      $('#dialog .content').html(this.el);
      return $('#dialog').show();
    };
    ErrorWindow.prototype.close = function() {
      return $('#dialog').hide();
    };
    return ErrorWindow;
  })();
  error_window = new ErrorWindow();
  menu_template = Handlebars.compile('            \
<span>Last.fm</span>            \
<ul class="menu_container">\
    {{#if username}}\
        {{#if scrobbling}}\
            <li class="toggle enabled" style="color: #5FFA69">Scrobbling enabled</li>\
        {{else}}\
            <li class="toggle disabled" style="color: #FF6666">Scrobbling disabled</li>\
        {{/if}}        \
        <li class="header">Free radio</li>\
        <li class="loved_radio">Loved Tracks Radio</li>\
        <li class="header">Subscribers radio</li>\
        <li class="lastfm_radio" data-radio="lastfm://user/{{username}}/personal">Library Radio</li>\
        <li class="lastfm_radio" data-radio="lastfm://user/{{username}}/mix">Mix Radio</li>\
        <li class="lastfm_radio" data-radio="lastfm://user/{{username}}/recommended">Recommendation Radio</li>\
        <li class="header"></li>\
        <li><a href="http://last.fm/user/{{username}}" target="_blank">{{username}}</a></li>        \
        <li class="logout">Logout</li>\
    {{else}}\
        <li class="not_logged">Login to Last.fm</li>\
    {{/if}}\
</ul> \
');
  Menu = (function() {
    __extends(Menu, Backbone.View);
    function Menu() {
      Menu.__super__.constructor.apply(this, arguments);
    }
    Menu.prototype.tagName = 'li';
    Menu.prototype.className = 'lastfm';
    Menu.prototype.events = {
      "click .not_logged": "login",
      "click .logout": "logout",
      "click .toggle": "toggle",
      "click .lastfm_radio": "playRadio",
      "click .loved_radio": "playLovedRadio"
    };
    Menu.prototype.initialize = function() {
      this.container = $('#main_menu');
      return this.render();
    };
    Menu.prototype.render = function() {
      var view;
      view = {
        username: store.get('lastfm:user'),
        scrobbling: store.get('lastfm:scrobbling')
      };
      this.el.innerHTML = menu_template(view);
      return this.delegateEvents();
    };
    Menu.prototype.login = function() {
      this.container.hide();
      return new LoginView().render();
    };
    Menu.prototype.logout = function() {
      store.remove('lastfm:user');
      store.remove('lastfm:key');
      return this.render();
    };
    Menu.prototype.toggle = function() {
      store.set('lastfm:scrobbling', !store.get('lastfm:scrobbling'));
      return this.render();
    };
    Menu.prototype.playRadio = function(evt) {
      var track;
      track = {
        type: "lastfm:radio",
        artist: "LastFM radio",
        song: "Loading...",
        station: $(evt.target).attr('data-radio')
      };
      return browser.postMessage({
        method: "play",
        track: track,
        playlist: [track]
      });
    };
    Menu.prototype.playLovedRadio = function(evt) {
      var track;
      track = {
        type: "lastfm:loved",
        artist: "LastFM Loved radio (free)",
        song: "Loading..."
      };
      return browser.postMessage({
        method: "play",
        track: track,
        playlist: [track]
      });
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
