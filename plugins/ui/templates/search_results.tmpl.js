(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['search_results.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n    <h3>Search &laquo;";
  stack1 = helpers.search_term || depth0.search_term
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "search_term", { hash: {} }); }
  buffer += escapeExpression(stack1) + "&raquo;</h3>\r\n    ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n<h3>Artists</h3>\r\n<ul>\r\n    ";
  stack1 = helpers.artists || depth0.artists
  tmp1 = self.program(4, program4, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    ";
  stack1 = helpers.artists || depth0.artists
  tmp1 = self.noop;
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(6, program6, data);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</ul>\r\n";
  return buffer;}
function program4(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\r\n        <li>\r\n            <a class=\"ex_container\" data-artist=\"";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\r\n                <span class=\"image\" style='background-image: url(";
  stack1 = depth0;
  stack2 = helpers.lfm_img || depth0.lfm_img
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "lfm_img", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + ")'></span>\r\n                <span>";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span>\r\n\r\n                <span class=\"add_to_playlist\" title=\"Add to playlist\"></span>\r\n            </a>\r\n        </li>\r\n    ";
  return buffer;}

function program6(depth0,data) {
  
  
  return "\r\n        <li class=\"loader\"></li>\r\n    ";}

function program8(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n<h3>Tracks</h3>\r\n<ul>\r\n    ";
  stack1 = helpers.tracks || depth0.tracks
  tmp1 = self.program(9, program9, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    ";
  stack1 = helpers.tracks || depth0.tracks
  tmp1 = self.noop;
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(11, program11, data);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</ul>\r\n";
  return buffer;}
function program9(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\r\n        <li>\r\n            <a class=\"ex_container\" data-artist=\"";
  stack1 = helpers.artist || depth0.artist
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "artist", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" data-song=\"";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\r\n                <span class=\"image\" style='background-image: url(";
  stack1 = depth0;
  stack2 = helpers.lfm_img || depth0.lfm_img
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "lfm_img", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + ")'></span>\r\n                <span>";
  stack1 = helpers.artist || depth0.artist
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "artist", { hash: {} }); }
  buffer += escapeExpression(stack1) + "<br/><b>";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</b></span>\r\n\r\n                <span class=\"add_to_playlist\" title=\"Add to playlist\"></span>\r\n            </a>\r\n        </li>\r\n    ";
  return buffer;}

function program11(depth0,data) {
  
  
  return "\r\n        <li class=\"loader\"></li>\r\n    ";}

function program13(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n<h3>Albums</h3>\r\n<ul>\r\n    ";
  stack1 = helpers.albums || depth0.albums
  tmp1 = self.program(14, program14, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    ";
  stack1 = helpers.albums || depth0.albums
  tmp1 = self.noop;
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(16, program16, data);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</ul>\r\n";
  return buffer;}
function program14(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\r\n        <li>\r\n            <a class=\"ex_container\" data-artist=\"";
  stack1 = helpers.artist || depth0.artist
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "artist", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" data-album=\"";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\r\n                <span class=\"image\" style='background-image: url(";
  stack1 = depth0;
  stack2 = helpers.lfm_img || depth0.lfm_img
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "lfm_img", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + ")'></span>\r\n                <span>";
  stack1 = helpers.artist || depth0.artist
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "artist", { hash: {} }); }
  buffer += escapeExpression(stack1) + "<br/><b>";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</b></span>\r\n\r\n                <span class=\"add_to_playlist\" title=\"Add to playlist\"></span>\r\n            </a>\r\n        </li>\r\n    ";
  return buffer;}

function program16(depth0,data) {
  
  
  return "\r\n        <li class=\"loader\"></li>\r\n    ";}

  buffer += "<header>\r\n    <a class=\"back\"></a>\r\n    ";
  stack1 = helpers.search_term || depth0.search_term
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</header>\r\n\r\n<div class=\"search_results\">\r\n";
  stack1 = helpers.show_artists || depth0.show_artists
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n\r\n";
  stack1 = helpers.show_tracks || depth0.show_tracks
  tmp1 = self.program(8, program8, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n\r\n";
  stack1 = helpers.show_albums || depth0.show_albums
  tmp1 = self.program(13, program13, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</div>";
  return buffer;});
})()