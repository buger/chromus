(function() {
  var files, global, _ref, _ref2;

  global = this;

  if (((_ref = this.parent) != null ? typeof _ref.isTestMode === "function" ? _ref.isTestMode() : void 0 : void 0) || ((_ref2 = this.location) != null ? _ref2.toString().match(/test_mode/) : void 0)) {
    this.testMode = true;
    document.getElementsByTagName('html')[0].className += " test_mode";
  }

  this.isTestMode = function() {
    return !!this.testMode;
  };

  yepnope.addPrefix('bg', function(resource) {
    resource.bypass = browser.page_type !== "background";
    return resource;
  });

  yepnope.addPrefix('popup', function(resource) {
    resource.bypass = browser.page_type !== "popup";
    return resource;
  });

  yepnope.addPrefix('bg_spec', function(resource) {
    resource.bypass = !(this.testMode && browser.page_type === "background");
    return resource;
  });

  yepnope.addPrefix('popup_spec', function(resource) {
    resource.bypass = !(this.testMode && browser.page_type === "popup");
    return resource;
  });

  yepnope.addPrefix('test_mode', function(resource) {
    resource.bypass = !this.testMode;
    return resource;
  });

  yepnope.addPrefix('css', function(resource) {
    resource.forceCSS = true;
    return resource;
  });

  files = ["lib/jquery.min.js", "lib/store.js", "lib/md5.js", "lib/underscore-min.js", "lib/backbone-min.js", "popup!lib/iscroll.js", "popup!lib/handlebars.js", "popup!lib/spin.min.js", "test_mode!css!lib/jasmine/jasmine.css", "test_mode!lib/jasmine/jasmine.js", "test_mode!lib/jasmine/jasmine-html.js", "src/chromus.js?" + (+new Date()), "src/utils.js"];

  yepnope({
    load: "lib/browser_api.js",
    complete: function() {
      if (browser.page_type === "popup" && global.isTestMode()) {
        browser.onReady(function() {
          return browser._bg_page.style.display = 'block';
        });
      }
      return yepnope({
        load: files
      });
    }
  });

}).call(this);
