(function(){    
    Object.extend = function(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    };

    var background_page;
    var loaded_files = [];

    // Fix for jQuery
    var navigator = window.navigator;
    var location = window.location;
    
    var browser;
    var browser_params = {};

    function injectJS(script) {
        eval(script);

        if (!browser && window.browser) {
            browser = window.browser;

            Object.extend(window.browser, browser_params);
        }

        if (window.jQuery) {
            window.jQuery.noConflict();
        }
    }

    function injectCSS(style) {
        var scr = document.createElement('style');
        scr.innerHTML = "<![CDATA[\n"+style+"]]>";
        
        document.getElementsByTagName('head')[0].appendChild(scr)
    }



    var iframe = false;

    try {
        window.location.toString() + window.parent.location.toString();
    } catch (e) {
        iframe = true;
    }

    // Don't load scripts if inside iframe
    if (!iframe) {

        opera.postError('Script::Adding on load event');

        opera.extension.onmessage = function(event){
            if (typeof(event.data) == 'object') {
                switch(event.data.method) {
                    case 'updateState':                
                        break;

                    case 'connected':
                        if (event.data.source == 'background') {
                            background_page = event.source;
                            
                            window.addEventListener('load', function(){
                                background_page.postMessage({method:'loadRecources'});
                            }, false);

                            browser_params._isNetworkInitialized = true;
                            browser_params._background_page = background_page;
                            browser_params.extension_url = event.data.extension_url;
                            browser_params.config = event.data.config;

                            opera.postError("Injected script connected: " + JSON.stringify(browser_params));
                        }

                        break;

                    case 'loadRecources':
                        opera.postError("Loading scripts" + event.data.scripts.length);

                        event.data.scripts.forEach(function(script) {
                            injectJS(script);
                        });

                        event.data.styles.forEach(function(style) {
                            injectCSS(style);
                        });

                        break;

                    default: 
                        if (browser) {
                            opera.postError("Injected script::Received unknown message: " + JSON.stringify(event.data));
                        }
                }
            }
        }
    }

})();
