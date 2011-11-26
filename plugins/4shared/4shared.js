(function() {
  var Source;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Source = (function() {
    function Source() {}
    Source.prototype.baseURL = "http://search.4shared.com/q/CCQD/1/music";
    Source.prototype.processResults = function(response) {
      var results;
      results = $(response).find('table.listView tr');
      results = _.map(results, function(tr) {
        var result, _ref, _ref2, _ref3;
        tr = $(tr);
        return result = {
          title: tr.find('.fname a').html(),
          file_url: (_ref = tr.find('.playThumb img')) != null ? (_ref2 = _ref.attr('onclick')) != null ? (_ref3 = _ref2.match(/(http[^']*)/)) != null ? _ref3[1] : void 0 : void 0 : void 0
        };
      });
      results = _.reject(results, function(i) {
        return !i.title || !i.file_url;
      });
      return callb;
    };
    Source.prototype.search = function(args, callback) {
      var data, query, url;
      if (callback == null) {
        callback = function() {};
      }
      query = "" + args.artist + "_" + args.song;
      query = query.replace(/\s+/, "_").replace(" ", "_");
      console.warn(query);
      url = "" + this.baseURL + "/" + query;
      if (browser.isFrame) {
        data = {
          _url: url,
          _method: "GET"
        };
        return $.ajax({
          url: "" + chromus.baseURL + "/proxy",
          data: data,
          dataType: "jsonp",
          cache: true,
          success: __bind(function(resp) {
            var responseHtml;
            responseHtml = resp.response.replace(/\n/g, '\uffff').replace(/<script.*?>.*?<\/script>/gi, '').replace(/\n/g, '\uffff').replace(/<script.*?>.*?<\/script>/gi, '').replace(/\uffff/g, '\n').replace(/<(\/?)noscript/gi, '<$1div');
            return callback(this.processResults(responseHtml));
          }, this)
        });
      } else {
        return $.ajax({
          url: url,
          success: __bind(function(result) {
            return callback(this.processResults());
          }, this)
        });
      }
    };
    return Source;
  })();
  this.chromus.registerAudioSource("for_shared", new Source());
  this.chromus.registerPlugin("for_shared", new Source());
}).call(this);
