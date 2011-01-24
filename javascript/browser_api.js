if (window.opera) {
    window.console = {};
    
    function joinArgs(args) {
        var result = [], length = args.length;

        for (var i=0; i<length; i++) {
            if (args[i] != undefined) {
                if (typeof(args[i]) == 'object') {
                    try {
                        result.push(JSON.stringify(args[i]));
                    } catch(e) {
                        result.push(args[i].toString());
                    }
                } else {
                    result.push(args[i].toString());
                }
            }
        }
        
        return result.join(', ');
    }
    
    function getErrorObject(){
        try { throw Error('') } catch(err) { return err; }
    }

    function fn() { 
        var err = getErrorObject();
        var caller_line = err.stack.split("\n")[2].replace('@','\n');
        var index = caller_line.indexOf("at ");
        var clean = caller_line.slice(index+2, caller_line.length);

        opera.postError(joinArgs(arguments)+': ' + caller_line);         
    };

    ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 'group', 'groupEnd',
     'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'].forEach(function(name) {
        window.console[name] = fn;
    });
}


Array.prototype.unique = function () {
	var r = new Array();
	o:for(var i = 0, n = this.length; i < n; i++)
	{
		for(var x = 0, y = r.length; x < y; x++)
		{
			if(r[x]==this[i])
			{
				continue o;
			}
		}
		r[r.length] = this[i];
	}
	return r;
}


var browser = {
    isChrome: window.chrome != undefined,
    isOpera:  window.opera != undefined,
    isSafari: window.safari != undefined,

    _o_toolbarButton: null,

    toolbarItem: {        
        setText: function(text) {            
            if (browser.isChrome) {
                chrome.browserAction.setBadgeText({text: text});
            } else if (browser.isOpera && browser._o_toolbarButton) {
                browser._o_toolbarButton.badge.textContent = text;
            }
        },

        setTitle: function(title) {
            if (browser.isChrome) {
                chrome.browserAction.setTitle({title: title});
            } else if (browser.isOpera && browser._o_toolbarButton) {
                browser._o_toolbarButton.title = title;
            }
        },

        setIcon: function(icon){
        },

        setBackgroundColor: function(color) {
            if (browser.isChrome) {
                chrome.browserAction.setBadgeBackgroundColor({color: color}) //blue            
            } else if (browser.isOpera && browser._o_toolbarButton) {
                browser._o_toolbarButton.badge.backgroundColor = 'rgba('+color.join(',')+')';
            }
        }
    },
    

    isBackgroundPage: null,

    getPageType: function(){        
        var page_type;

        if (browser.isChrome) {
            page_type = chrome.extension.getBackgroundPage() == window ? 'background' : 'script';
        } else if (browser.isOpera) {
            if (opera.extension) {
                page_type = opera.extension.broadcastMessage ? 'background' : 'script';
            } else {
                page_type = 'injected';
            }
        }

        if (page_type == 'background') {
            browser.isBackgroundPage = true;

            console.log("Background page");
        }

        return page_type;        
    },    
    
    _isNetworkInitialized: false,
    _onReadyCallback: null,    

    onReady: function(callback) {
        if (callback) {
            browser._onReadyCallback = callback;
            
            console.log("Network initialized:", browser._isNetworkInitialized);

            if (browser._isNetworkInitialized) {
                browser._onReadyCallback();
            }
        } else {             
            browser._isNetworkInitialized = true;

            if (browser._onReadyCallback) {
                browser._onReadyCallback();
            }
        }
    },

    connected_ports: [],

    _background_page: null,

    //Call stack for Opera
    _listeners: [],

    addMessageListener: function(listener) {
        if (!listener) return;        

        if (browser.isChrome) {
            if (browser.isBackgroundPage) {
                chrome.extension.onConnect.addListener(function(port) {
                    console.log("Port connected:", port.name, port);

                    browser.connected_ports.push(port);

                    port.onMessage.addListener(function(message) {
                        listener(message, port);
                    });

                    port.onDisconnect.addListener(function() {
                        var index = browser.connected_ports.indexOf(port);

                        if (index != -1) {
                            browser.connected_ports.splice(index, 1);
                        }
                    });                
                });
            } else {
                if (browser.connected_ports.length == 0) {
                    var port = chrome.extension.connect();
                    browser.connected_ports.push(port);
                } else {
                    port = browser.connected_ports[0];
                }
                
                port.onMessage.addListener(function(message){
                    listener(message, port);
                });
            }
            
            browser.onReady();

        } else if (browser.isOpera) {
            browser._listeners.push(listener);

            // if background page
            if (browser.isBackgroundPage) {
                opera.extension.onconnect = function(event){
                    event.source.postMessage({
                        method: 'connected', 
                        source:'background', 
                        config: browser.config, 
                        extension_url: browser.extension_url
                    });

                    opera.postError("sent message to popup");
                }
                
                opera.extension.onmessage = function(event) {
    	            console.log("Background::Received message: ", JSON.stringify(event.data));
                     
                    if (typeof(event.data) == 'object' && event.data.method == 'loadRecources') {
                        var scripts = [], styles = [];
                        var content_scripts = browser.config.content_scripts;

                        content_scripts.forEach(function(script) {
                            var origin_matches = false;
                            script.matches.forEach(function(match) {
                                if (origin_matches) {
                                    return;
                                }

                                // Converting Chrome regexp to Javascript format:
                                //     http://*.last.fm/* -> ^http://.*\.last\.fm/.*
                                var rg = new RegExp('^'+match.replace(/\./, "\\.").replace('*','.*'));

                                if (rg.test(event.origin)) {
                                    origin_matches = true;
                                    
                                    console.log('Site: ', event.origin, ' matches following expression: ', match);
                                }                                
                            });
                            
                            if (origin_matches) {
                                if (script.js) {
                                    script.js.forEach(function(js) {
                                        scripts.push('/'+js);
                                    });                                            
                                }

                                if (script.css) {
                                    script.css.forEach(function(css) {
                                        styles.push('/'+css);
                                    });
                                }
                            }
                        });
 
                        var scripts = scripts.unique();
                        console.log('Loading scripts:', scripts);

                        for (var i=0; i<scripts.length; i++) {
                            scripts[i] = browser._files_cache[scripts[i]];                            
                        }

                        
                        var styles = styles.unique();
                        console.log('Loading styles:', styles);

                        for (var i=0; i<styles.length; i++) {
                            styles[i] = browser._files_cache[styles[i]];
                        }

                        event.source.postMessage({
                            method: 'loadRecources',
                            scripts: scripts,
                            styles: styles
                        });
                    } else {
                        browser._listeners.forEach(function(fn) {
                            fn(event.data, event.source);
                        });
                    }
                }
                
                browser.onReady();
            } else {
                opera.extension.onmessage = function(event) {                        
                    if (typeof(event.data) == 'object' && event.data.method == 'connected' && event.data.source == 'background') {
                        browser._background_page = event.source;
                        browser.config = event.data.config;
                        
                        browser.onReady();
                    } else {
                        browser._listeners.forEach(function(fn) {
                            fn(event.data, event.source);
                        });
                    }
                }
            }
        }
    },

    postMessage: function(message, dest) {
        if (dest) {
            dest.postMessage(message);
        } else {
            browser.broadcastMessage(message);
        }
    },

    broadcastMessage: function(message) {
        if (browser.isChrome) {
            var length = browser.connected_ports.length;

            for(var i=0; i<length; i++) {
                browser.connected_ports[i].postMessage(message);
            }
        } else if (browser.isOpera) {
            if (browser.isBackgroundPage) {
                opera.extension.broadcastMessage(message);
            } else {
                browser._background_page.postMessage(message);
            }
        }
    },

    _files_cache: [],

    _readLocalFile: function(file, callback){
        if (browser._files_cache[file]) {
            if (browser._files_cache[file] != 'loading' && callback) {
                callback(browser._files_cache[file]);
            }
            
            return;
        } else {
            browser._files_cache[file] = 'loading'
        }

        if (browser.isOpera) {
            browser.extension_url = "widget://" + document.location.host;
        } else if (browser.isChrome) {
            browser.extension_url = chrome.extension.getURL("/");
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', browser.extension_url + file, true);
        xhr.send(null);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4){
                browser._files_cache[file] = xhr.responseText;
                
                console.log("Caching file " + file);

                if (callback) {
                    callback(xhr.responseText);
                }
            }
        }
    },

    loadConfiguration: function(callback){
        browser._readLocalFile("/manifest.json", function(response){
            browser.config = JSON.parse(response);
            console.log("Browser configuration:", browser.config);

            callback.call();
        });
    },    

    // Used for Opera
    cacheMediaFiles: function(){
        var content_scripts = browser.config.content_scripts;

        for(var i=0; i<content_scripts.length; i++) {
            if (content_scripts[i].js) {
                for(var j=0; j<content_scripts[i].js.length; j++) {
                    browser._readLocalFile('/'+content_scripts[i].js[j]);
                }
            }
            
            if (content_scripts[i].css) {
                for(var c=0; c<content_scripts[i].css.length; c++) {                
                    browser._readLocalFile('/'+content_scripts[i].css[c]);
                }
            }
        }
    },
        
    initializePopup: function() {
        if (!browser.isOpera) return;
        
        if (browser.config.browser_action) {
            var ToolbarUIItemProperties = {
                disabled: false,
                title: browser.config.browser_action.default_title,
                icon: browser.config.browser_action.default_icon,
                popup: {
                    href: browser.config.browser_action.popup,
                    width: 470,
                    height: 600
                },

                badge: {
                    display: "block",
                    color: "white",
                    backgroundColor: "rgba(211, 0, 4, 1)"
                }
            };

            var theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
            opera.contexts.toolbar.addItem(theButton);

            browser._o_toolbarButton = theButton;
        }
    }
}

browser.getPageType();

if (browser.isBackgroundPage) {
    browser.loadConfiguration(function() {
        if (browser.isOpera) {
            browser.initializePopup();
            browser.cacheMediaFiles();
        }
    });
}

window.browser = browser;
