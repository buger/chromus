(function() {
  var VkUI, menu, ui, vk;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  vk = chromus.plugins.vkontakte;

  VkUI = (function() {

    __extends(VkUI, Backbone.View);

    function VkUI() {
      VkUI.__super__.constructor.apply(this, arguments);
    }

    VkUI.prototype.template = Handlebars.templates['vkontakte.ui.tmpl'];

    VkUI.prototype.className = 'vkontakte';

    VkUI.prototype.events = {
      "click .login": "login",
      "click .logout": "logout"
    };

    VkUI.prototype.initialize = function() {
      _.bindAll(this);
      this.render();
      return window.setVKSession = this.setSession;
    };

    VkUI.prototype.open = function() {
      return chromus.openPanel(this.el);
    };

    VkUI.prototype.render = function() {
      var view;
      view = {
        logged: !!store.get('vk:token')
      };
      $(this.el).html(this.template(view));
      return this.delegateEvents();
    };

    VkUI.prototype.setSession = function(session) {
      store.set("vk:token", session.access_token);
      store.set("vk:user_id", session.user_id);
      $.ajax({
        url: "" + chromus.baseURL + "/api/token/add",
        data: {
          token: session.access_token
        },
        dataType: "jsonp",
        success: function(resp) {
          return console.log('token added');
        }
      });
      return this.render();
    };

    VkUI.prototype.login = function() {
      return window.open(vk.authURL(), "Vkontakte", "status=0,toolbar=0,location=0,menubar=0,resizable=1");
    };

    VkUI.prototype.logout = function() {
      $.ajax({
        url: "" + chromus.baseURL + "/api/token/delete",
        data: {
          token: store.get("vk:token")
        },
        dataType: "jsonp",
        success: function(resp) {
          return console.log('token removed');
        }
      });
      store.remove("vk:token");
      store.remove("vk:user_id");
      return this.render();
    };

    return VkUI;

  })();

  ui = new VkUI();

  menu = $('<li class="vkontakte">Vkontakte</li>').bind('click', function() {
    $('#main_menu').hide();
    console.warn(ui.open, ui);
    return ui.open();
  });

  chromus.addMenu(menu);

}).call(this);
