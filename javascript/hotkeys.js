document.addEventListener("keydown", function(evt){
    if (evt.altKey) {

        switch(evt.keyCode) {
            case 80: // Ctrl + P
                browser.postMessage({method:'togglePlaying'}); 
                break;

            case 75: // Ctrl + K
                browser.postMessage({method:'nextTrack'});
                break;

            case 74: // Ctrl + J
                browser.postMessage({method:'previousTrack'});
                break;

            default:
                break;
        }
    }
}, false)
