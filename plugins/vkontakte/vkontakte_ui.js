(function() {
  var UI, menu, template, ui, vk;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  template = Handlebars.compile('    \
    <header>\
        <a class="back"></a>\
        <h3>Vkontakte</h3>\
    </header>\
    <form class="form">\
    	<div class="logo"></div>\
	{{#if logged}}        		\
    	<ul>\
    		<li>\
    			<b>Logged!</b>\
    		</li>\
    		<li>\
    			<a class="btn logout" style="color: red">Logout</a>\
    		</li>\
    	</ul>       	\
    {{else}}    \
    	<ul>\
    		<li style="text-align: center">\
    			<a class="btn login">Login to Vkontakte</a>\
    		</li>\
    	</ul>\
    {{/if}}\
    </form>\
');
  vk = chromus.plugins.vkontakte;
  UI = (function() {
    __extends(UI, Backbone.View);
    function UI() {
      UI.__super__.constructor.apply(this, arguments);
    }
    UI.prototype.className = 'vkontakte';
    UI.prototype.events = {
      "click .login": "login",
      "click .logout": "logout"
    };
    UI.prototype.initialize = function() {
      _.bindAll(this);
      this.render();
      return window.setVKSession = this.setSession;
    };
    UI.prototype.open = function() {
      return chromus.openPanel(this.el);
    };
    UI.prototype.render = function() {
      var view;
      view = {
        logged: !!store.get('vk:token')
      };
      this.el.innerHTML = template(view);
      return this.delegateEvents();
    };
    UI.prototype.setSession = function(session) {
      store.set("vk:token", session.access_token);
      store.set("vk:user_id", session.user_id);
      return this.render();
    };
    UI.prototype.login = function() {
      return window.open(vk.authURL(), "Vkontakte", "status=0,toolbar=0,location=0,menubar=0,resizable=1");
    };
    UI.prototype.logout = function() {
      store.remove("vk:token");
      store.remove("vk:user_id");
      return this.render();
    };
    return UI;
  })();
  ui = new UI();
  menu = $('<li class="vkontakte">Vkontakte</li>').bind('click', function() {
    $('#main_menu').hide();
    return ui.open();
  });
  chromus.addMenu(menu);
}).call(this);
