/**
    VK

    Module for working with vk.com
**/
var VK = {
    determineSearchMethod: function(callback){        
        console.info("Trying to determine search method")

        xhrRequest("http://vkontakte.ru", "GET", null, function(xhr){
            if(xhr.responseText.match(/quickLogin/)){
                xhrRequest("http://vk.com", "GET", null, function(xhr){
                    if(xhr.responseText.match(/quickLogin/)) {
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
    _rawSearch: function(artist, song, callback){    
        var track = artist + " " + song

        var url  = "http://"+VK.search_method+"/gsearch.php?section=audio&name=1&ajax=1"
        var data = "c%5Bq%5D="+encodeURIComponent(track)+"&ra=1&c%5Bsection%5D=audio"

        xhrRequest(url, "POST", data, function(xhr){
            // User logged off from vkontakte
            if(xhr.responseText.match(/progress\.gif/)){
                delete VK.search_method

                VK.search(artist, song, callback)

                return
            }

            var container = document.getElementById('vk_search')
            container.innerHTML = xhr.responseText.match(/rows":"(.*)",/)[1].replace(/\n/g,'').replace(/\t/g,'').replace(/\\/g,'').replaceEntities()

            var audio_data = []
            var audio_rows = container.querySelectorAll('div.audioRow')

            for(var i=0; i<audio_rows.length; i++){
                if(i>10) break

                var url_data = audio_rows[i].querySelector('img.playimg').outerHTML.toString().match(/\((.*)\)/)[1].replace(/'/g,'').split(',')
                var url = "http://cs"+url_data[1]+".vkontakte.ru/u"+url_data[2]+"/audio/"+url_data[3]+".mp3"

                audio_data.push({
                  artist: audio_rows[i].querySelector('div.audioTitle b').innerHTML,
                  title: audio_rows[i].querySelectorAll('div.audioTitle span')[1].innerHTML,
                  duration: timeToSeconds(audio_rows[i].querySelector('div.duration').innerHTML),
                  url: url
                })
            }

            if(audio_data.length > 0){                    
                var vk_track

                for(var i=0;i<audio_data.length; i++){
                    if(audio_data[i].artist.toLowerCase() == artist && audio_data[i].title.toLowerCase() == song){
                        vk_track = audio_data[i]
                        break
                    } else if(!audio_data[i].title.toLowerCase().match(/(remix|mix)/) && audio_data[i].artist.toLowerCase() == artist){
                        vk_track = audio_data[i]
                    }
                }

                if(!vk_track)
                    vk_track = audio_data[0]

                //Caching for 3 hours
                CACHE.set(track, vk_track, 1000*60*60*3)                                

                callback(vk_track)
            } else {
                callback({error:'not_found'})
            }
        })

        return false
    },

    /**
        VK Applications for using in test_mode
    **/
    apps: [        
        [327488, 525159, 'g5vuj9EWFO'],
        [2118012, 1882836,'xYsD1Dtsng'],
        [19730188, 1881945, 'rcj0HPk4Wk'],
	    [85838504, 1887506, 'nTCyM7WEBo']
        [9142393, 1891705, 'MlO3y0UXFV'],
        [86844124, 1891718, '8NgTW7tjWm']
    ],

    getApiData: function(){
        return VK.apps[Math.floor(Math.random()*VK.apps.length)]    
    },    

    /**
        VK#_testmodeSearch(artist, song, callback)

        Searching vkontakte with api in test_mode
    **/
    _testmodeSearch: function(artist, song, callback){
        var track = artist + " " + song

        var api = VK.getApiData()
        var url = "http://api.vk.com/api.php"

        md5hash = MD5(api[0]+'api_id='+api[1]+'count=10format=jsonmethod=audio.searchq='+track+'test_mode=1'+api[2])
        var data = 'api_id='+api[1]+'&method=audio.search&format=json&sig='+md5hash+'&test_mode=1&count=10&q='+encodeURIComponent(track)

        console.log("Search url:", url+'?'+data)

        xhrRequest(url, "GET", data, function(xhr){
            // Too many requests and now we banned for some time
            if(xhr.responseText.match(/count\:false/)){
                // Checking if user logged into vkontakte
                VK.determineSearchMethod(function(response){
                    if(response.search_method == "test_mode"){
                        callback({error:'overload'})
                    } else {
                        VK.search_method = response.search_method
                        VK.search(artist, song, callback)
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

                        console.log(audio.artist)

                        if(audio.artist.toLowerCase() == artist && audio.title.toLowerCase() == song){
                            vk_track = audio 
                            break
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
        })
    },


    /**
        VK#search(artist, song, callback)
        - artist (String): Artist
        - song (String): Song
        - callback (Function): Function to be called when search compete, to obtain results. 
    **/    
    search: function(artist, song, callback){
        if(this.search_method == undefined){
            this.determineSearchMethod(function(response){
                console.log("Search method:", response.search_method)

                VK.search_method = response.search_method

                VK.search(artist, song, callback)
            })

            return 
        }
        
        artist = artist.toLowerCase()
        song = song.toLowerCase()
        
        var track = artist + " " + song

        if(CACHE.get(track))
            return callback(CACHE.get(track))
        

        if(this.search_method == "test_mode")
            this._testmodeSearch(artist, song, callback)
        else
            this._rawSearch(artist, song, callback)
    }
}
