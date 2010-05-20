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

            if(xhr.responseText.match(/id\d+/)){ //пользователь залогинен на vkontakte.ru
                console.log("Seaching with vkontakte")

                var url = "http://api.vk.com/api.php"

                xhrRequest("http://vkontakte.ru/gsearch.php?section=audio&name=1&ajax=1", "POST", "c%5Bq%5D="+encodeURIComponent(track)+"&ra=1&c%5Bsection%5D=audio", function(xhr){

                  console.log("Response:", xhr.responseText)
//                  response = JSON.parse(xhr.responseText)
                  var container = document.getElementById('vk_search')
                  container.innerHTML = xhr.responseText.match(/rows":"(.*)",/)[1].replace(/\n/g,'').replace(/\t/g,'').replace(/\\/g,'')
                  
                  var audio_data = []
                  var audio_rows = container.querySelectorAll('div.audioRow')
                  
                  for(var i=0; i<audio_rows.length; i++){
                    if(i>10) break

                    var url_data = audio_rows[i].querySelector('img.playimg').outerHTML.toString().match(/\((.*)\)/)[1].replace(/'/g,'').split(',')
                    var url = "http://cs"+url_data[1]+".vkontakte.ru/u"+url_data[2]+"/audio/"+url_data[3]+".mp3"

                    audio_data.push({
                      artist: audio_rows[i].querySelector('div.audioTitle b').innerHTML,
                      title: audio_rows[i].querySelectorAll('div.audioTitle span')[1].innerHTML,
                      url: url
                    })
                  }

                  console.log("Audio data:", audio_data)

                  if(audio_data.length > 0){                    
                    var vk_track;

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

                    VK.url_cache[track] = vk_track.url                

                    callback({url:vk_track.url})
                  } else {
                    callback({error:'not_found'})
                  }

                })

                return false
            } else {
                var url = "http://api.vkontakte.ru/api.php"
            }

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
