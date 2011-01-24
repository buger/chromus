if (!window.manager) {
    var manager = {}
} else {
    var manager = window.manager;
}

var $ = window.jQuery;


if (!document.body.className.match(/cmp_initialized/)) {
  document.body.className += " cmp_initialized";

  function stopCurrentTrack(){
      var current_playing = document.querySelector("a.sm2_button.playing, a.sm2_button.paused, a.sm2_button.loading")

      if(current_playing)
          $(current_playing).removeClass("playing paused loading")
  }


  var tracks_cache = {}

  /**
      getPlaylist(button) -> Array

      Get all tracks in music block, where button is    
  **/
  function getPlaylist(button){
      if(button.getAttribute('data-media-type') == 'raw-file'){
          return [window.getTrackInfo(button)] 
      }

      var container = window.findParent(button, 'with_vk_search')

      var tracks = []

      var index = container.getAttribute('data-index-number')
      if(tracks_cache[index]){
          tracks = tracks_cache[index]
      } else {
          var tracks = []
          var track
          var buttons = container.querySelectorAll("a.sm2_button")

          for(var i=0; i<buttons.length; i++){
              track = window.getTrackInfo(buttons[i])
              track.index = i
              
              tracks.push(track)
          }

          tracks_cache[index] = tracks
      }

      return tracks
  }

  function showOverloadWindow(){
      var image_url = chrome.extension.getURL('lastfm_128.png')

      var wnd = document.createElement('div')
      wnd.className = 'dialogBox ex_overload_window'
      wnd.innerHTML = "<a href='javascript:;' class='dialogStatus dialogClose' onclick=\"this.parentNode.style.display = 'none'\"></a>"+
                      "<h3 class='ex_header' style='background-image:url("+image_url+")'>Last.fm free music player</h3>"+
                      "<div class='dialogContent'>"+
                          "<p class='ex_title'>We are out of capacity :(</p>"+
                          "<p>If you don't want to see this window and play music without limits, you must be logged at <a href='http://vk.com'>http://vk.com</a> or <a href='http://vkontakte.ru'>http://vkontakte.ru</a>, or you can try play track later.</p>"+
                          "<p>To be clear, this is not advertising, it is due technical reasons.</p>"+
                      "</div>" 

      document.body.appendChild(wnd)
  }


    browser.addMessageListener( function(msg, sender) {
        switch (msg.method) {
            case "stop":
                stopCurrentTrack();
                break;

            case "loading":
                var button = document.getElementById(msg.element_id)
                if(button)
                    $(button).removeClass("playing").addClass("loading");

                break;
              
            case "readyToPlay":
                console.log("stopping current track");
                stopCurrentTrack();

                var button = document.getElementById(msg.element_id);

                if (button) {
                    if (msg.error) {
                        button.className = "sm2_button disabled";

                        if (msg.error == 'not_found') {
                            button.title = "Track not found";
                        } else if (msg.error == 'overload') {
                            button.title = "Server overload. Try later.";
                            button.className = "sm2_button";

                            showOverloadWindow();
                        } else {
                            button.title = msg.error;
                        }
                    } else {
                        stopCurrentTrack();
                      
                        $(button).removeClass('loading paused').addClass("playing");
                    }
                }

                break;

            case "updateState":
                break;

            default:
                console.log("Received unknown message:",msg);
        }
    });


  /**
      preparePage(search_pattern)

      Must be called after page load.
  **/
  function preparePage(search_pattern, external_audio_search){
      var customEvent = document.createEvent('Event');
      customEvent.initEvent('ex_play', true, true);

      if(manager.wrapMusicElements) {
        manager.wrapMusicElements(false)
      }
  }

  preparePage();

  console.log('Window browser object', window.browser);

  document.addEventListener('click', function(evt){
      var target = evt.target
      
      if(target.className.match('sm2_button')){              
          if(target.className.match('disabled'))
              return false;

          var track_info = window.getTrackInfo(target)

          if (target.className.match('playing')) {
              browser.postMessage({method:'pause', track: track_info})
              $(target).removeClass('playing').addClass("paused")
          } else {
              if (!target.className.match('paused'))
                  stopCurrentTrack()                          
              
              if (target.className.match('paused')) {
                  browser.postMessage({method:'play', track: track_info});
              } else {
                  browser.postMessage({method:'play', track: track_info, playlist: getPlaylist(target)});
              }

              $(target).removeClass('playing paused').addClass("sm2_button loading");
          }

          evt.stop();
          evt.stopPropagation();
      }
  }, false)


  // Tabs when switching in charts
  var tabs = document.querySelectorAll('.horizontalOptions, .nextPage, .previousPage')

  if (manager.wrapMusicElements)
    for(var i=0; i<tabs.length; i++){
        tabs[i].addEventListener('click', function(){
            setTimeout(function(){ manager.wrapMusicElements(false) }, 1000)
        }, false)
    }
}
