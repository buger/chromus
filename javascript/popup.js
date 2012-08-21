function helpOnHover(element, help){
        var help_func = function(){
            var help_text;

            if (typeof(help) == 'string'){
                help_text = help
            } else {
                help_text = help.call(element)
            }

            $('#quick_help').get(0).innerHTML = help_text
            $('#quick_help').show()

            element.title = help_text
        }

        element.mouseenter(help_func);
        element.click(help_func);
        element.mouseleave(function(){
            $('#quick_help').hide()
        })
    }

    var music_manager = chrome.extension.getBackgroundPage().music_manager;
    var banner_manager = chrome.extension.getBackgroundPage().bannerManager;

    music_manager.dispatcher.addEventListener('onPlay', function(){
        var track = music_manager.playlist[music_manager.current_track]
        stopCurrentTrack()

        if(music_manager.current_track != undefined)
            if(track.not_found)
                try{
                    document.getElementById("ex_button_"+music_manager.current_track).className = "sm2_button disabled"
                    document.getElementById("rs_button_"+music_manager.current_track).className = "research"
                    document.getElementById("rs_button_"+music_manager.current_track).style.display = "none"
                }catch(e){}
            else
                try{
                    document.getElementById("ex_button_"+music_manager.current_track).className = "sm2_button playing"
                    document.getElementById("rs_button_"+music_manager.current_track).className = "research"
                    document.getElementById("rs_button_"+music_manager.current_track).style.display = "inline-block"
                }catch(e){}
    }, true)

    music_manager.dispatcher.addEventListener('onEnded', function(){
        stopCurrentTrack()
    }, true)

    music_manager.dispatcher.addEventListener('onLoading', function(){
        if(music_manager.current_track != undefined)
            try{document.getElementById("ex_button_"+music_manager.current_track).className = "sm2_button loading"}catch(e){}

        updateTrackInfo()
    }, true)

    music_manager.dispatcher.addEventListener('onProgress', function(){
        updateLoadProgress()
    })

    music_manager.dispatcher.addEventListener('onTimeupdate', function(){
        updateProgress()
        updateLoadProgress()
    }, false)

    function updateProgress(){
        var progress = 0
        var loaded_progress = 0

        var track = music_manager.playlist[music_manager.current_track]

        if(track)
            progress = (music_manager.audio.currentTime/track.duration)*100.0

        document.getElementById('progress').style.width = progress+'%'

        var track_time = document.querySelector('.controls_container .time')
        if(track && track.duration)
            track_time.innerHTML = prettyTime(music_manager.audio.currentTime)+' /'+prettyTime(track.duration)
        else
            track_time.innerHTML = ""

    }

    function updateLoadProgress(){
        var track = music_manager.playlist[music_manager.current_track]

        if(track)
          try {
            loaded_progress = (music_manager.audio.buffered.end()/track.duration)*100.0
          } catch(e){
            loaded_progress = 0
          }

        document.getElementById('progress_loaded').style.width = loaded_progress+'%'
    }

    function removeFromPlaylist(link){
        var index = parseInt(link.getAttribute('data-index-number'));
 
        
        music_manager.playlist.splice(index, 1);


        for (var i=0; i<music_manager.playlist.length; i++) {
            music_manager.playlist[i].index = i;
        }

        if (index === music_manager.current_track) { 
            music_manager.current_track = undefined;

            if (music_manager.playlist[index]) {
                try{ music_manager.pause()} catch(e) {}                
                music_manager.play(music_manager.playlist[index]);
            } else {
                music_manager.pause();
            }
        }       

        updatePlaylist();
        updateTrackInfo();

        $('html').css({height: '1px'});
        $('body').css({'height': '100%'});
    }

    function updatePlaylist(){
        var container = document.getElementById('tracks_container')
        var html = ""
        var state
        var rs_state
        
        var playlist = music_manager.playlist

        for(var i=0; i<playlist.length; i++){
            rs_state = ""
            if(music_manager.current_track != undefined && music_manager.current_track == i){
                state = music_manager.audio.paused ? "paused" : "playing"
                rs_state = "style='display:inline-block;'"
            }
            else
                state = playlist[i].not_found ? "disabled" : ""

                html += "<li>"+
                            "<a id='ex_button_"+playlist[i].index+"' data-index-number='"+playlist[i].index+"' href='#' class='sm2_button "+state+"'></a>"+                            
                            "<span class='track'>"+
                                "<a target='_blank' href='http://last.fm/music/"+playlist[i].artist.replace(/\s/g,'+')+"'>"+playlist[i].artist + "</a>" +
                                '  &ndash;  '+
                                "<a target='_blank' href=\"http://last.fm/music/"+playlist[i].artist.replace(/\s/g,'+')+"/_/"+(playlist[i].song||"").replace(/\s/g,'+')+"\">"+playlist[i].song+"</a>"+                                                  
                            "</span>"+
                        "<a id='rs_button_"+playlist[i].index+"' href='#' title='Search another track version' data-index-number='"+playlist[i].index+"' class='research' " + rs_state + "></a>"+
                        "<a href='#' title='Delete from playlist' data-index-number='"+playlist[i].index+"' class='delete'></a>"+
                        "</li>"
        }
        
        if(playlist.length == 0){
            html = "<li class='empty' style='height: 90px; font-size: 16px;'>Find some tracks on <a target='_blank' href='http://www.last.fm/music/The+Beatles/+charts'>Last.fm</a></li>"            
        }

        container.innerHTML = html

        $(container).find('.sm2_button').bind('click', function(evt){
            togglePlaying(evt.currentTarget);
        })

        $(container).find('.research').bind('click', function(evt){
            researchTrack(evt.currentTarget);
        })

        $(container).find('.delete').bind('click', function(evt){
            removeFromPlaylist(evt.currentTarget);
        })
                
        if(music_manager.current_track != undefined && music_manager.current_track > 12)
            var playing_link = document.querySelector('a.sm2_button.playing, a.sm2_button.paused')
            
            if(playing_link)
                container.parentNode.scrollTop = playing_link.parentNode.offsetTop-120
    }
    

    function toggleScrobbling(event){
        var link = event.target
        
        if(link.className.match(/active/)){
            link.className = 'toggle_lfm'
        } else {
            link.className = 'toggle_lfm active'
        }
        
        music_manager.scrobbler.scrobbling = link.className.match(/active/)
        
        _gaq.push(['_trackEvent', 'controls', 'scrobbling', music_manager.scrobbler.scrobbling+'']);
    }   


    function trackLinks(track){
        var artist_link = "http://last.fm/music/"+track.artist.replace(/\s/g,'+')
        var song_link = artist_link+"/_/"+track.song.replace(/\s/g,'+')
        if(track.album)
            var album_link = artist_link+"/"+track.album.replace(/\s/g,'+')

        return {
            artist: artist_link,
            track: song_link,
            album: album_link
        }
    }

    function updateTrackInfo(){
        var track = music_manager.playlist[music_manager.current_track]
        var play_btn = document.getElementById('play')

        if(track){
            document.querySelector('.track_info .container').style.visibility = 'visible'
            document.querySelector('.controls_container .love').style.visibility = 'visible'

            //document.querySelector('.controls_container .buy_track').style.visibility = 'visible';

            updateProgress()

            play_btn.style.display = 'inline'
            if(!music_manager.audio.paused){
                play_btn.querySelector('img').src = "images/pause.png"
                play_btn.className = "playing"
            } else {
                play_btn.querySelector('img').src = "images/play.png"
                play_btn.className = "paused"
            }

            if(track.image)
                document.querySelector("#controls #album_image").src = track.image

            var container = document.querySelector("#controls .track_info")
            var links = trackLinks(track)

            container.querySelector(".track").innerHTML = track.song
            container.querySelector(".track").href = links.track

            container.querySelector(".artist").innerHTML = track.artist
            container.querySelector(".artist").href = links.artist
            

            if(track.album){
                container.querySelector(".album").innerHTML = track.album
                container.querySelector(".album").href = links.album

                container.querySelector(".album_prefix").style.display = "inline"
                container.querySelector(".album").style.display = "inline"
            } else {
                container.querySelector(".album_prefix").style.display = "none"
                container.querySelector(".album").style.display = "none"
            }
        } else {
            document.querySelector("#controls #album_image").src = "images/no_image.png"
            play_btn.style.display = 'none'

            //document.querySelector('.controls_container').style.visibility = 'hidden'
            //document.querySelector('.track_info').style.visibility = 'hidden'

            document.querySelector('.track_info .track').innerHTML = "Track not selected"
            document.querySelector('.track_info .container').style.visibility = 'hidden'
            document.querySelector('.controls_container .love').style.visibility = 'hidden'
            
            //document.querySelector('.controls_container .buy_track').style.visibility = 'hidden'
        }
    }

    function onMouseWheel(evt){
      console.log(evt.wheelDelta)
    }
    window.addEventListener('DOMMouseScroll', onMouseWheel, false)

    function onLoad(){
        updatePlaylist()
        updateTrackInfo()


        /* Love & Ban buttons */
        var love_btn = document.querySelector('.controls_container .love')
        love_btn.addEventListener('click', function(evt){
            music_manager.love()
        }, false)

        helpOnHover($(love_btn), "Love track")


        if(music_manager.scrobbler._username){
            var link = document.querySelector('#scrobbling .lfm_link')
            link.innerHTML = music_manager.scrobbler._username
            link.href = "http://last.fm/user/"+music_manager.scrobbler._username


            var toggle_link = document.querySelector('#toggle_scrobbling')
            
            if(!music_manager.scrobbler.scrobbling)
                $(toggle_link).addClass('disabled');
            
            link.style.display = 'inline'
            toggle_link.style.display = 'inline'
        } else {
            var connect_lfm = document.querySelector('#scrobbling .connect_lfm')
            connect_lfm.style.display = 'inline'
            love_btn.style.display = 'none'

            connect_lfm.addEventListener('click', function(){music_manager.scrobbler.auth()}, false)
        }

        var play_btn = document.getElementById('play')
        play_btn.addEventListener('click', togglePlayingBig, false)
        
        helpOnHover($(play_btn), "Play/Pause")


        var next_track = document.querySelector('.controls_container .next')
        next_track.addEventListener('click', function(){
            music_manager.playNextTrack(true)
            
            _gaq.push(['_trackEvent', 'controls', 'nextTrack']);
        }, false)
        
        helpOnHover($(next_track), "Next track")


        var volume_toggle = document.querySelector('.volume_control .volume_link')
        volume_toggle.addEventListener('click', function(){
            var volume_range = $('#volume-slider')
            volume_range.slider("option", "value", 0)
            music_manager.setVolume(0)
            
            _gaq.push(['_trackEvent', 'controls', 'muteVolume']);
        })
        helpOnHover($(volume_toggle), "Mute")

        /* Progress bar */
        var progress = document.getElementById('progress_bar')
        progress.addEventListener('click', function(evt){
            var track = music_manager.playlist[music_manager.current_track]
            var progress = (evt.clientX/468)

            console.log("X:", track.duration * progress)

            if(track)
                music_manager.audio.currentTime = track.duration * progress 
            
            _gaq.push(['_trackEvent', 'controls', 'progressChange']);
        }, false)
        

        var play_mode = $('#play_mode_control')
        var repeat_mode = $('#repeat_mode_control')
        var stop_after = $('#stop_after_control')

        if (music_manager.play_mode == "shuffle")
            play_mode.removeClass('disabled')

        if (music_manager.repeat_mode && music_manager.repeat_mode != "normal"){
            repeat_mode.removeClass('disabled')

            if (music_manager.repeat_mode == "repeat_all")
                repeat_mode.addClass('all')
        }

        if (music_manager.stop_after_playing == "stop")
            stop_after.removeClass('disabled')


        var play_source = document.getElementById('play_source');
        if(play_source)
            play_source.addEventListener('click', function(evt){
                music_manager.scrobbler.radioTune('lastfm://user/buger_swamp/loved', function(response){
                    music_manager.scrobbler.radioGetPlaylist(function(response){
                        console.log("ZXCZXC")
/*
                    var xhr = new XMLHttpRequest()
                    xhr.open("GET", response.url, true)
                    xhr.send()
                    
                    console.log("Sending redirect response:", response.url)

                    xhr.onreadystatechange = function(){
                        console.log("Redirect response:", xhr)
                    }
*/
//                    music_manager.audio.playOrLoad(response.url)
                })
            })
        })

        $('.buy_track').live('click', function(){
            _gaq.push(['_trackEvent', 'controls', 'buyTrack']);

            var track = music_manager.playlist[music_manager.current_track]

            if (track) {
                var keywords = track.artist + ' ' + track.song;
                keywords = encodeURIComponent(keywords).replace("'",'');

                if (banner_manager.country === 'US') {
                    var url = "http://www.amazon.com/gp/search?ie=UTF8&keywords="+keywords+"&tag=chromus-20&index=digital-music&linkCode=ur2&camp=1789&creative=9325";
                } else {
                    var url = "http://www.amazon.com/gp/search?ie=UTF8&keywords="+keywords+"&tag=chromus-20&index=music&linkCode=ur2&camp=1789&creative=9325";
                }

                chrome.tabs.create({url: url});

                return true;
            } else {
                return false;
            }
        });

        if (!window.localStorage["new_changes_2.9.692"]) {
            $('.new_changes').show()
            .bind('click', function() {                    
                    window.localStorage["new_changes_2.9.692"] = true;

                    chrome.tabs.create({url: chrome.extension.getURL("options.html")});
                });
        }
    }

    function getBanner() {
        var banner = banner_manager.getBanner();
        var show_banner = window.localStorage["show_banner"] == "true" || window.localStorage["show_banner"] == undefined;
        show_banner = false;
        
        if (show_banner && banner) {
            if (banner.match(/\<script/) || banner.match(/document\.write/)) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.innerHTML = banner;
                $('.banner')[0].appendChild(script);
            } else { 
                $('.banner').html(banner);
            }
        } else {
            $('.banner').remove();
        } 

        $('.banner').live('.click', function(){
            _gaq.push(['_trackEvent', 'banners', banner]);
                
            return true;
        })
    }


    function togglePlayingBig(evt){
        if(evt.target.nodeName == 'A'){
            var img = evt.target.querySelector('img')
            var button = evt.target
        } else {
            var img = evt.target
            var button = evt.target.parentNode
        }

        if(button.className.match(/playing/)){
            button.className = "paused"
            img.src = "images/play.png"
            music_manager.pause()
        } else {
            button.className = "playing"
            img.src = "images/pause.png"
            music_manager.audio.playOrLoad()
        }

        updatePlaylist()
        
        _gaq.push(['_trackEvent', 'controls', 'togglePlaying', 'big']);
    }

    function stopCurrentTrack(){
        var current_playing = document.querySelectorAll("a.sm2_button.playing, a.sm2_button.paused, a.sm2_button.loading")

        if(current_playing.length > 0)
            for(i in current_playing){
                current_playing[i].className = "sm2_button";
                try{
                    document.getElementById('rs_button_' + current_playing[i].
                        getAttribute('id').replace(/ex_button_/, '')).style.display = "none";
                }catch(e){}
            }
    }    
    
    function togglePlaying(link){
        if(link.className.match(/disabled/))
            return false
    
        if(link.className.match('playing')){
            link.className = "sm2_button paused"

            music_manager.pause()
        } else {
            if(link.className.match(/paused/)){
                link.className = "sm2_button playing"
            } else {                
                stopCurrentTrack()

                link.className = "sm2_button loading"
            }
            
            music_manager.play(music_manager.playlist[link.getAttribute('data-index-number')])
            
            _gaq.push(['_trackEvent', 'controls', 'togglePlaying', 'playlist']);
        }

        var rs_b = document.getElementById('rs_button_' + link.getAttribute('id').replace(/ex_button_/, ''));
        if(rs_b) {
            rs_b.style.display = "inline-block";
        }

        updateTrackInfo()
    }

    function researchTrack(link){
        if(!music_manager.canResearch)
            link.className = 'research disabled'

        if(link.className.match(/disabled/))
            return false

        var ex_b = document.getElementById('ex_button_' + link.getAttribute('id').replace(/rs_button_/, ''));
        if(ex_b) {
            link.className = "research disabled"
            music_manager.research(music_manager.playlist[link.getAttribute('data-index-number')])

            _gaq.push(['_trackEvent', 'controls', 'researchTrack', 'playlist']);

            updateTrackInfo()
        }
        else
            link.className = 'research disabled'
    }