document.addEventListener("keydown", function(evt){
    if(evt.altKey){
        console.log("Keydown")

        switch(evt.keyCode){
            case 80: // Ctrl + P
                port.postMessage({method:'togglePlaying'}); 
                break;
            case 75: // Ctrl + K
                port.postMessage({method:'nextTrack'});
                break;
            case 74: // Ctrl + J
                port.postMessage({method:'previousTrack'});
                break;
        }
    }
}, false)
