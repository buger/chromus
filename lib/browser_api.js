(function(window){
    window.debug = true;
    
    if (window.browser && window.browser.isChrome) {
        window.browser.removeListeners();
        delete window.browser;
    }

    function joinArgs(args) {
        var result = [], length = args.length, i;

        for (i = 0; i < length; i++) {
            if (args[i] !== undefined) {
                if (typeof (args[i]) === 'object') {
                    try {
                        result.push(JSON.stringify(args[i]));
                    } catch (e) {
                        result.push(args[i].toString());
                    }
                } else {
                    result.push(args[i].toString());
                }
            }
        }
        
        return result.join(', ');
    }

    if (window.opera) {
        window.console = {};
        
        function getErrorObject() {
            try { throw new Error(''); } catch (err) { return err; }
        }

        function fn() { 
            var err = getErrorObject();
            var caller_line = err.stack.split("\n")[2].replace('@', '\n');
            var index = caller_line.indexOf("at ");        

            opera.postError(joinArgs(arguments)+': ' + caller_line);         
        };

        ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 'group', 'groupEnd',
         'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'].forEach(function(name) {
            window.console[name] = fn;
        });
    }

    if (!window.debug) {
        window.console.log = function(){}
        window.console.warn = function(){}
        window.console.error = function(){}
    }



    Array.prototype.unique = function() {
        var r = new Array(), i, x;    
        o:for (i = 0, n = this.length; i < n; i++) {
            for(x = 0, y = r.length; x < y; x++) {
                if(r[x]==this[i])
                {
                    continue o;
                }
            }
            
            r[r.length] = this[i];
        }
        return r;
    }

    function extend(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    var FFStore = {
        synced:false,

        data: {},
       
        sync: function() {
            browser.broadcastMessage({ _api: true, method: 'updateStorage', data: FFStore.data },
                function(msg) {
                    extend(FFStore.data, msg.response);

                    FFStore.synced = true;
                    
                    console.log('Synced!', FFStore.data);
                }
            )
        },

        set: function(key, value) {
            FFStore.data[key] = value;

            FFStore.sync();
        },

        get: function(key) {
            console.log("Getting key", key);
            return FFStore.data[key];
        },

        remove: function(key) {
            FFStore.data[key] = null;

            FFStore.sync();
        }
    }

    var browser = {
        isPokki: typeof(window.pokki) === "object",
        isFrame: !!window.location.protocol.match(/^http/),
        isChrome: typeof(window.chrome) === "object" && window.chrome.extension,
        isOpera:  typeof(window.opera) === "object",
        isSafari: typeof(window.safari) === "object",
        isFirefox: navigator.userAgent.match('Firefox') != undefined,

        isPlatform: function(operationSystem){
            return navigator.userAgent.toLowerCase().indexOf(operationSystem) > -1;
        },


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

            setIcon: function(options){
                if (browser.isChrome) {
                    chrome.browserAction.setIcon(options);
                } else {
                    browser.postMessage({ method: "setIcon", _api: true, imageData: options.imageData });
                }
            },

            setBackgroundColor: function(color) {
                if (browser.isChrome) {
                    chrome.browserAction.setBadgeBackgroundColor({color: color}) //blue            
                } else if (browser.isOpera && browser._o_toolbarButton) {
                    browser._o_toolbarButton.badge.backgroundColor = 'rgba('+color.join(',')+')';
                }
            }
        },

        tabs: {
            create: function(options, callback) {
                if (browser.isChrome) {
                    chrome.tabs.create(options);                    
                } else if (browser.isSafari) {
                    var tab = safari.application.activeBrowserWindow.openTab();
                    tab.url = options.url;
                } else if (browser.isFirefox) {
                    browser.postMessage({ method: "createTab", _api: true, url: options.url }, null, function(msg){
                        if (callback)
                            callback(msg.response);
                    })                    
                }
            },

            getSelected: function(windowID, callback) {
                if (browser.isChrome) {
                    chrome.tabs.getSelected(windowID, callback);
                } else if (browser.isSafari) {
                    callback(safari.application.activeBrowserWindow.activeTab)
                } else if (browser.isFirefox) {
                    browser.postMessage({ method: "activeTab", _api: true }, null, function(msg){
                        callback(msg.response);
                    })
                }
            },

            postMessage: function(tab, message) {               
                browser.postMessage(message, tab);
            },

            captureVisibleTab: function(windowID, options, callback) {
                if (browser.isChrome) {
                    chrome.tabs.captureVisibleTab(windowID, options, callback);
                } else if (browser.isSafari) {
                    callback(safari.application.activeBrowserWindow.activeTab.visibleContentsAsDataURL());
                } else if (browser.isFirefox) {
                    browser.postMessage({ _api:true, method: "captureVisibleTab" }, null, function(msg) {
                        callback(msg.response);
                    });
                }
            }
        },     

        contextMenus: {
            create: function(options) {
                if (browser.isChrome) {
                    chrome.contextMenus.create(options)
                } else if (browser.isFirefox) {
                    browser.postMessage({ _api:true, method: "createContextMenus", event_listener: true, options: options }, null, function(msg) {
                        console.log('calling on click');
                        if (options.onclick)
                            options.onclick(msg.response);
                    });
                }
            }
        },

        _base_url: ".",

        extension: {
            getURL: function(url) {
                if (!url) {
                    url = "/";
                }

                if (url[0] != "/") { 
                    url = "/" + url;
                }

                if (browser.isChrome)
                    return chrome.extension.getURL(url)
                else if (browser.isSafari)
                    return safari.extension.baseURI.slice(0, -1)
                else if (browser.isOpera) 
                    return "widget://" + document.location.host + url
                else if (browser.isFrame || browser.isPokki)
                    return browser._base_url + url;
            }
        },

        isBackgroundPage: null,
        page_type: null,

        getPageType: function(){
            browser.page_type = browser.page_type || window.override_page_type;

            if (browser.page_type)
                return browser.page_type;

            if (browser.isChrome) {
                try {
                    browser.page_type = chrome.extension.getBackgroundPage() == window ? 'background' : 'popup';
                } catch(e) {
                    page_type = 'popup';
                }
            } else if (browser.isOpera) {
                browser.page_type = opera.extension.broadcastMessage ? 'background' : 
                                    window.isContentScript ? 'injected' : 
                                    'popup';
            } else if (browser.isSafari) {
                browser.page_type = safari.extension.globalPage ? 'background' : 'script';
            } else if (browser.isFrame) {                
                browser.page_type = window.parent === window ? 'popup' : 'background';                
            } else if (browser.isPokki) {
                browser.page_type = window.location.toString().match('popup.html') ? 'popup' : 'background'
            }

            if (browser.page_type == 'background') {
                browser.isBackgroundPage = true;

                console.log("Background page", window.location.toString());
            }

            return browser.page_type;        
        },    
        
        _isNetworkInitialized: false,
        _onReadyCallback: null,    

        onReady: function(callback) {
            if (callback) {
                browser._onReadyCallback = callback;
                
                console.log("Network initialized:", browser._isNetworkInitialized);

                if (browser._isNetworkInitialized) {
                    console.log("Calling onReady callback", browser._isNetworkInitialized);

                    if (!browser.isFirefox || FFStore.synced) {
                        browser._onReadyCallback();
                    } else {
                        setTimeout(function() {
                            browser.onReady();
                        }, 50);
                    }
                }
            } else {             
                browser._isNetworkInitialized = true;                
                if (browser._onReadyCallback) {
                    console.log("Calling onReady callback", browser._isNetworkInitialized);
                    
                    if (!browser.isFirefox || FFStore.synced) {

                        console.log('')
                        browser._onReadyCallback();
                    } else {
                        setTimeout(function() {
                            browser.onReady();
                        }, 50);
                    }
                }
            }
        },
        
        getRecourcesForPage: function(url) {
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

                    if (rg.test(url)) {
                        origin_matches = true;
                        
                        console.log('Site: ', url, ' matches following expression: ', match);
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

            for (var i=0; i<scripts.length; i++) {
                scripts[i] = browser._files_cache[scripts[i]];                            
            }

            
            var styles = styles.unique();

            for (var i=0; i<styles.length; i++) {
                styles[i] = browser._files_cache[styles[i]];
            }    
            
            return { styles: styles, scripts: scripts };
        },

        connected_ports: [],

        addMessageListener: function(listener) {
            if (!listener) return;

            if (browser.isFrame) {
                browser._frame_addMessageListener(listener);
            } else if (browser.isPokki) {
                browser._pokki_addMessageListener(listener);
            } else if (browser.isChrome) {
                browser._c_addMessageListener(listener);
            } else if (browser.isOpera) {
                browser._o_addMessageListener(listener);    
            } else if (browser.isSafari) {
                browser._s_addMessageListener(listener);
            } else if (browser.isFirefox) {
                browser._ff_addMessageListener(listener);
            }
        },
        
        // TODO
        removeListeners: function(){
            if (browser.isChrome) {
                browser._c_removeMessageListeners();
            } else if (browser.isOpera) {
            } else if (browser.isSafari) {
            } else if (browser.isFirefox) {
            }                         
        },

        _receiveMessage: function(msg) {
            if (msg[0] === "{")
                msg = JSON.parse(msg)

            for (var i=0; i<browser._listeners.length; i++) {
                browser._listeners[i](msg);
            }
        },

        _pokki_addMessageListener: function(listener) {            
            browser._listeners.push(listener);

            if (browser.page_type === 'popup') {
                if (!browser._background_page_listener) {
                    var poll = function() {                        
                        console.warn("POLLING")
                        if (pokki.rpc('browser._isNetworkInitialized') === true) {
                            clearInterval(browser._background_page_listener);
                            browser.onReady();
                        }
                    }
                    
                    browser._background_page_listener = setInterval(poll, 50);
                }
            } else {
                browser.onReady();
            }
        },


        _frame_addMessageListener: function(listener) {
            if (!browser._bg_page && browser.page_type == 'popup') {
                console.log('adding listener', window.location);

                browser._bg_page = document.createElement('iframe');
                browser._bg_page.src = "background.html?" + (+new Date());
                document.body.appendChild(browser._bg_page);
                browser._bg_page.style.display = 'none';
                
                browser._bg_page.onload = function(){
                    console.log('loaded');
                    
                    browser.onReady();
                }
            } else if (browser.page_type == 'background') {
                if (!browser._isNetworkInitialized)
                    browser.onReady();
            }

            browser._listeners.push(listener);

            if (window.messageListener) return false;

            console.log('Adding message listener', browser.page_type, window.location.toString())
            
            window.addEventListener("message", function(evt){
                if (!evt.data) return;
                
                msg = JSON.parse(evt.data);
                
                for (var i=0; i<browser._listeners.length; i++) {
                    browser._listeners[i](msg);
                }
            }, false);

            window.messageListener = true;
        },

        //Call stack for Opera, Chrome and Safari 
        _listeners: [],

        _c_addMessageListener: function(listener) {
            chrome.extension.onRequest.addListener(listener);
            
            if (!browser._isNetworkInitialized) {
                browser.onReady();
            }
        },

        _c_removeMessageListeners: function() {
            console.log("Removing listeners:", this._listeners.length);

            for (var i=0; i<this._listener.length; i++) {
                chrome.extension.onRequest.removeListener(this._listeners[i]);
            }
        },

        _listener_initialized: false,
        
        _ff_message_in: null,
        _ff_message_out: null,

        _ff_addMessageListener: function(listener) {
            browser._listeners.push(listener);
            
            if (browser._listener_initialized) {
                return;
            } else {
                browser._listener_initialized = true;
            }
                        
            function waitForDispatcher() {
                browser._ff_message_bridge = document.getElementById('ff_message_bridge');

                if (!browser._ff_message_bridge) {
                     var el = document.createElement('div');
                     el.id = 'ff_message_bridge';
                     el.style.display = 'none';
                     document.body.appendChild(el);
                    
                     browser._ff_message_bridge = el;
                }

                if (document.body.className.match(/background/)) {
                    browser.page_type = "background";
                    browser.isBackgroundPage = true;

                    console.log("I Am background page!");
                } else if (document.body.className.match(/popup/)) {
                    browser.page_type = "popup";

                    document.addEventListener('click', function(evt) {
                        if (evt.target.nodeName == 'A' && evt.target.target == "_blank") {
                            if (evt && evt.preventDefault)
                                evt.preventDefault();

                            evt.stopPropagation();
                            evt.returnValue = false;

                            browser.tabs.create({ url:evt.target.href });

                            return false;
                        }
                    }, false);
                }
                
                FFStore.sync();

                setInterval(function(){
                    var messages = browser._ff_message_bridge.querySelectorAll('.to_page');    
                    var length = messages.length;

                    if (length > 0) {
                        for(var i=0; i<length; i++) {
                            var msg = messages[i].innerHTML;                            
                            msg = msg[0] == '{' ? JSON.parse(msg) : msg;
                            browser._ff_message_bridge.removeChild(messages[i]);

                            browser._listeners.forEach(function(fn) {
                                fn(msg, browser);                
                            })
                        }
                    }
                }, 50);

                browser.onReady();

                console.log("Document:", document.body.className, browser.page_type);
        
                if (browser.page_type == "popup") {
                    
                    var l = function (evt) {
                        if (browser._width  === document.body.offsetWidth &&
                            browser._height === document.body.offsetHeight)
                            return setTimeout(l, 500);

                        browser.resizePopup();
                        
                        setTimeout(l, 500);
                    }

                    l();    
                }
            };

            waitForDispatcher();            
        },

        resizePopup: function() {                        
            browser._width = document.body.offsetWidth;
            browser._height = document.body.offsetHeight;

            browser.postMessage({
                _api: true,
                method: 'popupResize', 
                width: browser._width,
                height: browser._height
            });            
        },
        
        _s_addMessageListener: function(listener) {
            browser._listeners.push(listener);
            
            if (browser._listener_initialized) {
                return;
            } else {
                browser._listener_initialized = true;
            }
            
            if (browser.isBackgroundPage) {               
                safari.application.addEventListener("message", function(event) {
                    var sender = event.target.page ? event.target.page : event.target.tab;
                                        
                    if (event.name == "_message") {
                        console.log("Received message", event, browser.isBackgroundPage);
                        
                        if (event.message.method == "loadRecources") {
                            var recources = browser.getRecourcesForPage(event.target.url);                        
                            
                            sender.dispatchMessage("_message", {
                                method: 'loadRecources',
                                scripts: recources.scripts,
                                styles: recources.styles
                            });                    
                        } else {
                            browser._listeners.forEach(function(fn) {
                                fn(event.message, sender);                
                            });                 
                        }
                    } else if (event.name == "connect") {
                        console.log("Script connected to background page: ", event.target);
                        
                        browser.connected_ports.push(event.target.page ? event.target.page : event.target.tab);
                        
                        sender.dispatchMessage("connected");
                    }                
                }, false);                       
                
                safari.application.addEventListener("command", function(event) {
                    console.log("Received command", event);
                    
                    if (event.command == "toggle_popup") {
                        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("toggle_popup", {popup_url: browser.config.browser_action.popup});
                    }
                }, false);                        
                
                browser.onReady();
            } else {
                safari.self.addEventListener("message", function(event) {
                    if (event.name == "_message") {
                        browser._listeners.forEach(function(fn) {
                            fn(event.message, event.source);
                        }); 
                    } else if (event.name == "connected") {   
                        console.log("Connected to background page");
                        
                        browser.onReady();                                
                    }                
                }, false);                
                
                // In page is iframe (safair popup emulation), don't initialize it two times
                if (window.top == window) {            
                    browser.connected_ports.push(safari.self.tab);
                    safari.self.tab.dispatchMessage("connect");
                } else {
                    browser.onReady();
                    
                    var listener = function () {
                        window.top.postMessage({
                            method: 'popup_resize', 
                            width: document.body.offsetWidth,
                            height: document.body.offsetHeight
                        }, '*');
                    }
                                        
                    document.addEventListener('DOMNodeInserted', listener, false);
                    document.addEventListener('DOMNodeRemoved', listener, false);
                }
            }		
        },

        _background_page: null,	
        
        _o_addMessageListener: function(listener) {
            browser._listeners.push(listener);
            
            if (browser._listener_initialized) {
                return;
            } else {
                browser._listener_initialized = true;
            }
            
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
                        var recources = browser.getRecourcesForPage(event.origin);

                        console.log("Recources:", recources);

                        event.source.postMessage({
                            method: 'loadRecources',
                            scripts: recources.scripts,
                            styles: recources.styles
                        });
                    } else if (typeof(event.data) == 'object' && event.data.method == 'popupSize') {
                        if (browser._o_toolbarButton) {
                            browser._o_toolbarButton.popup.height = event.data.height;
                            browser._o_toolbarButton.popup.width = event.data.width;
                        }
                    } else {
                        browser._listeners.forEach(function(fn) {
                            fn(event.data, event.source);
                        });
                    }
                }
                
                browser.onReady();
            } else {
                opera.extension.onmessage = function(event) {                        
                    console.log("Script::Received message: ", JSON.stringify(event.data));
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
                if (browser.getPageType() === "popup") {
                    function listener() {
                        if (document.body.previousClientHeight !== document.body.clientHeight ||
                            document.body.previousClientWidth  !== document.body.clientWidth) {
                            browser.postMessage({ method: 'popupSize', width: document.body.clientWidth, height: document.body.clientHeight });

                            document.body.previousClientHeight = document.body.clientHeight;
                            document.body.previousClientWidth = document.body.clientWidth;
                        }
                    }
                    
                    document.addEventListener('DOMNodeInserted', listener, false);
                    document.addEventListener('DOMNodeRemoved', listener, false);
                }
            }	
        },

        postMessage: function(message, dest, callback) {
            if (dest && !browser.isFirefox && !browser.isFrame && !browser.isPokki) {
                message.__id = new Date().getTime();

                console.log("Posting message ", message, " to ", dest);
            
                if (browser.isSafari) {
                    dest.dispatchMessage("_method", message) 
                } else {
                    if (browser.isBackgroundPage) {
                        chrome.tabs.sendRequest(dest.id, message, callback);
                    } else {
                        chrome.extension.sendRequest(message, callback);
                    }
                }
            } else {
                browser.broadcastMessage(message, callback);
            }
        },

        broadcastMessage: function(message, callback) {            
            message.__id = new Date().getTime();

            if (browser.isPokki) {
                pokki.rpcArgs('browser._receiveMessage', JSON.stringify(message));
                
                if (!callback) return;

                var l = function(_msg, _sender) {
                    if (_msg.__id === message.__id) {
                        callback(_msg, _sender);

                        if (!message.event_listener) {  
                            var idx = browser._listeners.indexOf(l);      
                            browser._listeners.splice(idx, 1);
                        }
                    }
                }      
                
                browser.addMessageListener(l);

            } else if (browser.isChrome) {
                if (browser.isBackgroundPage) {
                    chrome.windows.getAll(null, function(wins) {
                        for (var j = 0; j < wins.length; ++j) {
                            chrome.tabs.getAllInWindow(wins[j].id, function(tabs) {
                                for (var i = 0; i < tabs.length; ++i) {
                                    chrome.tabs.sendRequest(tabs[i].id, message, callback);
                                }
                            });
                        }
                    });

                    chrome.extension.sendRequest(message, callback);
                } else {
                    chrome.extension.sendRequest(message, callback);
                }

            } else if (browser.isOpera) {
                if (browser.isBackgroundPage) {
                    opera.extension.broadcastMessage(message);
                } else {
                    browser._background_page.postMessage(message);
                }
            } else if (browser.isSafari) {
                if (browser.isBackgroundPage) {
                    var length = browser.connected_ports.length;

                    for(var i=0; i<length; i++) {
                        browser.connected_ports[i].dispatchMessage("_message", message);
                    }                
                } else {
                    safari.self.tab.dispatchMessage("_message", message);
                }
            } else if (browser.isFirefox) {
                if (!browser._ff_message_bridge)
                    return setTimeout(function(){ browser.broadcastMessage(message, callback) }, 50);
                
                if (callback) {
                    if (!message.event_listener)
                        message.reply = true;

                    var l = function(_msg, _sender) {
                        if (_msg.__id === message.__id) {
                            callback(_msg, _sender);

                            if (!message.event_listener) {
                                console.log("Deleting message listener:", _msg);
                                var idx = browser._listeners.indexOf(l);                            
                                browser._listeners.splice(idx, 1);
                            }
                        }
                    }              
                    
                    browser.addMessageListener(l);
                }

                var _m = document.createElement('textarea');
                _m.className = 'from_page';
                _m.innerHTML = typeof(message) == "string" ? message : JSON.stringify(message);
                browser._ff_message_bridge.appendChild(_m);                                
            } else if (browser.isFrame) {
                if (browser.page_type === "popup") {
                    console.log('sending message to bg', JSON.stringify(message));
                    browser._bg_page.contentWindow.postMessage(JSON.stringify(message), "*");
                } else {
                    if (window.parent) {
                        console.log('sending message popup', message);
                        window.parent.postMessage(JSON.stringify(message), "*");
                    }
                }

                if (callback) {
                    if (!message.event_listener)
                        message.reply = true;

                    var l = function(_msg, _sender) {
                        if (_msg.__id === message.__id) {
                            callback(_msg, _sender);

                            if (!message.event_listener) {
                                console.log("Deleting message listener:", _msg);
                                var idx = browser._listeners.indexOf(l);                            
                                browser._listeners.splice(idx, 1);
                            }
                        }
                    }              
                    
                    browser.addMessageListener(l);
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

            var xhr = new XMLHttpRequest();
            xhr.open('GET', browser.extension.getURL(file), true);
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

        // Used for Opera and Safari
        _cacheMediaFiles: function(){
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
            
        _initializePopup: function() {
            if (!browser.isOpera) return;
            
            if (browser.config.browser_action) {
                var ToolbarUIItemProperties = {
                    disabled: false,
                    title: browser.config.browser_action.default_title,
                    icon: browser.config.browser_action.default_icon,
                    popup: {
                        href: browser.config.browser_action.popup,
                        height: 100
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
        setTimeout(function() {
            browser.loadConfiguration(function() {
                if (browser.isOpera) {
                    browser._initializePopup();
                    browser._cacheMediaFiles();
                } else if (browser.isSafari) {
                    browser._cacheMediaFiles();
                }
            });
        }, 100);
    }

    document.getElementsByTagName('html')[0].className += " " + (function(){         
        return browser.isChrome ? "chrome" :
               browser.isSafari ? "safari" :
               browser.isOpera ? "opera" :
               "";
    }())
    
    window.browser = browser;

    
    var FakeXMLHttpRequest = function() {
        this.requestHeaders = {};
        this.binary = false;
        this.status = 0,
        this.readyState = 1,

        this.open = function(method, url, async) {
            this.method = method;
            this.url = url;
            this.async = async;
        }

        this.send = function(data) {
            var self = this;

            browser.postMessage({ 
                method: '_ajax',

                _api: true,

                httpOptions: {
                    method: this.method,
                    url: this.url,
                    async: this.async,
                    binary: this.binary,
                    headers: this.requestHeaders,
                    mime_type: this.mime_type,
                    data: data
                }
            }, null, 
                function(resp) {
                    resp = resp.response;

                    console.log("Ajax response", resp.response);

                    self.readyState = 4;
                    self.responseText = resp.responseText;
                    self.responseHeaders = resp.responseHeaders;
                    self.status = resp.status;

                    if (self.onreadystatechange) {
                        self.onreadystatechange();
                    }
                }
            );
        }

        this.sendAsBinary = function(data) {
            this.binary = true;

            this.send(data);
        }
        
        this.overrideMimeType = function(mime_type) {
            this.mime_type = mime_type;
        }

        this.abort = function() {                   
        }

        this.setRequestHeader = function(header, value) {
            this.requestHeaders[header] = value;
        }
        
        this.getResponseHeader = function(header) {
            return this.responseHeaders[header];            
        }

        this.getAllResponseHeaders = function() {
            var headers = '';

            for (key in this.responseHeaders) {
                headers += key + ': ' + this.responseHeaders[key] + "\n";
            }

            return headers;
        }
    }

    
    window.FFStore = FFStore;

    if (browser.isFirefox) {
        window.store = FFStore;    

        if (!browser.isBackgroundPage) {
            window.XMLHttpRequest = FakeXMLHttpRequest;
        }        
    }


    if (browser.isFirefox) {
        document.body.className += " firefox";
    }

    // Needed for proper initialization
    browser.addMessageListener(function(){});
}(window));                    
