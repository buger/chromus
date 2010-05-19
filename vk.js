var VK = {
    apps: [
        [525159, 'g5vuj9EWFO'],
        [1863410, '9qEFmMTgP8'],
        [1872690, '3OlqUQB7KL']
    ],

    getApiData: function(){
        return VK.apps[Math.floor(Math.random()*VK.apps.length)]    
    },    

    url_cache: {},

    search: function(artist, song, callback){
        artist = artist.toLowerCase()
        song = song.toLowerCase()

        var track = artist + " " + song

        if(VK.url_cache[track]){
            callback({url:VK.url_cache[track]}) 

            return
        }

        xhrRequest("http://pda.vkontakte.ru", "GET", null, function(xhr){
            var api = VK.getApiData()

            if(xhr.responseText.match(/id\d+/)) //пользователь залогинен на vkontakte.ru
                var url = "http://api.vk.com/api.php"
            else
                var url = "http://api.vkontakte.ru/api.php"
            
            md5hash = MD5('327488api_id='+api[0]+'count=10format=jsonmethod=audio.searchq='+track+'test_mode=1'+api[1])     
            var data = 'api_id='+api[0]+'&method=audio.search&format=json&sig='+md5hash+'&test_mode=1&count=10&q='+encodeURIComponent(track)
            
            console.log("Search url:", url+'?'+data)

            xhrRequest(url, "GET", data, function(xhr){
                var mp3_url

                results = JSON.parse(xhr.responseText);
             
                if(results.response){
                    var vk_track

                    console.log("Searching:", artist, song)
                    if(results.response[1]){                                
                        for(var i=1; i<results.response.length; i++){
                            var audio = results.response[i].audio
                            console.log(audio.artist, audio.title)

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
                        mp3_url = vk_track.url
                        VK.url_cache[track] = mp3_url                
                        
                        callback({url:mp3_url})
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
        })
    }
}
