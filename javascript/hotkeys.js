if (!window.hotkey_initialized) {

    $(document).bind('keydown', function(evt) {
        if (evt.altKey) {
            switch(evt.keyCode) {
                case 221:  //]
                    chrome.extension.sendMessage({ method:'nextTrack' });
                    break;

                case 219: //[
                    chrome.extension.sendMessage({ method:'previousTrack' });
                    break;

                case 80: //P
                    chrome.extension.sendMessage({ method:'toggle' });
                    break;
            }
        }
    });

    window.hotkey_initialized = true;
}
