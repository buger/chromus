var imgURL = chrome.extension.getURL("vk.png")
var SEARCH_PATTERN = 'http://vkontakte.ru/gsearch.php?section=audio&q=%s'

var InjectionManager = Class.create({
    registred_wrappers: $H({}),

    initialize: function(){
        if(match = window.location.toString().match(/\/music\/([\w\+]+)/))
            this.artist = match[1].replace("+"," ") 
    },

    wrapMusicElements: function(){
        var artist = this.artist

        this.registred_wrappers.each(function(pair){
            $$(pair.key).each(function(element){
                if(!element.hasClassName('with_vk_search')){
                    new pair.value(element, artist)    
                    element.addClassName('with_vk_search')
                }
            })
        })
    },

    registerWrapper: function(css_expr, wrapper){
        this.registred_wrappers.set(css_expr, wrapper)
    }
})
var manager = new InjectionManager()


var MusicDomElement = Class.create({
    CHILD_ITEMS_PATTERN:'tbody tr',

    initialize: function(element, artist){
        this.element = element
        this.artist = artist
        
        this.injectSearch()
    },

    getTrack: function(child){
        throw 'abstract function, redefine'
    },

    insertLink: function(row, track){
        throw 'abstract function, redefine'
    },

    injectSearch: function(){
        var track
        var childs = this.element.select(this.CHILD_ITEMS_PATTERN)

        for(var i=0; i < childs.length; i++){
            track = this.getTrack(childs[i])
            
            this.insertLink(childs[i], track)
        }
    },

    generateLink: function(track){        
        return "<a href='"+SEARCH_PATTERN.replace('%s',escape(track))+"' target='_blank' class='lfmButton vk_search_button'><img src='"+imgURL+"'/></a>"
    }
})

// Standart table, user and artist charts, albums and etc.
var TrackList = Class.create(MusicDomElement, {
    getTrack: function(row){
        var track_info = row.down('.subjectCell').select('a')

        // If inside artist page
        if(this.artist)
            return this.artist+" "+track_info[0].innerHTML
        else
            return track_info[0].innerHTML+" "+(track_info[1] ? track_info[1].innerHTML : "")
    },

    insertLink: function(row, track){
        var td = row.down('td.smallmultibuttonCell, td.multibuttonCell')
        td.innerHTML = this.generateLink(track) + td.innerHTML
    }
})
manager.registerWrapper('table.tracklist, table.chart', TrackList)


// Track page, http://www.lastfm.ru/music/Ke$ha/_/TiK+ToK
var SingleTrack = Class.create({
    initialize: function(element, artist){
        var track = artist + ' '+ window.location.toString().match(/\/([\w\+]+$)/)[1]
        
        var link = "<a href='"+SEARCH_PATTERN.replace('%s',escape(track))+"' target='_blank' class='vk_search_button'><img src='"+imgURL+"'/></a>"
        element.innerHTML = link + element.innerHTML
    }
})
manager.registerWrapper('h1.withAlbum', SingleTrack)


var ArtistsChart = Class.create(MusicDomElement, {
    getTrack: function(row){
        var track_info = row.down('.subjectCell').select('a')

        return track_info[1].innerHTML+" "+(track_info[2] ? track_info[2].innerHTML : "")
    },

    insertLink: function(row, track){
        var span = row.down('td.subjectCell span')
        span.innerHTML = this.generateLink(track) + span.innerHTML
    }
})
manager.registerWrapper('table.mediumImageChart', ArtistsChart)


var SongsChart = Class.create(MusicDomElement, {
    CHILD_ITEMS_PATTERN:'li',

    getTrack: function(li){
        return li.down('strong').innerHTML
    },

    insertLink: function(li, track){
        var p = li.down('strong')        
        p.innerHTML = this.generateLink(track) + p.innerHTML
    }
})
manager.registerWrapper('ul.mediumChartWithImages', SongsChart)


var FriendsLoved = Class.create(MusicDomElement, {
    CHILD_ITEMS_PATTERN:'li',

    getTrack: function(li){
        var track_info = li.select('.object strong a')

        return track_info[track_info.length-2].innerHTML+" "+track_info.last().innerHTML
    },

    insertLink: function(li, track){
        var elm = li.down('.object')        
        elm.innerHTML = this.generateLink(track) + elm.innerHTML
    }
})
manager.registerWrapper('#friendsLoved', FriendsLoved)

var NowPlaying = Class.create(MusicDomElement, {
    CHILD_ITEMS_PATTERN:'li',

    getTrack: function(li){
        var track_info = li.select('.track a')

        return track_info[track_info.length-2].innerHTML+" "+track_info.last().innerHTML
    },

    insertLink: function(li, track){
        var elm = li.down('.track')        
        elm.innerHTML = this.generateLink(track) + elm.innerHTML
    }
})
manager.registerWrapper('#nowPlaying', NowPlaying)

manager.wrapMusicElements()

$$('.horizontalOptions').each(function(element){
    element.observe('click', function(){
        setTimeout(function(){manager.wrapMusicElements()}, 1000)
    })
})
