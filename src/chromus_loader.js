(function() {
  var files, global, _ref, _ref2;

  global = this;

  global.debug = (typeof exports !== "undefined" && exports !== null) || !!((typeof localStorage !== "undefined" && localStorage !== null ? localStorage.getItem('debug') : void 0) === "true");

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

  if (this.debug) {
    files = ["lib/zepto.js", "lib/store.js", "lib/underscore-min.js", "lib/backbone-min.js", "popup!lib/jquery.nanoscroller.min.js", "popup!lib/handlebars.js", "popup!lib/spin.min.js", "test_mode!css!lib/jasmine/jasmine.css", "test_mode!lib/jasmine/jasmine.js", "test_mode!lib/jasmine/jasmine-html.js", "src/chromus.js?" + (+new Date()), "src/utils.js"];
  } else {
    files = ["popup!build/popup.js", "bg!build/bg.js", "css!build/plugin_styles.css"];
  }

  if (browser.page_type === "popup" && global.isTestMode()) {
    browser.onReady(function() {
      return browser._bg_page.style.display = 'block';
    });
  }

  yepnope({
    load: files
  });

}).call(this);
