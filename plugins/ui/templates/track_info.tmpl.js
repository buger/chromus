(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['track_info.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <span class=\"dash\">-</span>\r\n        <a class=\"album\" href=\"";
  stack1 = helpers.album_url || depth0.album_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "album_url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\">";
  stack1 = helpers.album || depth0.album
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "album", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a>\r\n        ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n    <a>\r\n        <img src=\"";
  stack1 = helpers.source_icon || depth0.source_icon
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "source_icon", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" />\r\n        <span>";
  stack1 = helpers.source_title || depth0.source_title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "source_title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span>\r\n    </a>\r\n    ";
  return buffer;}

  buffer += "<div class=\"container\">\r\n    <a class=\"album_img\">\r\n        <img src=\"";
  stack1 = depth0;
  stack2 = helpers.lfm_img || depth0.lfm_img
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "lfm_img", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "\" />\r\n    </a>\r\n    <div class=\"love_btn\"><a class='button'></a></div>\r\n    <div class=\"info\">\r\n        <a class=\"song\" href=\"";
  stack1 = helpers.song_url || depth0.song_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "song_url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\">";
  stack1 = helpers.song || depth0.song
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "song", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a>\r\n        <a class=\"artist\" href=\"";
  stack1 = helpers.artist_url || depth0.artist_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "artist_url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\">";
  stack1 = helpers.artist || depth0.artist
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "artist", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a>\r\n        ";
  stack1 = helpers.album || depth0.album
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n</div>\r\n\r\n<div class=\"source\">\r\n    ";
  stack1 = helpers.source_title || depth0.source_title
  stack2 = helpers['if']
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</div>\r\n<div class=\"loader\"></div>";
  return buffer;});
})()