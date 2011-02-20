function findParent(element, className){
    var parentNode = element.parentNode

    if (!parentNode)
      return false;

    if(parentNode.className && parentNode.className.match(className))
        return parentNode
    else
        return findParent(parentNode, className)
}

function findElementPosition(element){
    var curleft = 0;
    var curtop = 0;

    if (element.offsetParent) {
        while (element.offsetParent) {
            curleft += element.offsetLeft - element.scrollLeft;
            curtop += element.offsetTop - element.scrollTop;

            var position='';

            if (element.style && element.style.position)
              position = element.style.position.toLowerCase();

            if (!position)
               if (element.currentStyle && element.currentStyle.position)
                   position = element.currentStyle.position.toLowerCase();

            if ((position=='absolute')||(position=='relative')) break;

            while (element.parentNode != element.offsetParent) {   
                element = element.parentNode;
                curleft -= element.scrollLeft;
                curtop -= element.scrollTop;
            }

            element = element.offsetParent;
        }
    } else {
        if (obj.x)
            curleft += obj.x;
        if (obj.y)
            curtop += obj.y;
    }
    
    return {left:curleft,top:curtop};
}

function xhrRequest(url, method, data, callback){
    var xhr = new XMLHttpRequest()

    //console.debug('Sending request:', url+'?'+data)

    if(method == "POST"){
        xhr.open(method, url, true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send(data)
    } else {
        if(url.match(/\?/))
            xhr.open(method, url+'&'+data, true)
        else
            xhr.open(method, url+'?'+data, true)

        xhr.send()
    }

    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log("Response on "+url+" :", xhr, data)
//            console.log("Response text:", xhr.responseText)
            callback(xhr)
        }
    }
}

function xhrRedirectUrl(url, callback){    
    console.log("ASDASDASD")

    var xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.send()
    
    console.log("Sending redirect response:", url)

    xhr.onreadystatechange = function(){
        console.log("Redirect response:", xhr)
    }
}

function prettyTime(seconds){
    seconds = parseInt(seconds)

    var minutes = parseInt(seconds/60)

    var seconds = seconds % 60
    if(seconds < 10)
        seconds = "0"+seconds

    if(minutes < 10)
        minutes = " "+minutes

    return minutes + ":" + seconds
}

function timeToSeconds(time){
    time = time.split(':')

    return parseInt(time[0])*60 + parseInt(time[1])
}

String.prototype.replaceEntities = function(){
   return this.replace(/&amp;/g, '&').replace(/%27/g,"'") 
}

String.prototype.stripHTML = function(){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = this;
   return tmp.textContent||tmp.innerText;
}

Function.prototype.bind = function(scope) {
  var _function = this;
  
  return function() {
    return _function.apply(scope, arguments);
  }
}


function getTrackInfo(button){
  if (button.getAttribute('data-media-type') == 'raw-file'){
    return {
      file_url: button.getAttribute('data-url'),
      song: button.innerHTML.stripHTML(),
      element_id: button.id,
      index: 0
    }
  }

  var container = findParent(button, "ex_container")
  
  var streamable = false

  if(container.className.match('fdl'))
      streamable = 'free'
  else if(container.className.match('streamable'))
      streamable = true

  if (!window.pageID) {
      window.pageID = new Date().getTime();
  }

  var track_info = {
      artist:     container.getAttribute('data-artist'),
      song:       container.getAttribute('data-song'),
      album:      container.getAttribute('data-album'),
      track_id:   container.getAttribute('data-track-id'),
      index:      parseInt(container.getAttribute('data-index-number')),
      page_id:    window.pageID,
      
      element_id: button.id,
      streamable: streamable
  }

  for(key in track_info)
      if(track_info[key] == undefined) 
          delete track_info[key]
  
  return track_info
}


// Exporting functions for injected scripts in opera
window.getTrackInfo = getTrackInfo;
window.findParent = findParent;
