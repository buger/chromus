(function() {
  var About, about, template;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  template = Handlebars.compile('    \
    <header>\
        <a class="back"></a>\
        <h3>About</h3>\
    </header>\
    <div style="margin-top:20px; text-align:center">\
        <h1 style="background:url(assets/icons/42x42.png) center left no-repeat; font-weight: bold; font-size: 16px; display: inline-block; line-height: 42px; padding-left: 50px">Chromus v3.0.2</h1>\
\
        <a href="https://github.com/chromus/chromus" style="display:block;margin-top:15px; font-size: 14px;" target="_blank">github</a>\
\
        <div>\
            <label><input type="checkbox" name="debug" {{#if debug}}checked="checked"{{/if}}/> Debug mode</label>            \
        </div>\
    </div>\
');

  About = (function() {

    __extends(About, Backbone.View);

    function About() {
      About.__super__.constructor.apply(this, arguments);
    }

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
      return this.el.innerHTML = template(view);
    };

    About.prototype.toggleDebug = function(el) {
      return store.set('debug', el.checked);
    };

    return About;

  })();

  about = $('<li>About</li>').bind('click', function() {
    $('#main_menu').hide();
    return new About();
  });

  chromus.addMenu(about);

}).call(this);
