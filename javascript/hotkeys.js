if (!window.hotkey_initialized) {

    $(document).bind('keydown', function(evt) {
        if (evt.altKey) {
            switch(evt.keyCode) {
                case 221:  //]
                    chrome.extension.sendRequest({ method:'nextTrack' });
                    break;

                case 219: //[
                    chrome.extension.sendRequest({ method:'previousTrack' });
                    break;

                case 80: //P
                    chrome.extension.sendRequest({ method:'toggle' });
                    break;
            }
        }
    }, false);

    window.hotkey_initialized = true;
}
