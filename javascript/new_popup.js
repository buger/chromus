var PlayerUI = {
    playlist: [],
    state: {}
}


PlayerUI.loadPlaylist = function(data){    
    var html = '';
    var merge_rows = 0;
    var length = data.length;
    var playlist_tmpl = $('#playlist_tmpl');

    for(var i=0; i<length; i++){
        if(merge_rows){
            merge_rows -= 1;
            data[i].hide_artist = true;

            if(merge_rows == 0)
                data[i].last_row = true;
        } else {
            merge_rows = this.artistInLine(i, data);

            if(merge_rows > 1){
                data[i].merge_rows = merge_rows+1; 
                data[i].artist_image = Scrobbler.getImage({artist: data[i].artist});
            } else {
                merge_rows = 0;
            }
        }
        
    }
    
    playlist_tmpl.tmpl({playlist: data}).appendTo("#playlist");

    this.playlist = data;
}


PlayerUI.artistInLine = function(start_from, arr){
    var length = arr.length;
    var counter = 0;

    if(start_from >= length)
        return counter;

    for(var i=start_from+1; i<length; i++){
        if(arr[i].artist.replaceEntities() === arr[start_from].artist.replaceEntities())
            counter += 1;
        else
            return counter;
    }                

    return counter;
}

PlayerUI.setCurrentTrack = function(track_number){
    var track = this.playlist[track_number];

    this.current_track = track_number;

    $("#playlist .playing").removeClass("playing");
    
    var cur_song = $('#current_song');

    if(track){
        cur_song.find('.container').show();

        $($("#playlist .track_td").get(track_number)).addClass("playing");

        var track_img =  cur_song.find('.album_img img').get(0);
        track_img.src = Scrobbler.getImage({artist: track.artist, album: track.album});

        cur_song.find('.info .song').html(track.song);
        cur_song.find('.info .artist').html(track.artist);
    } else {
        cur_song.find('.container').hide();
    }


    if(track && track.album){
        cur_song.find('.info .album').html(track.album);
        cur_song.find('.info .album, .info .dash').show();
    } else {
        cur_song.find('.info .album, .info .dash').hide();
    }    

    cur_song.css({visibility:'visible'});

    this.setState({
        played: 0,
        buffered: 0,
        played: 0,
        volume: PlayerUI.state.volume
    });
}

PlayerUI.setState = function(state){
    PlayerUI.state = state;

    var controls = $("#header");
    
    if(state.played)
        controls.find('.inner').width(276.0*state.played/state.duration);    
    else
        controls.find('.inner').width(0);    

    if(state.buffered)
        controls.find('.progress').width(278.0*state.buffered/state.duration);
    else
        controls.find('.progress').width(0);    

    if(state.played != 0)
        controls.find('.time').html(prettyTime(state.played));
    else
        controls.find('.time').html("");

    if(state.volume != undefined && !$('#header .volume .level').is(':visible'))
        this.setVolume(state.volume);        
}


PlayerUI.setVolume = function(level, send_message){
    if(level > 1) level = 1;
    if(level < 0) level = 0;
    
    $('#header .volume .level').css({height:((1-level)*100)+'%'});
    
    this.state.volume = level;

    if(send_message)
        port.postMessage({method:'setVolume', volume: level})
}


PlayerUI.initialize = function(){
    $('#header .volume').mouseenter(function(){
        clearTimeout(this.hide_timeout);

        this.show_timeout = setTimeout(function(){            
            $('#header .volume .volume_bar').show();
        }, 300);
    }).mouseleave(function(){
        clearTimeout(this.show_timeout);

        this.hide_timeout = setTimeout(function(){
            $('#header .volume .volume_bar').hide();
        }, 500);
    }).click(function(){
        $('#header .volume_bar').toggle();
    });
    

    $('#header .volume_bar').click(function(e){
        var level = (e.clientY - 40)/100;

        level = 1 - level;
        
        PlayerUI.setVolume(level, true);
    });
    
    $('#header').mousewheel(function(e, delta){
        console.log('delta:', delta);
        
        var level = PlayerUI.state.volume + delta/10;

        PlayerUI.setVolume(level, true);
    });
    
    $('#header .search').click(function(){
        var search_bar = $('#header .search_bar');

        if(search_bar.is(':visible'))
           search_bar.hide();
        else {
           search_bar.show();
           search_bar.find('input').focus();
        }
    });

    $(document).click(function(e){


        var target = $(e.target);

        if(target.hasClass('sm2_button'))
            port.postMessage({
                method:'play',
                track: getTrackInfo(e.target),
                playlist: [getTrackInfo(e.target)]
            });

        else if(target.hasClass('add_to_queue'))
            port.postMessage({
                method: 'add_to_playlist',
                track: getTrackInfo(e.target)
            });

        else {
            var search_bar = $('#header .search_bar');

            if(search_bar.is(':visible'))
                if($(e.target).parents('#header').length == 0)
                    search_bar.hide();
            }
    });

    $('#header .control.next').click(function(){
        port.postMessage({method: 'nextTrack'});

        PlayerUI.setCurrentTrack(PlayerUI.current_track + 1);
    });

    $('#playlist').click(function(e){
        var target = $(e.target);

        if(target.hasClass('track') && !target.hasClass('playing')){
            var index = target.parents('.track_td')[0].getAttribute('data-index');            
            index = parseInt(index);

            port.postMessage({method:'play', track: index});
            
            PlayerUI.setCurrentTrack(index);
        }
    });

    $('#header .search_bar .text').keyup(function(evt){
        this.interval = setTimeout(PlayerUI.search, 300);
    }).keydown(function(evt){
        clearInterval(this.interval);
    });
}


PlayerUI.search = function(){
    var text = $('#header .search_bar .text').val();

    Scrobbler.search(text, function(response){
        $('#header .search_bar .result').html(response.html);
    });
}


$(document).ready(function(){
    PlayerUI.initialize();        
})

/***************** Initilizing Port *************************/
var port = chrome.extension.connect({name: "popup"});

port.onMessage.addListener(function(msg){
    switch(msg.method){
        case 'loadPlaylist':
            console.log(msg);

            PlayerUI.loadPlaylist(msg.playlist, msg.current_track);
            PlayerUI.setCurrentTrack(msg.current_track);

            PlayerUI.setState(msg.state);
            
            $("#playlist").jScrollPane({
                verticalDragMinHeight: 50,
                verticalDragMaxHeight: 100
            });    

            break;

        case 'loading':
            PlayerUI.setCurrentTrack(msg.track);
            break;

        case 'updateState':
            PlayerUI.setState(msg.state);
            break;

        default:
            console.log('Unknown method:', msg);
    }
})

port.postMessage({method:'getPlaylist'});
