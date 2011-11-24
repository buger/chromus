(function() {
  var file_name, fs, page, waitFor;
  fs = require('fs');
  waitFor = function(testFx, onReady, timeOutMillis) {
    var condition, f, interval, start;
    if (timeOutMillis == null) {
      timeOutMillis = 5000;
    }
    start = new Date().getTime();
    condition = false;
    f = function() {
      if ((new Date().getTime() - start < timeOutMillis) && !condition) {
        return condition = (typeof testFx === 'string' ? eval(testFx) : testFx());
      } else {
        if (!condition) {
          console.log("'waitFor()' timeout");
          return phantom.exit(1);
        } else {
          console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
          if (typeof onReady === 'string') {
            eval(onReady);
          } else {
            onReady();
          }
          return clearInterval(interval);
        }
      }
    };
    return interval = setInterval(f, 100);
  };
  if (phantom.args.length !== 1) {
    console.log('Usage: run-jasmine.coffee URL');
    phantom.exit();
  }
  page = new WebPage();
  page.onConsoleMessage = function(msg) {
    return console.log(msg);
  };
  file_name = fs.absolute(phantom.args[0]) + "?test_mode";
  page.open(file_name, function(status) {
    if (status !== 'success') {
      console.log('Unable to access network');
      return phantom.exit();
    } else {
      return waitFor(function() {
        return page.evaluate(function() {
          if (document.body.querySelector('.finished-at')) {
            return true;
          }
          return false;
        });
      }, function() {
        page.evaluate(function() {
          var el, list, _i, _len, _results;
          console.log(document.body.querySelector('.description').innerText);
          list = document.body.querySelectorAll('.failed > .description, .failed > .messages > .resultMessage');
          _results = [];
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            el = list[_i];
            _results.push(console.log(el.innerText));
          }
          return _results;
        });
        return phantom.exit();
      });
    }
  });
}).call(this);
