(function() {
  var about, template;
  template = Handlebars.compile('    \
    <header>\
        <a class="back"></a>\
        <h3>About</h3>\
    </header>\
    <div style="margin-top:20px; text-align:center">\
        <h1 style="background:url(assets/icons/42x42.png) center left no-repeat; font-weight: bold; font-size: 16px; display: inline-block; line-height: 42px; padding-left: 50px">Chromus v3.0.2</h1>\
\
        <a href="https://github.com/chromus/chromus" style="display:block;margin-top:15px; font-size: 14px;" target="_blank">github</a>\
    </div>\
');
  about = $('<li>About</li>').bind('click', function() {
    var panel;
    $('#main_menu').hide();
    panel = $('<div class="panel">').html(template()).appendTo($("#wrapper"));
    return _.delay(function() {
      return panel.addClass('show');
    });
  });
  chromus.addMenu(about);
}).call(this);
