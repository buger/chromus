var found_links = document.querySelectorAll('a[href$=".mp3"]');
var mp3_links = [];
for(i in found_links){
  if ((!found_links[i].className || 
        found_links[i].className && !found_links[i].className.match(/(ymp-tray-track|powerpress_link_pinw)/)) &&       

      !(found_links[i].href && found_links[i].href.match(/freedownloads\.last\.fm/))
       ) {
    mp3_links.push(found_links[i]);
  }
}

for(i in mp3_links){
  var p = mp3_links[i].parentNode;
  
  var play_link = "<a href='javascript:;' class='sm2_button' id='ex_button_"+i+"' data-url='"+mp3_links[i].href+"' data-media-type='raw-file'></a>";

  mp3_links[i].outerHTML = play_link + mp3_links[i].outerHTML;
}
