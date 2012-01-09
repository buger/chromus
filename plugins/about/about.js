(function() {
  var About, about;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  About = (function() {

    __extends(About, Backbone.View);

    function About() {
      About.__super__.constructor.apply(this, arguments);
    }

    About.prototype.template = Handlebars.templates['about.ui.tmpl'];

    About.prototype.events = {
      "change input[name='debug']": 'toggleDebug'
    };

    About.prototype.initialize = function() {
      chromus.openPanel(this.el);
      return this.render();
    };

    About.prototype.render = function() {
      var view;
      view = {
        debug: store.get('debug')
      };
      return this.el.innerHTML = this.template(view);
    };

    About.prototype.toggleDebug = function(e) {
      return localStorage.setItem('debug', e.target.checked);
    };

    return About;

  })();

  about = $('<li>About</li>').bind('click', function() {
    $('#main_menu').hide();
    return new About();
  });

  chromus.addMenu(about);

}).call(this);
