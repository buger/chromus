var PlayerUI = {
    playlist: [] 
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

    $("#playlist .playing").removeClass("playing");
    $($("#playlist .track_td").get(track_number)).addClass("playing");

    var cur_song = $('#current_song');
    var track_img =  cur_song.find('.album_img img').get(0);

    track_img.src = Scrobbler.getImage({artist: track.artist, album: track.album});

    cur_song.find('.info .song').html(track.song);
    cur_song.find('.info .artist').html(track.artist);

    if(track.album){
        cur_song.find('.info .album').html(track.album);
        cur_song.find('.info .album, .info .dash').show();
    } else {
        cur_song.find('.info .album, .info .dash').hide();
    }    
}

PlayerUI.setState = function(state){
    console.log("Setting player state:", state);

    var controls = $("#header");
    
    controls.find('.inner').width(276.0*state.played/state.duration);
    controls.find('.progress').width(278.0*state.buffered/state.duration);
    controls.find('.time').html(prettyTime(state.played));
}


/***************** Initilizing Port *************************/
port = chrome.extension.connect({name: "popup"});

port.onMessage.addListener(function(msg){
    console.log("Message received:", msg)

    switch(msg.method){
        case 'loadPlaylist':
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
    }
})

port.postMessage({method:'getPlaylist'});
