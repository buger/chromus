        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-16810054-3']);
        _gaq.push(['_trackPageview']);
        _gaq.push(['_trackEvent', 'pageLoad', 'popup']);

        if(BrowserDetect.OS != 'Mac' && BrowserDetect.OS != 'Linux'){        
          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = 'https://ssl.google-analytics.com/ga.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ga);
          })();
        }