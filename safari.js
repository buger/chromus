(function(){
    if (window.top === window) {  
        var listener; 
    
        function togglePopup() {
            var extension_id = safari.extension.baseURI.match(/safari-extension\:\/\/([^\/]*).*/)[1];
            var popup = document.getElementById(extension_id + '_popup');
        
            if (!popup) {
                if (!document.body) {
                    if (!listener) {
                        listener = setInterval(function() {
                            if (document.body && !document.getElementById(extension_id + '_popup')) {
                                togglePopup();
                                
                                clearInterval(listener);
                            }                            
                        }, 50);
                    }
                    
                    return;
                }
                
                clearInterval(listener);
                
                var style = document.createElement('style');
                style.innerHTML = ".ext_popup { position: fixed; top: 0px; left: 0px; z-index: 2147483646; border: 0; -webkit-box-shadow: 0px 0px 5px 5px #888; box-shadow: 0px 0px 5px 5px #888;}";
                document.body.insertBefore(style, document.body.firstChild);
                
                var iframe = document.createElement('iframe');   
                iframe.id = extension_id + "_popup";
                iframe.src = safari.extension.baseURI + "new_popup.html";
                iframe.width = 468;
                iframe.height = 600;
                iframe.scrolling = 'none';
                iframe.frameborder = '0';
                iframe.className = "ext_popup";
                iframe.setAttribute('allowtransparency', "true");
            
                document.body.insertBefore(iframe, document.body.firstChild);                        
                
                popup = document.getElementById(extension_id + '_popup');
                
                document.addEventListener('click', function () {
                    popup.style.display = 'none';
                });
            } else {                        
                if (popup.style.display == 'none') {
                    popup.style.display = 'block';
                } else {
                    popup.style.display = 'none';
                }
            }
        }
     
        function injectJS(script) {
            eval(script);        
        }

        function injectCSS(style) {
            var scr = document.createElement('style');
            scr.innerHTML = style;
            
            document.getElementsByTagName('head')[0].appendChild(scr)
        }

        safari.self.addEventListener("message", function (event) {    
            if (event.name == "_message") {
                if (event.message.method == "loadRecources") {
                    console.log("Loading recources:", event.message);
                
                    event.message.scripts.forEach(function(script) {
                        injectJS(script);
                    });
                                        
                    if (window.jQuery) {
                        window.jQuery.noConflict();
                    }

                    event.message.styles.forEach(function(style) {
                        injectCSS(style);
                    });
                }                           
            } else if (event.name == "toggle_popup") {
                console.log("Toggling popup");
                
                togglePopup();
            }
        }, false);
        
        window.addEventListener('DOMContentLoaded', function(){
            console.log("onLoad event");
            
            safari.self.tab.dispatchMessage("_message", {method:'loadRecources'});              
        }, false);
        
        window.addEventListener('unload', function(){
            safari.self.tab.dispatchMessage("disconnect", {method:'loadRecources'});
        }, false);
    }
})();