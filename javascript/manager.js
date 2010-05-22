/**
    Class WrapperManager

    This Class is responsible for managing page change for Last.fm site. 

    We have a lot of blocks with songs on site. 
    For each block you need to create new wrapper and register it in InjectionManager like this:
        
        manager.registerWrapper('ul.mediumChartWithImages', SongsChart)

    All wrappers have same interface and inherited from MusicDomElement. 
**/
var WrapperManager = function(){
    this.track_count = 0
    this.container_count = 0

    if(match = window.location.toString().match(/\/music\/([^\/\?]+)/)){
        var artist_container = document.querySelector('#catalogueHead h1')

    if(artist_container){
        var link = artist_container.querySelector('a')
        if(link)
            this.artist = link.innerHTML
        else        
            this.artist = artist_container.innerHTML
    }

    if(!this.artist && document.getElementById('libraryBreadcrumb')){
       this.artist = document.querySelector("#libraryBreadcrumb h2").innerHTML 
    }

        if(!this.artist){
            this.artist = document.querySelector(".pagehead p a")
            
            if(this.artist){
                try{
                    this.artist = this.artist.childNodes[1].nodeValue.replace(/^\s+/,'')
                } catch(e){}
            }
        }

        console.log("Artist:", this.artist)
    }
}
WrapperManager.prototype.registred_wrappers = {}


/**
    WrapperManager#wrapMusicElements() -> null

    Uses all registered wrappers to handle all the possible elements on the page.
**/
WrapperManager.prototype.wrapMusicElements = function(){
    if(window.location.toString().match(/\/event\//))
        return
    
    var artist = this.artist

    for(var css_expr in this.registred_wrappers){
        var wrapper = this.registred_wrappers[css_expr]

        var elements = document.querySelectorAll(css_expr)
               
        for(var i=0; i<elements.length; i++){
            class_name = elements[i].className || ""

            if(!class_name.match('with_vk_search')){
                try{
                    new wrapper(elements[i], artist).injectSearch()
                    
                    this.container_count += 1
                } catch(e){
                    console.warn(elements[i])
                    console.error(e.message)
                }

                elements[i].className += ' with_vk_search'
                elements[i].setAttribute('data-index-number', this.container_count)
            }
        }
    }
}

WrapperManager.prototype.registerWrapper = function(css_expr, wrapper){
    this.registred_wrappers[css_expr] = wrapper    
}    

var manager = new WrapperManager()


/**
    Class MusicDomElement
    
    Base Class for all wrappers
**/
MusicDomElement = function(){
    this.child_items_pattern = 'tbody tr:not(.artist)'
}
    

/**
    MusicDomElement#getTrack(element) -> Array
    - element (Element): table row, li, or other element with track information

    Get track information from given element.
    Returns Array -> [artist, track]
    
**/
MusicDomElement.prototype.getTrack = function(el){console.error('Abstract function')}


/**
    MusicDomElement#inserLink(element, track) -> Array
    - element (Element): table row, li, or other element with track information
    - track (String): Track obtained from MusicDomElement#getTrack

    Insert play and search link
**/
MusicDomElement.prototype.insertLink = function(el){console.error('Abstract function')}


/**
    MusicDomElement#injectSearch() -> null

    Finds all parent blocks matching a pattern, and injects play and search links into all matching childs.
**/
MusicDomElement.prototype.injectSearch = function(){
    var track

    if(!this.element)
        return false

    var childs = this.element.querySelectorAll(this.child_items_pattern)
    
    var counter = 0
    for(var i=0; i < childs.length; i++){
        try {
            track = this.getTrack(childs[i])    

            if(track[0] && track[1]){
                childs[i].className += " ex_container"
                childs[i].setAttribute('data-artist', track[0])        
                childs[i].setAttribute('data-song', track[1])
                        
                if(this.insertLink(childs[i], track.join(' - ')) != false){
                    childs[i].setAttribute('data-index-number', counter)
                    counter += 1
                }
            }
        } catch(e) {
            console.error("Can't wrap row:", e.message, childs[i])
        }
    }
}

MusicDomElement.prototype.generateLink = function(track){
    return "<a href='"+manager.search_pattern.replace('%s', encodeURIComponent(track))+"' target='_blank' Class='lfmButton vk_search_button' title='Search song'></a>"
}


MusicDomElement.prototype.generateAudioLink = function(track){
  var link = "<a href=\"javascript:;\" target='_blank' Class='sm2_button' title='Play song' id='ex_button_"+manager.track_count+"' >"+track+"</a>"
  
  manager.track_count += 1

  return link
}

/**
    Class TrackList < MusicDomElement

    Most popular block. User/Artist charts.
**/ 
var TrackList = function(element, artist){
    this.element = element
    this.artist = artist
}
TrackList.prototype = new MusicDomElement()

TrackList.prototype.getTrack = function(row){
    var track_info = row.querySelectorAll('.subjectCell a')
    if(track_info.length == 0)
        track_info = row.querySelectorAll('.subject a')

    if(track_info.length == 0)
        track_info = row.querySelectorAll('.track a')

    // If inside artist page
    if(!this.element.className.match('big') && !document.getElementById('thePlaylist') && (!this.element.className.match('tracklist') && (track_info.length == 1 || track_info[1].href.match(/\.mp3/)) || document.getElementById('libraryBreadcrumb')))
    return [this.artist, track_info[0].innerHTML]
    else
    return [track_info[0].innerHTML, track_info[1].innerHTML]
}

TrackList.prototype.insertLink = function(row, track) {
    var td = row.querySelector('td.smallmultibuttonCell, td.multibuttonCell')

    if(td)
        td.innerHTML = this.generateLink(track) + td.innerHTML      

    var td_playbtn = row.querySelector('td.playbuttonCell')
    if(td_playbtn)
        td_playbtn.innerHTML = this.generateAudioLink(track)
    else
        return false
}
manager.registerWrapper('table.tracklist, table.chart', TrackList)


/**
    Class SingleTrack < MusicDomElement
    
    Track page, http://www.lastfm.ru/music/Ke$ha/_/TiK+ToK
**/
var SingleTrack = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'h1'
}

SingleTrack.prototype = new MusicDomElement()
SingleTrack.prototype.constructor = SingleTrack

SingleTrack.prototype.getTrack = function(){
    var artist = document.querySelector('.breadcrumb a').innerHTML
    var song = document.querySelector('.breadcrumb span').innerHTML

    return [artist, song]
}

SingleTrack.prototype.insertLink = function(el, track){
    el.innerHTML = this.generateAudioLink(track) +" "+ this.generateLink(track) + el.innerHTML
    el.className = el.className + ' ex_container'
}

manager.registerWrapper('#catalogueHead.trackHead', SingleTrack)


/**
    Class ArtistChart < MusicDomElement
**/
var ArtistsChart = function(element, artist){
    this.element = element
    this.artist = artist
}

ArtistsChart.prototype = new MusicDomElement()
ArtistsChart.prototype.constructor = ArtistsChart

ArtistsChart.prototype.getTrack = function(row){
    var track_info = row.querySelectorAll('.subjectCell a')
    return [track_info[1].innerHTML, (track_info[2] ? track_info[2].innerHTML : null)]
}

ArtistsChart.prototype.insertLink = function(row, track){
    var span = row.querySelector('td.subjectCell span')
    span.innerHTML = this.generateLink(track) + span.innerHTML
}

manager.registerWrapper('table.mediumImageChart', ArtistsChart)


/**
    Class SongsChart < MusicDomElement
**/
var SongsChart = function(element, artist){
    this.element = element
    this.artist = artist
    
    this.child_items_pattern = 'li'
}

SongsChart.prototype = new MusicDomElement()
SongsChart.prototype.constructor = SongsChart

SongsChart.prototype.getTrack = function(li){
    return [li.querySelector('strong').innerHTML]
}

SongsChart.prototype.insertLink = function(li, track){
    var p = li.querySelector('strong')        
    p.innerHTML = this.generateLink(track) + p.innerHTML
}

manager.registerWrapper('ul.mediumChartWithImages', SongsChart)


/**
    Class FriendsLoved < MusicDomElement
**/
var FriendsLoved = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
}

FriendsLoved.prototype = new MusicDomElement()
FriendsLoved.prototype.constructor = FriendsLoved

FriendsLoved.prototype.getTrack = function(li){
    var track_info = li.querySelectorAll('.object strong a')

    return [track_info[track_info.length-2].innerHTML, track_info[track_info.length-1].innerHTML]
}

FriendsLoved.prototype.insertLink = function(li, track){
    var elm = li.querySelector('.object')        
    
    if(elm.querySelector('.previewbutton'))
        elm.querySelector('.previewbutton').style.display = 'none'

    elm.innerHTML = this.generateLink(track) + this.generateAudioLink(track) + elm.innerHTML
}
manager.registerWrapper('#friendsLoved', FriendsLoved)


/**
    Class NowPlaying < MusicDomElement
**/
var NowPlaying = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
}

NowPlaying.prototype = new MusicDomElement()
NowPlaying.prototype.constructor = NowPlaying

NowPlaying.prototype.getTrack = function(li){
    var track_info = li.querySelectorAll('.track a')

    return [track_info[track_info.length-2].innerHTML, track_info[track_info.length-1].innerHTML]
}

NowPlaying.prototype.insertLink = function(li, track){
    var elm = li.querySelector('.track')     

    elm.innerHTML = this.generateLink(track) + this.generateAudioLink(track) + elm.innerHTML
}
manager.registerWrapper('#nowPlaying', NowPlaying)


/**
    Class ArtistsWithInfo < MusicDomElement
**/
var ArtistsWithInfo = function(element, artist){
    this.element = element
    this.artist = artist
    this.child_items_pattern = 'li'
}

ArtistsWithInfo.prototype = new MusicDomElement()
ArtistsWithInfo.prototype.constructor = ArtistsWithInfo

ArtistsWithInfo.prototype.getTrack = function(li){
    var track = li.querySelector('strong a').innerHTML
    var artist = li.querySelector('a.artist').innerHTML

    return [artist, track]
}

ArtistsWithInfo.prototype.insertLink = function(li, track){
    var elm = li.querySelector('a')        
//TODO        elm.insert({after:this.generateLink(track)})
}

manager.registerWrapper('ul.artistsWithInfo', ArtistsWithInfo)
