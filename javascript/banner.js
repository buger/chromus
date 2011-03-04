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


// Barners & Noble
bannerManager.addBanner({
    country: ["-RU", "-UA", "*"],
    html: '<a target="_blank" href="http://gan.doubleclick.net/gan_click?lid=41000000035057956&pubid=21000000000343434"><img src="http://gan.doubleclick.net/gan_impression?lid=41000000035057956&pubid=21000000000343434"/></a>'
})

bannerManager.addBanner({
    country: ["-RU","*"],
    html: '<a target="_blank" href="http://gan.doubleclick.net/gan_click?lid=41000000034500805&pubid=21000000000343434"><img src="http://gan.doubleclick.net/gan_impression?lid=41000000034500805&pubid=21000000000343434"/></a>'
})


// Cellhub
bannerManager.addBanner({
    country: ["-RU", "-UA", "*"],
    html: '<a target="_blank" href="http://gan.doubleclick.net/gan_click?lid=41000000035004521&pubid=21000000000343434"><img src="http://gan.doubleclick.net/gan_impression?lid=41000000035004521&pubid=21000000000343434"/></a>'
})

bannerManager.addBanner({
    country: ["US"],
    html: '<a target="_blank" href="http://gan.doubleclick.net/gan_click?lid=41000000034989899&pubid=21000000000343434"><img src="http://gan.doubleclick.net/gan_impression?lid=41000000034989899&pubid=21000000000343434"/></a>'
});

bannerManager.addBanner({
    country: ["US"],
    html: '<a target="_blank" href="http://gan.doubleclick.net/gan_impression?lid=41000000034989899&pubid=21000000000343434"><img src="http://gan.doubleclick.net/gan_impression?lid=41000000034931463&pubid=21000000000343434"/></a>'
});

bannerManager.addBanner({
    country: ["US"],
    html: '<a target="_blank" href="http://gan.doubleclick.net/gan_impression?lid=41000000034931463&pubid=21000000000343434"><img src="http://gan.doubleclick.net/gan_impression?lid=41000000034716287&pubid=21000000000343434"/></a>'
});

// 7digital
bannerManager.addBanner({
    country: ["UK", "DE"],
    html: "<a target='_blank' href='http://scripts.affiliatefuture.com/AFClick.asp?affiliateID=231381&merchantID=2473&programmeID=6574&mediaID=56425&tracking=&url=http://www.7digital.com/artists/the-kooks/konk-(2)/'><img border=0 src='http://banners.affiliatefuture.com/2473/56425.jpg'></a>"
});

bannerManager.addBanner({
    country: ["UK", "DE"],
    html: "<a target='_blank' href='http://scripts.affiliatefuture.com/AFClick.asp?affiliateID=231381&merchantID=2473&programmeID=6574&mediaID=46651&tracking=&url=http://www.7digital.com/artists/radiohead/'><img border=0 src='http://banners.affiliatefuture.com/2473/46651.jpg'></a>"
});
