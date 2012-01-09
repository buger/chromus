(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['vkontakte.ui.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this;

function program1(depth0,data) {
  
  
  return "        		\r\n	<ul>\r\n		<li>\r\n			<h3 style=\"font-size:20px; font-weight: bold; margin-bottom: 10px;\">Logged!</h3>\r\n			<p style=\"font-size: 14px;\">Rest of functionality will be available in next update. Stay tuned!</p>\r\n		</li>\r\n		<li>\r\n			<a class=\"btn logout\" style=\"color: red\">Logout</a>\r\n		</li>\r\n	</ul>       	\r\n    ";}

function program3(depth0,data) {
  
  
  return "    \r\n	<ul>\r\n		<li style=\"text-align: center\">\r\n			<a class=\"btn login\">Login to Vkontakte</a>\r\n		</li>\r\n	</ul>\r\n    ";}

  buffer += "<header>\r\n    <a class=\"back\"></a>\r\n    <h3>Vkontakte</h3>\r\n</header>\r\n<form class=\"form\">\r\n	<div class=\"logo\"></div>\r\n    ";
  stack1 = helpers.logged || depth0.logged
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(3, program3, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</form>";
  return buffer;});
})()