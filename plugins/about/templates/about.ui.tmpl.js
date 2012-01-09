(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['about.ui.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this;

function program1(depth0,data) {
  
  
  return "checked=\"checked\"";}

  buffer += "<header>\r\n    <a class=\"back\"></a>\r\n    <h3>About</h3>\r\n</header>\r\n<div style=\"margin-top:20px; text-align:center\">\r\n    <h1 style=\"background:url(assets/icons/42x42.png) center left no-repeat; font-weight: bold; font-size: 16px; display: inline-block; line-height: 42px; padding-left: 50px\">Chromus v3.0.2</h1>\r\n\r\n    <a href=\"https://github.com/chromus/chromus\" style=\"display:block;margin-top:15px; font-size: 14px;\" target=\"_blank\">github</a>\r\n\r\n    <div>\r\n        <label><input type=\"checkbox\" name=\"debug\" ";
  stack1 = helpers.debug || depth0.debug
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/> Debug mode</label>            \r\n    </div>\r\n</div>";
  return buffer;});
})()