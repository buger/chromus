$(function() {
  $("#volume-slider").slider({
    orientation: "vertical",
    range: "min",
    min: 0,
    max: 100,
    value: music_manager.getVolume()*100,
    slide: function(event, ui) {
      music_manager.setVolume(ui.value/100)
    }
  });


  $('button#play_mode_control').click(function(){
      $(this).toggleClass('disabled');

      music_manager.play_mode = $(this).hasClass('disabled') ? "normal" : "shuffle";
      window.localStorage['play_mode'] = music_manager.play_mode;
      
      _gaq.push(['_trackEvent', 'controls', 'playMode', music_manager.play_mode]);
  });

  helpOnHover($('button#play_mode_control'), function(){
      if ($(this).hasClass('disabled'))
          return "Shuffle mode disabled"
      else
          return "Shuffle mode enabled"
  })

  $('button#stop_after_control').click(function(){
      $(this).toggleClass('disabled');

      music_manager.stop_after_playing = $(this).hasClass('disabled') ? "normal" : "stop";
      window.localStorage['stop_after_playing'] = music_manager.stop_after_playing;

      _gaq.push(['_trackEvent', 'controls', 'playMode', music_manager.stop_after_playing]);
  });

  helpOnHover($('button#stop_after_control'), function(){
      if ($(this).hasClass('disabled'))
          return "Playing without stopping"
      else
          return "Stop after playing"
  })

    
    
  $('button#repeat_mode_control').click(function(){
      if ($(this).hasClass('all')){
        $(this).removeClass('all').addClass('disabled');
        music_manager.repeat_mode = "normal";
      } else if ($(this).hasClass('disabled')){
        $(this).removeClass('disabled all')
        music_manager.repeat_mode = "repeat_one";
      } else {
        $(this).removeClass('disabled').addClass('all');
        music_manager.repeat_mode = "repeat_all";
      }

      window.localStorage['repeat_mode'] = music_manager.repeat_mode;
      _gaq.push(['_trackEvent', 'controls', 'repeatMode', music_manager.repeat_mode]);
  });

  helpOnHover($('button#repeat_mode_control'), function(){
      if($(this).hasClass('all'))
        return "Repeat playlist"
      else if($(this).hasClass('disabled'))
        return "Don't repeat"
      else
        return "Repeat track"
  })


  $('button#toggle_scrobbling').click(function(){
      $(this).toggleClass('disabled')

      music_manager.scrobbler.scrobbling = !$(this).hasClass('disabled')
  })

  helpOnHover($('button#toggle_scrobbling'), function(){
      if($(this).hasClass('disabled'))
        return "Scrobbling disabled"
      else
        return "Scrobbling enabled"
  })
}); 


if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", function(){ onLoad(); }, false);       