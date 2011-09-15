var _gaq = _gaq || [];

/**
    VK

    Module for working with vk.com
**/
var VK = {
    determineSearchMethod: function(callback){        
        console.log("Trying to determine search method")

        xhrRequest("http://vkontakte.ru", "GET", null, function(xhr){
            console.log(xhr.responseText.match(/logout/));
            
            if(!xhr.responseText.match(/logout/)){
                xhrRequest("http://vk.com", "GET", null, function(xhr_vk){
                    if(!xhr_vk.responseText.match(/logout/)) {
                        callback({search_method:'test_mode'})
                    } else {
                        callback({search_method:'vk.com'})
                    }
                })
            } else {
                callback({search_method:'vkontakte.ru'})
            }
        })
    },

    /**
        VK.#_rawSearch(artist, song, callback)

        Searching by parsing page. Callback function must return hash with url.        
    **/
    _rawSearch: function(artist, song, duration, callback){    
        var track = artist + " " + song

        var url  = "http://"+VK.search_method+"/al_search.php"
        var data = "c%5Bq%5D="+encodeURIComponent(track)+"&al=1&c%5Bsection%5D=audio&c%5Bsort%5D=2"

        xhrRequest(url, "POST", data, function(xhr){

            // User logged off from vkontakte
            if(xhr.responseText.match(/progress\.gif/)){
                delete VK.search_method

                VK.search(artist, song, duration, callback)

                return
            }

            var container = document.getElementById('vk_search');
            container.innerHTML = xhr.responseText.substring( xhr.responseText.indexOf("<div class=\"audios_row clear_fix\">")); 

            var audio_data = []
            var audio_rows = container.querySelectorAll('div.audio') 

            for(var i=0; i<audio_rows.length; i++){
                if(i>10) break

                var url_data = audio_rows[i].querySelector('input[type=hidden]').value.split(',');
                var url = url_data[0];
                var duration = url_data[1];
                
                var title = audio_rows[i].querySelector('td.info span');
                title.removeChild(title.lastChild);

                audio_data.push({
                  artist: audio_rows[i].querySelector('td.info a').innerHTML,
                  title: title.textContent.trim(),
                  duration: duration,
                  url: url
                })
            }

            console.log("Tracks:", audio_data);

            if(audio_data.length > 0){                    
                var vk_track

                for(var i=0;i<audio_data.length; i++){
                    console.log(audio_data[i], Math.abs(parseInt(audio_data[i].duration) - duration))

                    if(audio_data[i].artist.toLowerCase() == artist && audio_data[i].title.toLowerCase() == song){
                        if(!duration || Math.abs(parseInt(audio_data[i].duration) - duration) <= 2){
                            vk_track = audio_data[i]
                            break
                        }
                    } else if(!audio_data[i].title.toLowerCase().match(/(remix|mix)/) &&
                               audio_data[i].artist.toLowerCase() == artist &&
                               audio_data[i].title.toLowerCase() == song){
                        vk_track = audio_data[i]
                    }
                }

                if(!vk_track)
                    vk_track = audio_data[0]

                //Caching for 3 hours
                CACHE.set(track, vk_track, 1000*60*60*2)                                

                callback(vk_track)
            } else {
                callback({error:'not_found'})
            }
        })

        return false
    },

    /**
        VK#_testmodeSearch(artist, song, callback)

        Searching vkontakte with api in test_mode
    **/
    _testmodeSearch: function(artist, song, duration, callback){
        var track = artist + " " + song;

        var url = "http://api.vk.com/api.php";

        xhrRequest("http://chromusapp.appspot.com/sign_data", "POST", "track="+encodeURIComponent(track), function(data){ 
            data = JSON.parse(data.responseText);

            var params = 'api_id='+data.api_key+'&method=audio.search&format=json&sig='+data.signed_data+'&sort=2&test_mode=1&count=10&q='+encodeURIComponent(track);

            xhrRequest(url, "GET", params, function(xhr){
                // Too many requests and now we banned for some time
                if(xhr.responseText.match(/\:false/)){
                    // Checking if user logged into vkontakte
                    VK.determineSearchMethod(function(response){
                        if(response.search_method == "test_mode"){
                            callback({error:'overload'})
                        } else {
                            VK.search_method = response.search_method
                            VK.search(artist, song, duration, callback)
                        }
                    })

                    return
                }

                var response_text = xhr.responseText.replace(/\u001D/g,'').replaceEntities()
                
                var results = JSON.parse(response_text);

                console.log(results)
             
                if(results.response){
                    var vk_track

                    if(results.response[1]){                                
                        for(var i=1; i<results.response.length; i++){
                            var audio = results.response[i].audio

                            console.log(audio)

                            if(audio.artist.toLowerCase() == artist && audio.title.toLowerCase() == song){
                                if(!duration || Math.abs((parseInt(audio.duration) - duration) <= 2)){
                                    vk_track = audio
                                    
                                    break
                                }
                            } else if(!audio.title.toLowerCase().match(/(remix|mix)/) && audio.artist.toLowerCase() == artist){
                                vk_track = audio
                            }
                        }
                        console.log("Selected track:", vk_track)
                        
                        if(!vk_track)
                            vk_track = results.response[1].audio
                    }
                     
                    if(vk_track){
                        vk_track.duration = parseInt(vk_track.duration)

                        //Caching for 3 hours
                        CACHE.set(track, vk_track, 1000*60*60*3)
                        
                        callback(vk_track)
                    } else {
                        callback({error:'not_found'})
                    }
                } else {            
                    if(results.error)
                        callback({error:results.error})
                    else{                    
                        console.error("ERROR!:", results)
                        callback({error:'Unknown error while searching track'})
                    }
                }
            }); // Search
        }); // Sign data
    },


    /**
        VK#search(artist, song, callback)
        - artist (String): Artist
        - song (String): Song
        - callback (Function): Function to be called when search compete, to obtain results. 
    **/    
    search: function(artist, song, duration, callback){
        console.log("Seaching:", artist, " - ", song)
        console.log("Search method:", this.search_method)    

        if(this.search_method == undefined){
            this.determineSearchMethod(function(response){
                console.log("Search method:", response.search_method)

                VK.search_method = response.search_method

                VK.search(artist, song, duration, callback)
            })

            return 
        }
        
        artist = artist.toLowerCase()
        song = song.toLowerCase()

        if(duration != undefined)
            duration = parseInt(duration)

        var track = artist + " " + song

        if(CACHE.get(track))
            return callback(CACHE.get(track))
        

        _gaq.push(['_trackEvent', 'vkontakte_search', this.search_method, artist+'-'+song]);

        if(this.search_method == "test_mode")
            this._testmodeSearch(artist, song, duration, callback)
        else
            this._rawSearch(artist, song, duration, callback)
        
        console.log("Setting search method to null");
        this.search_method = undefined;
    }
}
