(function() {
  var LoginView, lastfm, template;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  lastfm = chromus.plugins.lastfm;
  template = '\
    <form class="form">\
        <ul>\
            <li>\
                <label>Username <span class="error" style="display:none">Wrong credentials</span></label>\
                <input name="username" autofocus/>\
            </li>\
            <li>\
                <label>Password</label>\
                <input type="password" name="password" />\
            </li>\
            <li class="buttons">\
                <a class="close">close</a>\
                <input type="submit" value="Login" />\
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
      this.el.innerHTML = template;
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
          store.set('lastfm:key', resp.session.key);
          store.set('lastfm:scrobbling', true);
          this.el.innerHTML = '               \
                    <label class="success">Logged!</label>\
                    <a class="close">close</a>\
                ';
          return this.delegateEvents();
        }
      }, this));
      return false;
    };
    LoginView.prototype.close = function() {
      return $('#dialog').hide();
    };
    return LoginView;
  })();
  $('#main_menu .scrobbling').live('click', function() {
    $('#main_menu').hide();
    return new LoginView().render();
  });
}).call(this);
