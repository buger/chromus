(function(window, undefined){
    var LastfmLovedRadio = function(scrobbler) {
        this.skipable = true; 
        this.use_prefetching = true;        
        this.scrobbler = scrobbler;
        this.played_tracks = [];
        this.played_pages = [];

        this.title = "Last.fm loved radio (free)";
    }

    LastfmLovedRadio.prototype.getNext = function(callback) {
        var page = 1;
    
        if (this.pages) {             
            if( !(page = this.pages.random()) ) {
                this.pages = undefined;
                this.played_tracks = [];
            }
        }
        
        console.log("Loading page:", page);

        scrobbler.callMethod("user.getlovedtracks", 
            { user: scrobbler._username, format: 'json', page: page },             
            function(response) {
                var tracks = response.lovedtracks.track.diff(this.played_tracks);
                
                if (tracks.length === 0) {
                    console.log("Page complete");
                    
                    this.pages.splice(page-1, 1);

                    return ;//this.getNext(callback);
                }

                if (!this.pages) {
                    var pages = response.lovedtracks["@attr"].totalPages;
                    this.pages = [];

                    for(var i=1; i<=pages; i++) {
                        this.pages.push(i);
                    }
                }

                track = tracks.random();
                this.played_tracks.push(track);
                
                var track_info = {
                    song: track.name,
                    artist: track.artist.name,
                    
                    source_title: "Last.fm Loved Tracks Radio (Free)",
                    source_icon: "http://cdn.last.fm/flatness/favicon.2.ico"
                };

                callback(track_info);
            }.bind(this)
        );
    }

    window.LastfmLovedRadio = LastfmLovedRadio;


    var LastfmRadio = function(scrobbler, radio_url) {
        this.scrobbler = scrobbler;
        this.radio_url = radio_url;
        this.tuned = false;
        this.prefetched_tracks = [];        

        this.radio_title = this.radio_url.substring(this.radio_url.lastIndexOf("/")+1);
    }

    LastfmRadio.prototype.tune = function(callback){
        scrobbler.radioTune(this.radio_url, function(){
            this.tuned = true;
            this.prefetched_tracks = [];

            this.getNext(callback);
        }.bind(this));
    }

    LastfmRadio.prototype.getNext = function(callback) {
        if (this.tuned) {
            var track = this.prefetched_tracks.splice(0, 1)[0];

            if (track) {
                callback(track);
            }

            if (this.prefetched_tracks.length === 0) {
                scrobbler.radioGetPlaylist(function(playlist) {
                    if (playlist && playlist.length) {        
                        for(var i=0; i < playlist.length; i++) {
                            playlist[i].source_title = "Last.fm Radio: " + this.radio_title;
                            playlist[i].source_icon = "http://cdn.last.fm/flatness/favicon.2.ico";
                        }

                        this.prefetched_tracks = playlist;

                        if (!track) {
                            this.getNext(callback);
                        }
                    }
                }.bind(this));
            }
        } else {
            this.tune(callback);
        }
    }

    window.LastfmRadio = LastfmRadio;
}(window));
