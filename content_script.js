var imgURL = chrome.extension.getURL("vk.png")
var vk_search_pattern = 'http://vkontakte.ru/gsearch.php?section=audio&q='

var artist, song, songInfo, vk_search_link, page_type, style, offset
var loc = window.location.toString()

function generate_link(track, style){
    return "<a href='"+vk_search_pattern+track+"' target='_blank' class='lfmButton' style='"+style+"'><img src='"+imgURL+"'/></a>"
}

if(loc.match("/user/.*"))
  page_type = "user"
else if(loc.match("/music/.*/_/.*"))
  page_type = "song"
else if(page_type = loc.match("/music/(.*)/(.*)")){
  artist = page_type[1]
  page_type = "album"
} else if(page_type = loc.match("/music/(.*)")){
  artist = page_type[1]
  page_type = "artist"
} else if(page_type = loc.match("/charts.*")){
  page_type = "chart"
}

if(page_type == "song") {
    var match = loc.match("/music/(.*)/_/(.*)")
    
    track = match[1]+" "+match[2]    

    $$('.rightCol').first().insert({top:generate_link(track.replace("+"," "), "")})
} else {
    $$("table.tracklist tbody td.smallmultibuttonCell,\
	table.chart tbody td.multibuttonCell,\ 
	table.mediumImageChart tbody td.subjectCell").each(function(td){		
    
        className = td.className.strip()	

	if(className == "smallmultibuttonCell" || className == "multibuttonCell")
	    table_type = "simple"
	else
	    table_type = "chart"

    
	if(table_type == "simple"){
	    td.style.width = "50px"	   
	    songInfo = td.previous('.subjectCell').select('a')
	} else if(table_type == "chart") {
	    songInfo = td.select('a')
	}
	
	style = "vertical-align:middle;display: inline-block;"

	if(table_type == "simple" && (page_type == "user" || page_type == "chart")){
	    artist = songInfo[0].innerHTML	
	    song = songInfo[1] ? songInfo[1].innerHTML : ""
	} else if(page_type == "artist" || page_type == "album") {
	    song = songInfo[0].innerHTML
	} else if(table_type == "chart") { //Charts
	    if(songInfo.length == 3)
	      offset = 1
	    else
	      offset = 0

	    artist = songInfo[offset].innerHTML
	    song   = songInfo[offset+1] ? songInfo[offset+1].innerHTML : ""
	    style += "margin-right: 5px;"
	}

	track = artist + " " + song	    

	vk_search_link = generate_link(track, style) 

	if(table_type == "chart"){
	    td.down('span').insert({top:vk_search_link})
	}else
	    td.innerHTML = vk_search_link + td.innerHTML
    })
}
