function findParent(element, className){
    var parentNode = element.parentNode

    if(parentNode.className && parentNode.className.match(className))
        return parentNode
    else
        return findParent(parentNode, className)
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
            console.log("Response on "+url+" :", xhr)
//            console.log("Response text:", xhr.responseText)
            callback(xhr)
        }
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

Function.prototype.bind = function(scope) {
  var _function = this;
  
  return function() {
    return _function.apply(scope, arguments);
  }
}
