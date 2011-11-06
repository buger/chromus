(function() {
  var PopupLocalPlayer;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  PopupLocalPlayer = (function() {
    __extends(PopupLocalPlayer, Backbone.Model);
    function PopupLocalPlayer() {
      PopupLocalPlayer.__super__.constructor.apply(this, arguments);
    }
    PopupLocalPlayer.prototype.initialize = function() {
      _.bindAll(this);
      this.files = new Backbone.Collection();
      return $('#main_menu .open_local_files input').live('change', this.openFiles);
    };
    PopupLocalPlayer.prototype.openFiles = function(evt) {
      var file, opened, _i, _len;
      opened = _.filter(evt.target.files, function(file) {
        return file.type.match(/^audio/);
      });
      for (_i = 0, _len = opened.length; _i < _len; _i++) {
        file = opened[_i];
        this.files.add({
          id: chromus.utils.uid(),
          name: file.name,
          player: "local_files_player",
          data: file
        });
      }
      if (opened.length) {
        return browser.postMessage({
          method: 'localPlayer:addFiles',
          files: this.files.toJSON()
        });
      }
    };
    return PopupLocalPlayer;
  })();
  new PopupLocalPlayer();
}).call(this);
