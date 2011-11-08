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
      $("            <li class='open_local_files'>                <span>Add files to playlist</span>                <input type='file' multiple />            </li>        ").appendTo('#main_menu').find('input').bind('change', this.openFiles);
      return browser.addMessageListener(this.listener);
    };
    PopupLocalPlayer.prototype.openFiles = function(evt) {
      var opened;
      opened = _.filter(evt.target.files, function(file) {
        return file.type.match(/^audio/);
      });
      opened = _.map(opened, function(file) {
        return {
          id: chromus.utils.uid(),
          artist: "",
          song: file.name,
          player: "local_files_player",
          data: file
        };
      });
      this.files.add(opened);
      if (opened.length) {
        return browser.postMessage({
          method: 'addToPlaylist',
          tracks: this.files.toJSON()
        });
      }
    };
    PopupLocalPlayer.prototype.readFile = function(id, callback) {
      var file, reader;
      if (callback == null) {
        callback = function() {};
      }
      file = this.files.get(id).get('data');
      reader = new FileReader();
      reader.onload = function(evt) {
        console.warn("READ FILES", evt);
        return callback(evt.target.result);
      };
      console.warn("reading files", file);
      return reader.readAsDataURL(file);
    };
    PopupLocalPlayer.prototype.listener = function(msg) {
      switch (msg.method) {
        case 'localPlayer:getContent':
          return this.readFile(msg.id, function(content) {
            return browser.postMessage({
              method: 'localPlayer:fileContent',
              id: msg.id,
              content: content
            });
          });
      }
    };
    return PopupLocalPlayer;
  })();
  new PopupLocalPlayer();
  $('#main_menu').show();
}).call(this);
