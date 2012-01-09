(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['lastfm.ui.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\r\n    <form class=\"form\">\r\n        <div class=\"logo\"></div>\r\n        <ul>          \r\n            <li class=\"username\">\r\n                <label>Logged as <a href=\"http://last.fm/user/";
  stack1 = helpers.user || depth0.user
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "user", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\">";
  stack1 = helpers.user || depth0.user
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "user", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></label>\r\n            </li>\r\n            <li class=\"toggle\">\r\n                <label>Scrobbling</label>\r\n                <div class=\"toggler ";
  stack1 = helpers.scrobbling || depth0.scrobbling
  stack2 = helpers.unless
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\r\n                    <div></div>\r\n                </div>                    \r\n            </li>\r\n            <li class=\"clearfix\"></li>\r\n            \r\n            <li class=\"header\">\r\n                <span>Your Stations</span>\r\n                ";
  stack1 = helpers.subscriber || depth0.subscriber
  stack2 = helpers.unless
  tmp1 = self.program(4, program4, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            </li>\r\n\r\n            <li class=\"stations ";
  stack1 = helpers.subscriber || depth0.subscriber
  stack2 = helpers.unless
  tmp1 = self.program(6, program6, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\r\n                <ul>                    \r\n                    <li class=\"loved_radio free\">Loved Tracks</li>\r\n\r\n                    <li class=\"lastfm_radio pay\" data-radio=\"lastfm://user/";
  stack1 = helpers.user || depth0.user
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "user", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/personal\">Library Radio</li>\r\n                    <li class=\"lastfm_radio pay\" data-radio=\"lastfm://user/";
  stack1 = helpers.user || depth0.user
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "user", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/mix\">Mix Radio</li>\r\n                    <li class=\"lastfm_radio pay\" data-radio=\"lastfm://user/";
  stack1 = helpers.user || depth0.user
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "user", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/recommended\">Recommended Radio</li>\r\n                    <li class=\"lastfm_radio pay\" data-radio=\"lastfm://user/";
  stack1 = helpers.user || depth0.user
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "user", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/friends\">Friends Radio</li>\r\n                    <li class=\"lastfm_radio pay\" data-radio=\"lastfm://user/";
  stack1 = helpers.user || depth0.user
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "user", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/neighbours\">Neighbourhood Radio</li>\r\n                </ul>\r\n            </li>\r\n            <li class=\"clearfix\"></li>\r\n                        \r\n            <li class=\"logout btn danger\">Logout</li>\r\n        </ul>\r\n    </form>    \r\n";
  return buffer;}
function program2(depth0,data) {
  
  
  return "off";}

function program4(depth0,data) {
  
  
  return "<span class=\"notice\">Some stations available for subscribers only</span>";}

function program6(depth0,data) {
  
  
  return "subscribe";}

function program8(depth0,data) {
  
  
  return "\r\n<form class=\"form login\" onsubmit=\"return false\">\r\n    <div class=\"logo\"></div>\r\n    <ul>            \r\n        <li>\r\n            <label>Username <span class=\"error\" style=\"display:none\">Wrong credentials</span></label>\r\n            <input name=\"username\" autofocus/>\r\n        </li>\r\n        <li>\r\n            <label>Password</label>\r\n            <input type=\"password\" name=\"password\" />\r\n        </li>\r\n        <li class=\"buttons\">\r\n            <input type=\"submit\" value=\"Login\" class=\"btn\" />\r\n        </li>\r\n    </ul>\r\n</form>\r\n";}

  buffer += "<header>\r\n    <a class=\"back\"></a>\r\n    <h3>Last.FM</h3>\r\n</header>\r\n";
  stack1 = helpers.logged || depth0.logged
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(8, program8, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
})()