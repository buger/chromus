var links = document.querySelectorAll('a');

var audio_links = []

for (var i=0; i<links.length; i++) {
    if (links[i].href.match(/\.(mp3|ogg)($|\?)/)) {

        if (!links[i].className ||
           ((links[i].className && !links[i].className.match(/(ymp-tray-track|powerpress_link_pinw)/)) && // Yahoo music player
             !links[i].href.match(/freedownloads\.last\.fm/))) // Last.fm free downloads
        {
            audio_links.push(links[i]);
        }
    }
}


for (var i=0; i<audio_links.length; i++) {
  var p = audio_links[i].parentNode;
  
  var play_link = "<a href='javascript:;' class='sm2_button' id='ex_button_"+i+"' data-url='"+audio_links[i].href+"' data-media-type='raw-file'></a>";

  audio_links[i].outerHTML = play_link + audio_links[i].outerHTML;
}
