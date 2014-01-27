/**
    Class WrapperManager

    This Class is responsible for managing page change for Last.fm site. 

    We have a lot of blocks with songs on site. 
    For each block you need to create new wrapper and register it in InjectionManager like this:
        
        manager.registerWrapper('ul.mediumChartWithImages', SongsChart)

    All wrappers have same interface and inherited from MusicDomElement. 
**/

var playlists_index = {};
var playlists_list = [];
var views_storage = {
    playlists: {},
    songs: {}
};



var WrapperManager = function(){
    this.track_count = 0;
    this.container_count = 0;

    if(window.location.toString().match(/\/music\/([^\/\?]+)/)){
        title = document.querySelector('meta[property="og:title"]').content;
        try {
            type = document.querySelector('meta[property="og:type"]').content;
        } catch (e) {
            type = null;
        }

        if (type == 'song' || type == 'band' || type == 'album') {
            this.artist = title.split(' – ')[0];
        } else if (window.location.toString().match('library')) {
            this.artist = document.querySelector('#libraryBreadcrumb h2').innerText;
        }
        console.log("Artist:", this.artist);
    }
};
WrapperManager.prototype.registred_wrappers = {};


/**
    WrapperManager#wrapMusicElements() -> null

    Uses all registered wrappers to handle all the possible elements on the page.
**/
WrapperManager.prototype.wrapMusicElements = function(){
//    if(window.location.toString().match(/\/event\//))
//        return

    var artist = this.artist;

    for(var css_expr in this.registred_wrappers){
        var wrapper = this.registred_wrappers[css_expr];

        var elements = document.querySelectorAll(css_expr);
               
        for(var i=0; i<elements.length; i++){
            var cur = elements[i];

            if(!cur.has_files_search){

                var playlist = [];
                var dom_index = {};
                try{
                    new wrapper(elements[i], artist).injectSearch(playlist, dom_index);
                    
                    this.container_count += 1;
                } catch(e){
                    console.warn(elements[i]);
                    console.warn(e.message);
                }
                if (playlist.length) {
                    playlists_list.push(playlist);

                    var playlist_num = playlists_list.length - 1;

                    for (var jj = 0; jj < playlist.length; jj++) {
                        playlist[jj].playlist_num = playlist_num;
                    }

                    views_storage.songs[playlist_num] = dom_index;
                }



                elements[i].has_files_search = true;
                elements[i].setAttribute('data-index-number', this.container_count);
            }
        }
    }
    console.log(playlists_list, views_storage.songs);
};

WrapperManager.prototype.registerWrapper = function(css_expr, wrapper){
    this.registred_wrappers[css_expr] = wrapper;
};

var manager = new WrapperManager();


/**
    Class MusicDomElement
    
    Base Class for all wrappers
**/
MusicDomElement = function(){
    this.child_items_pattern = 'tbody tr:not(.artist)';
};
    

/**
    MusicDomElement#getTrack(element) -> Array
    - element (Element): table row, li, or other element with track information

    Get track information from given element.
    Returns Array -> [artist, track]
    
**/
MusicDomElement.prototype.getTrack = function(el){console.error('Abstract function');};


/**
    MusicDomElement#inserLink(element, track) -> Array
    - element (Element): table row, li, or other element with track information
    - track (String): Track obtained from MusicDomElement#getTrack

    Insert play and search link
**/
MusicDomElement.prototype.insertLink = function(el){console.error('Abstract function');};


/**
    MusicDomElement#injectSearch() -> null

    Finds all parent blocks matching a pattern, and injects play and search links into all matching childs.
**/
MusicDomElement.prototype.injectSearch = function(playlist_array, dom_index){
    var track;

    if(!this.element) {
        return false;
    }

    var childs = this.element.querySelectorAll(this.child_items_pattern);
    
    var counter = 0;
    for(var i=0; i < childs.length; i++){
        try {
            track_info = this.getTrack(childs[i]);
            
            if(!track_info) {
                continue;
            }
                
    
            if(track_info[0]){
                childs[i].className += " ex_container";
                childs[i].setAttribute('data-artist', track_info[0]);

                var track;

                if(track_info[1]){
                    childs[i].setAttribute('data-song', track_info[1]);
                    track = track_info.join(' - ');
                } else {
                    track = track_info[0];

                    if(track_info[2]){
                        childs[i].className += " ex_album";
                        childs[i].setAttribute('data-album', track_info[2]);
                    } else
                        childs[i].className += " ex_artist";
                }                                         
                var comment_node = document.createComment('');
                if(this.insertLink(childs[i], track, comment_node) != false){
                    if( track_info[1] ){
                        childs[i].setAttribute('data-index-number', counter);
                        counter += 1;

                        playlist_array.push( track_info );

                        dom_index[ playlist_array.length - 1 ] = comment_node;
                    }
                }
            }
        } catch(e) {
            console.error("Can't wrap row:", e.message, childs[i]);
        }
    }
}

MusicDomElement.prototype.generateLink = function(track){
    //создавал внешню ссылку на поиск во вконтакте
    return '';
};
var prependNode = function(target, elem) {
    target.insertBefore( elem, target.firstChild );
};

var afterNode = function(target) {};
var emptyNode = function(elem) {
    while ( elem.firstChild ) {
        elem.removeChild( elem.firstChild );
    }
};

var temp_div = document.createElement('div');

MusicDomElement.prototype.generateAudioLink = function(track){
  var link = "<a href=\"javascript:;\" target='_blank' class='sm2_button' title='Play song' id='ex_button_" + manager.track_count + "' >" + track + "</a>";
  temp_div.innerHTML = link;

  manager.track_count += 1;

  return temp_div.firstChild;
};

/**
    Class TrackList < MusicDomElement

    Most popular block. User/Artist charts.
**/
var TrackList = function(element, artist){
    this.element = element;
    this.artist = artist;
};
TrackList.prototype = new MusicDomElement();

TrackList.prototype.getTrack = function(row){
    var track_info = row.querySelectorAll('.subjectCell a');
    if(track_info.length == 0)
        track_info = row.querySelectorAll('.subject a')

    if(track_info.length == 0)
        track_info = row.querySelectorAll('.track a')

    // If inside artist page
    if(this.artist && !this.element.className.match('big') && !document.getElementById('thePlaylist'))
        return [this.artist, track_info[0].innerText]
    else
        return [track_info[0].innerText, track_info[1] ? track_info[1].innerText : undefined]
};

TrackList.prototype.insertLink = function(row, track, cmtnode) {
 /*   var td = row.querySelector('td.smallmultibuttonCell, td.multibuttonCell');

    if(td) {
        var link = this.generateLink(track);
        if (link) {
            td.innerHTML = link + td.innerHTML;
        }
    }*/
        
              

    var td_playbtn = row.querySelector('td.playbuttonCell');

    if ( td_playbtn ) {
        emptyNode(td_playbtn);
        td_playbtn.appendChild(cmtnode);
        td_playbtn.appendChild(this.generateAudioLink(track));
    } else {
        return false;
    }
};
manager.registerWrapper('table.tracklist, table.chart', TrackList);


/**
    Class SingleTrack < MusicDomElement
    
    Track page, http://www.lastfm.ru/music/Ke$ha/_/TiK+ToK
**/
var SingleTrack = function(element, artist){
    this.element = element;
    this.artist = artist;
    this.child_items_pattern = 'span[itemprop=name]';
};

SingleTrack.prototype = new MusicDomElement();
SingleTrack.prototype.constructor = SingleTrack;

SingleTrack.prototype.getTrack = function(){
//    var artist = document.querySelector('.breadcrumb a').innerHTML
    var song = document.querySelector('.track-overview h1 span[itemprop=name]').innerText;

    return [this.artist, song];
};

SingleTrack.prototype.insertLink = function(el, track, cmtnode){
    //this.generateLink(track)
    prependNode(el, this.generateAudioLink(track));
    prependNode(el, cmtnode);
    el.className = el.className + ' ex_container';
    return true;
};

manager.registerWrapper('.track-overview h1', SingleTrack);


/**
    Class ArtistChart < MusicDomElement
**/
var ArtistsChart = function(element, artist){
    this.element = element
    this.artist = artist
};

ArtistsChart.prototype = new MusicDomElement();
ArtistsChart.prototype.constructor = ArtistsChart;

ArtistsChart.prototype.getTrack = function(row){
    var track_info = row.querySelectorAll('.subjectCell a')
    var num = 0
    if(track_info[0].className.match(/(playbutton|previewbutton)/))    
        num = 1

    var artist, track

    if((track_info.length-num) == 2){
        artist = track_info[track_info.length-2].innerHTML
        track = track_info[track_info.length-1].innerHTML
    } else {
        artist = track_info[track_info.length-1].innerHTML
    }

    return [artist, track]
};

ArtistsChart.prototype.insertLink = function(row, track, cmtnode){
    var span = row.querySelector('td.subjectCell span')
    //this.generateLink(track)
    prependNode(span, this.generateAudioLink(track));
    prependNode(span, cmtnode);

    
    var previewlink = span.querySelector('a.playbutton, a.previewbutton')
    if (previewlink)
        span.removeChild(previewlink)
};

manager.registerWrapper('table.mediumImageChart', ArtistsChart);


/**
    Class SongsChart < MusicDomElement
**/
var SongsChart = function(element, artist){
    this.element = element;
    this.artist = artist;
    
    this.child_items_pattern = 'li';
};

SongsChart.prototype = new MusicDomElement();
SongsChart.prototype.constructor = SongsChart;

SongsChart.prototype.getTrack = function(li){
    return [li.querySelector('strong').innerHTML]
};

SongsChart.prototype.insertLink = function(li, track, cmtnode){
    return;
    var p = li.querySelector('strong');     
    p.innerHTML = this.generateLink(track) + p.innerHTML
};

manager.registerWrapper('ul.mediumChartWithImages', SongsChart)


/**
    Class FriendsLoved < MusicDomElement
**/
var FriendsLoved = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
};

FriendsLoved.prototype = new MusicDomElement()
FriendsLoved.prototype.constructor = FriendsLoved

FriendsLoved.prototype.getTrack = function(li){
    var track_info = li.querySelectorAll('.object strong a')

    return [track_info[track_info.length-2].innerText, track_info[track_info.length-1].innerText]
};

FriendsLoved.prototype.insertLink = function(li, track, cmtnode){
    var elm = li.querySelector('.object')        
    
    if(elm.querySelector('.previewbutton'))
        elm.querySelector('.previewbutton').style.display = 'none'
    //this.generateLink(track)

    prependNode(elm, this.generateAudioLink(track));
    prependNode(elm, cmtnode);
};
manager.registerWrapper('#friendsLoved', FriendsLoved);


/**
    Class NowPlaying < MusicDomElement
**/
var NowPlaying = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
};

NowPlaying.prototype = new MusicDomElement()
NowPlaying.prototype.constructor = NowPlaying

NowPlaying.prototype.getTrack = function(li){
    var track_info = li.querySelectorAll('.track a')

    return [track_info[track_info.length-2].innerText, track_info[track_info.length-1].innerText]
};

NowPlaying.prototype.insertLink = function(li, track, cmtnode){
    var elm = li.querySelector('.track')     
    //this.generateLink(track)
    prependNode(elm, this.generateAudioLink(track));
    prependNode(elm, cmtnode);
};
manager.registerWrapper('#nowPlaying', NowPlaying);


/**
    Class ArtistsWithInfo < MusicDomElement
**/
var ArtistsWithInfo = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
};

ArtistsWithInfo.prototype = new MusicDomElement()
ArtistsWithInfo.prototype.constructor = ArtistsWithInfo

ArtistsWithInfo.prototype.getTrack = function(li){
    var track = li.querySelector('strong a').innerText;
    var artist = li.querySelector('a.artist').innerText;

    return [artist, track]
};

ArtistsWithInfo.prototype.insertLink = function(li, track, cmtnode){
    var elm = li.querySelector('a')        
//TODO        elm.insert({after:this.generateLink(track)})
};

manager.registerWrapper('ul.artistsWithInfo', ArtistsWithInfo)


/**
    Class ArtistsLargeThumbnails < MusicDomElement

    Used in artists library
**/
var ArtistsLargeThumbnails = function(element, artist){
    this.element = element;
    this.artist = artist;
    this.child_items_pattern = 'li';
};

ArtistsLargeThumbnails.prototype = new MusicDomElement();
ArtistsLargeThumbnails.prototype.constructor = ArtistsLargeThumbnails;

ArtistsLargeThumbnails.prototype.getTrack = function(li){
    try{
        var artist = li.querySelector('strong.name').innerHTML;
    }catch(e){}

    return [artist];
};

ArtistsLargeThumbnails.prototype.insertLink = function(li, track, cmtnode){
    var playbtn = li.querySelector('.playbutton')    
    if(playbtn){
        li.removeChild(playbtn)
    }
    li.appendChild(cmtnode);
    li.appendChild(this.generateAudioLink(track))

};

manager.registerWrapper('ul.artistsLarge', ArtistsLargeThumbnails)

/**
    Class ArtistRecomendations < MusicDomElement
    
    www.lastfm.ru/home/recs
**/
var ArtistRecomendations = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
}

ArtistRecomendations.prototype = new MusicDomElement();
ArtistRecomendations.prototype.constructor = ArtistRecomendations

ArtistRecomendations.prototype.getTrack = function(li){
    var artist = li.querySelector('h2 a.name').innerHTML

    return [artist];
};

ArtistRecomendations.prototype.insertLink = function(li, track, cmtnode){
    var elm = li.querySelector('h2')
    var playbtn = elm.querySelector('a.playbutton')    
    if(playbtn){
        elm.removeChild(playbtn)
    }
    prependNode(elm, this.generateAudioLink(track));
    prependNode(elm, cmtnode);

};

manager.registerWrapper('ul#artistRecs', ArtistRecomendations);


/**
    Class ArtistRecsPreview < MusicDomElement
    
    www.lastfm.ru/home Recomendations block
**/
var ArtistRecsPreview = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
};

ArtistRecsPreview.prototype = new MusicDomElement();
ArtistRecsPreview.prototype.constructor = ArtistRecsPreview

ArtistRecsPreview.prototype.getTrack = function(li){
    var artist = li.querySelector('strong.name').innerHTML

    return [artist]
};

ArtistRecsPreview.prototype.insertLink = function(li, track, cmtnode){
    var elm = li.querySelector('.container')

    elm.appendChild(this.generateAudioLink(track));
    elm.appendChild(cmtnode);

    var playbtn = elm.querySelector('.playbutton')    
    if(playbtn){
        elm.removeChild(playbtn)
    }

};

manager.registerWrapper('ul.artistRecs', ArtistRecsPreview)


/**
    Class ArtistsWithInfo < MusicDomElement

    www.lastfm.ru/music/Camille/+similar
**/
var ArtistsWithInfo = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
};

ArtistsWithInfo.prototype = new MusicDomElement()
ArtistsWithInfo.prototype.constructor = ArtistsWithInfo

ArtistsWithInfo.prototype.getTrack = function(li){

    var artist = li.querySelector('a.artist strong').innerHTML

    return [artist]
};

ArtistsWithInfo.prototype.insertLink = function(li, track, cmtnode){

    li.appendChild(this.generateAudioLink(track));
    li.appendChild(cmtnode);

    var playbtn = li.querySelector('.playbutton')    
    if(playbtn){
        li.removeChild(playbtn)
    }
};

manager.registerWrapper('ul.artistsWithInfo', ArtistsWithInfo)



/**
    Class AlbumsMedium < MusicDomElement

    www.lastfm.ru/home
    www.lastfm.ru/music/Carla+Bruni/+albums
**/
var AlbumsMedium = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
};

AlbumsMedium.prototype = new MusicDomElement()
AlbumsMedium.prototype.constructor = AlbumsMedium

AlbumsMedium.prototype.getTrack = function(li){
    if(li.parentNode.className.match(/lfmDropDownBody/))
        return false

    var artist = li.querySelector('a.artist').innerHTML
    var album = li.querySelector("strong a").childNodes[1].nodeValue.replace(/^\s+/,'')

    return [artist, undefined, album]
};

AlbumsMedium.prototype.insertLink = function(li, track, cmtnode){
    
    li.appendChild(this.generateAudioLink(track));
    li.appendChild(cmtnode);

    var elm = li.querySelector('div.resContainer')

    var playbtn = elm.querySelector('.playbutton')    
    if(playbtn){
        elm.removeChild(playbtn)
    }
};

manager.registerWrapper('ul.albumsMedium, ul.albumsLarge', AlbumsMedium)


/**
    Class AlbumsLibrary < MusicDomElement

    www.lastfm.ru/user/buger_swamp/library/music/Carla+Bruni
**/
var AlbumsLibrary = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
};

AlbumsLibrary.prototype = new MusicDomElement()
AlbumsLibrary.prototype.constructor = AlbumsLibrary

AlbumsLibrary.prototype.getTrack = function(li){
    var album = li.querySelector("strong.title").innerHTML

    return [this.artist, undefined, album]
};

AlbumsLibrary.prototype.insertLink = function(li, track, cmtnode){
    var elm = li.querySelector('span.albumCover');
    prependNode(elm, this.generateAudioLink(track));
    prependNode(elm, cmtnode);
};

manager.registerWrapper('#albumstrip ul', AlbumsLibrary)


/**
    Class NewReleases < MusicDomElement

    www.lastfm.ru/home/newreleases
**/
var NewReleases = function(element, artist){
    this.element = element
    this.artist = artist
};

NewReleases.prototype = new MusicDomElement()
NewReleases.prototype.constructor = NewReleases

NewReleases.prototype.getTrack = function(tr){
    var album = tr.querySelector(".release a.title strong")
    
    if(!album)
        return false

    album = album.innerHTML

    var artist = tr.querySelector(".library a.artist strong").innerHTML

    return [artist, undefined, album]
};

NewReleases.prototype.insertLink = function(tr, track, cmtnode){
    var elm = tr.querySelector('.release');

    prependNode(elm, this.generateAudioLink(track));
    prependNode(elm, cmtnode);

    var playbtn = elm.querySelector('.playbutton')    
    if(playbtn){
        elm.removeChild(playbtn)
    }
};

manager.registerWrapper('#newReleases', NewReleases)

/**
    Class RecentAlbumns < MusicDomElement

    www.last.fm/tag/baroque%20pop Recently added block
**/
var RecentAlbums = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
};

RecentAlbums.prototype = new MusicDomElement()
RecentAlbums.prototype.constructor = RecentAlbums

RecentAlbums.prototype.getTrack = function(li){
    if(li.parentNode.className.match(/lfmDropDownBody/))
        return false

    var album = li.querySelector("a.album strong").innerHTML
    var artist = li.querySelector("a.artist").innerHTML

    console.log("Album:", album)

    return [artist, undefined, album]
};

RecentAlbums.prototype.insertLink = function(li, track, cmtnode){

    li.appendChild(this.generateAudioLink(track));
    li.appendChild(cmtnode);

    var playbtn = li.querySelector('.playbutton')    
    if(playbtn)
        li.removeChild(playbtn)
};

manager.registerWrapper('ul.recentAlbums', RecentAlbums);


/**
    Class MostUnwanted < MusicDomElement

    playground.last.fm/unwanted
**/ 
var Playground = function(element, artist){
    this.element = element
    this.artist = artist
    
    this.loc = window.location.toString()

    if(this.loc.match(/unwanted/))
        this.page_type = "unwanted"
    else if(this.loc.match(/sterec/))
        this.page_type = "sterec"    
    else if(this.loc.match(/multitag/)){
        this.page_type = "multitag"
    }
};

Playground.prototype = new MusicDomElement();

Playground.prototype.getTrack = function(row){
    if(this.page_type == "unwanted"){
        var track_info = row.querySelectorAll('td')[2].querySelectorAll('a')
        var l = track_info.length

        return [track_info[l-1].innerHTML, track_info[l-2].innerHTML]
    } else if(this.page_type == "sterec" || this.page_type == "multitag"){
        var track_info = row.querySelectorAll('td')[1].querySelectorAll('a')
        
        if(track_info[0].href.match(/autostart/))
            if(this.page_type == "multitag" && !this.loc.match(/artists/))
                return [track_info[1].innerHTML, track_info[2].innerHTML]
            else 
                return [track_info[1].innerHTML]
        else
            if(this.page_type == "multitag" && !this.loc.match(/artists/))
                return [track_info[0].innerHTML, track_info[1].innerHTML]
            else
                return [track_info[0].innerHTML]
        
    } else {
        return []
    }
};

Playground.prototype.insertLink = function(row, track, cmtnode) {
    if(this.page_type == "unwanted"){
        var td = row.querySelectorAll('td')[2];
        var track_info = td.querySelectorAll('a');

        if(track_info.length == 3)
            td.removeChild(track_info[0])

        prependNode(td, this.generateAudioLink(track));
        prependNode(td, cmtnode);

    } else if(this.page_type == "sterec" || this.page_type == "multitag") {
        var td = row.querySelectorAll('td')[1];
        var track_info = td.querySelectorAll('a');

        if(track_info[0].href.match(/autostart/))
            td.removeChild(track_info[0])
        
        prependNode(td, this.generateAudioLink(track));
        prependNode(td, cmtnode);
    }
};
manager.registerWrapper('#bottombox table', Playground);