var scrobbler = chrome.extension.getBackgroundPage().scrobbler


// Saves options to localStorage.
function save_options(form) {
    for(var i=0; i< form.search_provider.length; i++){
	if(form.search_provider[i].checked){
	    window.localStorage["search_provider"] = form.search_provider[i].id
	    
	    if(form.search_provider[i].id == "other")
		window.localStorage["search_pattern"] = form.search_pattern.value
	    else
		window.localStorage["search_pattern"] = form.search_provider[i].value
	}
    }

    window.location.reload()
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var search_provider = window.localStorage["search_provider"];
    try {
        var search_pattern = window.localStrorage["search_pattern"];
    } catch(e){}


    if(!window.localStorage['lastfm_session']){
        document.getElementById('not_logged').style.display = ''    
    }


    if(window.localStorage["skip_previews"] == "false" || window.localStorage["skip_previews"] == undefined){
        document.getElementById('play_previews').checked = true
    }

    if(window.localStorage["show_notifications"] == "true" || window.localStorage["show_notifications"] == undefined){
        document.getElementById('show_notifications').checked = true
    }

    if(window.localStorage["show_banner"] == "true" || window.localStorage["show_banner"] == undefined){
//        document.getElementById('toggle_banner').checked = true
    }
}

function showError(msg){
    document.getElementById("error").innerHTML = msg
    document.getElementById("error").style.display = "block"
}

function lastfm_logout(){
  delete window.localStorage["lastfm_session"]    
  delete window.localStorage["lastfm_username"]
  
  scrobbler._username = null
  scrobbler._session_key = null

  window.location.reload()
}

function onLoad(){    
    if(scrobbler._username){
        document.getElementById("logged").style.display = ''
        document.getElementById("username_display").innerHTML = scrobbler._username
    }
    
    restore_options()

    document.getElementById('logout_btn').addEventListener('click', function(){
        lastfm_logout();        
    });

    document.getElementById('not_logged').addEventListener('click', function(){
        scrobbler.auth();
        window.close();
    })
}


function toggle_play_previews(play){
    window.localStorage["skip_previews"] = !play
}

function toggle_notifications(show){    
    window.localStorage["show_notifications"] = show
}

function toggle_banner_func(show){ 
    if (!show && confirm('This banner supports our project and helps us to develop it. Do you still want to disable banner?')) {
        window.localStorage["show_banner"] = show
    } else {
        window.localStorage["show_banner"] = true
//        document.getElementById('toggle_banner').checked = true                                
    }
}


if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", function(){ onLoad(); }, false);

