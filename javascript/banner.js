(function(window){
    var bannerManager = {
        country: "EN",
        banners: [],
        flashInstalled: false
    }

    bannerManager.detectFlash = function() {
        if (navigator.plugins && navigator.plugins.length && navigator.plugins["Shockwave Flash"] ||
            navigator.mimeTypes && navigator.mimeTypes.length && navigator.mimeTypes['application/x-shockwave-flash']) {

            bannerManager.flashInstalled = true;
        }
    }
    bannerManager.detectFlash();

    bannerManager.guessCountry = function() {  
        var head = window.document.getElementsByTagName("head")[0];         
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'http://j.maxmind.com/app/geoip.js';

        script.onload = function() {            
            if (typeof(window.geoip_country_code) == "function") {
                bannerManager.country = geoip_country_code();
                bannerManager.city = geoip_city();
            } else {
                setTimeout(bannerManager.guessCountry, 1000);
            }
        }
        
        head.appendChild(script);
    }

    window.document.addEventListener('DOMContentLoaded', function(){
        bannerManager.guessCountry();    
    }, false);

    bannerManager.addBanner = function(banner) {
        this.banners.push(banner);
    }

    bannerManager.getBanner = function() {
        var banners = this.banners.filter(function(banner) {
            if (banner.country) {
                if (banner.country.indexOf("-"+bannerManager.country) === -1 && 
                   (banner.country.indexOf('*') !== -1 || banner.country.indexOf(bannerManager.country) !== -1))
                        return true;
            } else if (banner.lang) {
                if (banner.lang === window.navigator.language) {
                    return true;
                }
            }
        });

        if (banners.length > 0) {
            var banner = banners[Math.floor(Math.random()*banners.length)];

            return banner.flash && bannerManager.flashInstalled ? banner.flash : banner.html;
        }
    }
    
    window.bannerManager = bannerManager;
}(window))

/*
// Fotocash
bannerManager.addBanner({
    country: ["RU","UA"],
    flash: '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="468;" height="60;"><param name="movie" value="http://widgets.fotocash.ru/211209/468x60_1.swf" ></param><param name="flashvars" value="link1=http://start.fotostrana.ru/partners/pet_mario/%3fref_id%3d268618028"></param><param name="wmode" value="transparent"></param><param name="allowScriptAccess" value="never"><embed src="http://widgets.fotocash.ru/211209/468x60_1.swf" flashvars="link1=http://start.fotostrana.ru/partners/pet_mario/%3fref_id%3d268618028" type="application/x-shockwave-flash" wmode="transparent"  width="468px;" height="60px;" AllowScriptAccess="never" ></embed></object>',

    html: '<a href="http://fotostrana.ru/start/getpet/?ref_id=268618028" _fcksavedurl="http://fotostrana.ru/start/getpet/?ref_id=268618028"><img border="0" src="http://widgets.fotocash.ru/banners/static/468x60-1.gif" alt="Заведи прикольного питомца онлайн !"></a>'
});

// sendflowers.ru
bannerManager.addBanner({
    country: ["RU", "UA"],

    html: 'var rand_nm = Math.round(Math.random() * 1000000); document.write(\'<script language="javascript" type="text/javascript" src="http://adv.directad.ru/?p=7602&n=222281581&r=\' + rand_nm + \'&f=468x60"><\/script>\');'
})

// Flowers 
bannerManager.addBanner({
    country: ["-RU", "-UA", "*"],
    html: '<a target="_blank" href="http://gan.doubleclick.net/gan_click?lid=41000000034985268&pubid=21000000000343434"><img src="http://gan.doubleclick.net/gan_impression?lid=41000000034985268&pubid=21000000000343434"/></a>'
})

bannerManager.addBanner({
    country: ["-RU", "-UA", "*"],
    html: '<a target="_blank" href="http://gan.doubleclick.net/gan_click?lid=41000000028436803&pubid=21000000000343434"><img src="http://gan.doubleclick.net/gan_impression?lid=41000000028436803&pubid=21000000000343434"/></a>'
})




// 7digital
bannerManager.addBanner({
    country: ["UK", "DE"],
    html: "<a target='_blank' href='http://scripts.affiliatefuture.com/AFClick.asp?affiliateID=231381&merchantID=2473&programmeID=6574&mediaID=56425&tracking=&url=http://www.7digital.com/artists/the-kooks/konk-(2)/'><img border=0 src='http://banners.affiliatefuture.com/2473/56425.jpg'></a>"
});

bannerManager.addBanner({
    country: ["UK", "DE"],
    html: "<a target='_blank' href='http://scripts.affiliatefuture.com/AFClick.asp?affiliateID=231381&merchantID=2473&programmeID=6574&mediaID=46651&tracking=&url=http://www.7digital.com/artists/radiohead/'><img border=0 src='http://banners.affiliatefuture.com/2473/46651.jpg'></a>"
});

/*
bannerManager.addBanner({
    country: ["RU"],
    html: "var RndNum4NoCash = Math.round(Math.random() * 1000000000); var ar_Tail='unknown';"+
          "if (document.referrer) ar_Tail = escape(document.referrer);"+
          "document.write("+
          "'<iframe src=\"http://ad.adriver.ru/cgi-bin/erle.cgi?sid=171169&bn=0&target=blank&bt=1&pz=0&tail256='"+
          " + ar_Tail + '&rnd=' + RndNum4NoCash +" +
          "'\" frameborder=0 vspace=0 hspace=0 width=468 height=60"+
          " marginwidth=0 marginheight=0 scrolling=no></iframe>');"
});
*/

bannerManager.addBanner({
    country: ["*"],
    html: 'document.write(\'<div id="bsap_1254329" class="bsarocks bsap_0e440463f3a541a54a8e6c18177114d6"></div>\');'
});
