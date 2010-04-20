var imgURL = chrome.extension.getURL("search.png")

var SEARCH_PATTERN = 'http://vkontakte.ru/gsearch.php?section=audio&q=%s'

var InjectionManager = Class.create({
    registred_wrappers: $H({}),

    initialize: function(){
        if(match = window.location.toString().match(/\/music\/([^\/\?]+)/)){            
            var artist_container = $('catalogueHead').down('h1')

            if(artist_container){
                if(artist_container.down('a'))
                    this.artist = $('catalogueHead').down('h1 a').innerHTML
                else
                    this.artist = $('catalogueHead').down('h1').innerHTML
            }
        }
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
    }
})

MusicDomElement.generateLink = function(track){       
  track = track.gsub('\'',escape('\''))

  return "<a href='"+SEARCH_PATTERN.replace('%s', track)+"' target='_blank' class='lfmButton vk_search_button'><img src='"+imgURL+"'/></a>"
}

MusicDomElement.generateAudioLink = function(track){        
  var fn = (function(el){
      el = $$('a:hover')[0];
      
      if(!soundManager.supported()){
          el.addClassName('disabled');
          el.addClassName('sm2_paused');                      
          el.removeClassName('ex_playing');
          
          el.title = 'Please&nbsp;disable&nbsp;Flashblock';      
          
          return;
      }
      
      if(el.hasClassName('disabled')) return;

      if(el.hasClassName('ex_playing')){
        url = el.readAttribute('data-url');

        soundManager.togglePause(url);

        if(el.hasClassName('sm2_playing')){                           
          el.addClassName('sm2_paused');
          el.removeClassName('sm2_playing');
        }else{
          el.addClassName('sm2_playing');
          el.removeClassName('sm2_paused');
        }

        return;
      }

      $$('a.ex_playing').each(function(el){
        url = el.readAttribute('data-url');

        if(url){
          soundManager.stop(url);
          soundManager.unload(url);   
        }
       
        el.className = 'sm2_button';
      });

      el.addClassName('ex_playing');
      el.addClassName('sm2_playing');
      
      last_url = document.body.readAttribute('data-last-url');
      if(last_url){
        soundManager.stop(last_url);
        soundManager.unload(last_url);                        
      }

      if(el.readAttribute('data-url')){
        soundManager.play(el.readAttribute('data-url'));
        el.addClassName('ex_playing');
        el.addClassName('sm2_playing');
        document.body.setAttribute('data-last-url', url);
      } else {
        customEvent = document.createEvent('Event');
        customEvent.initEvent('ex_search', true, true);                
        document.body.setAttribute('data-track', el.innerHTML);
        document.body.dispatchEvent(customEvent);
      }

      if(!document.body.readAttribute('ex_init')){
          document.body.addEventListener('ex_play', function(){                    
              el = $$('a.ex_playing')[0];

              if(!el) return;
  
              last_url = document.body.readAttribute('data-last-url');
              if(last_url){
                soundManager.stop(last_url);
                soundManager.unload(last_url);                        
              }

              url = document.body.readAttribute('data-url');                            

              if(url){
                el.addClassName('ex_playing');
                el.addClassName('sm2_playing');
                el.setAttribute('data-url', url);
  
                console.log('classnames after', el.className);

                soundManager.createSound({
                    id: url,
                    url: url
                }).play();

                document.body.setAttribute('data-last-url', url);
              } else {                      
                el.addClassName('disabled');
                el.addClassName('sm2_paused');                      
                el.removeClassName('ex_playing');
                el.title = 'Track&nbsp;not&nbsp;found';

                document.body.removeAttribute('data-last-url');
              }
              
              console.log('url:', url);
          });

          document.body.setAttribute('ex_init');
      };

  }).toString().replace(/\s/g,'')        

  return "<a href=\"javascript:("+fn.toString()+")()\" target='_blank' class='sm2_button'>"+track+"</a>"
}


// Standart table, user and artist charts, albums and etc.
var TrackList = Class.create(MusicDomElement, {
    getTrack: function(row){
        var track_info = row.down('.subjectCell').select('a')

        if(row.up('#similarMusicTracks'))
            this.artist = undefined
    
        // If inside artist page
        if(this.artist)
            return this.artist+" "+track_info[0].innerHTML
        else
            return track_info[0].innerHTML+" "+(track_info[1] ? track_info[1].innerHTML : "")
    },

    insertLink: function(row, track){
        var td = row.down('td.smallmultibuttonCell, td.multibuttonCell')
        if(td)
          td.innerHTML = MusicDomElement.generateLink(track) + td.innerHTML        

        var td_playbtn = row.down('td.playbuttonCell')
        if(td_playbtn)
          td_playbtn.innerHTML = MusicDomElement.generateAudioLink(track)
    }
})
manager.registerWrapper('table.tracklist, table.chart', TrackList)


// Track page, http://www.lastfm.ru/music/Ke$ha/_/TiK+ToK
var SingleTrack = Class.create({
    initialize: function(element, artist){
        artist = $$('.breadcrumb a')[0].innerHTML
        var song = $$('.breadcrumb span')[0].innerHTML

        var track = artist + ' '+ song
         
        element.innerHTML = MusicDomElement.generateLink(track) + element.innerHTML

        var container = $$('.leftCol .playback .playback-items')[0]
        container.update(MusicDomElement.generateAudioLink(track)+" Play track")

        container.style.paddingBottom = "3px"
    }
})
manager.registerWrapper('#catalogueHead.trackHead h1', SingleTrack)


var ArtistsChart = Class.create(MusicDomElement, {
    getTrack: function(row){
        var track_info = row.down('.subjectCell').select('a')

        return track_info[1].innerHTML+" "+(track_info[2] ? track_info[2].innerHTML : "")
    },

    insertLink: function(row, track){
        var span = row.down('td.subjectCell span')
        span.innerHTML = MusicDomElement.generateLink(track) + span.innerHTML
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
        p.innerHTML = MusicDomElement.generateLink(track) + p.innerHTML
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
        elm.select('.previewbutton').invoke('remove')

        elm.innerHTML = MusicDomElement.generateLink(track) + MusicDomElement.generateAudioLink(track) + elm.innerHTML
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
        elm.innerHTML = MusicDomElement.generateLink(track) + MusicDomElement.generateAudioLink(track) + elm.innerHTML
    }
})
manager.registerWrapper('#nowPlaying', NowPlaying)


var ArtistsWithInfo = Class.create(MusicDomElement, {
    CHILD_ITEMS_PATTERN:'li',

    getTrack: function(li){
        var track = li.down('strong a').innerHTML
        var artist = li.down('a.artist').innerHTML

        return artist + " " + track
    },

    insertLink: function(li, track){
        var elm = li.down('a')        
        elm.insert({after:MusicDomElement.generateLink(track)})
    }
})
manager.registerWrapper('ul.artistsWithInfo', ArtistsWithInfo)

customEvent = document.createEvent('Event');
customEvent.initEvent('ex_play', true, true);

chrome.extension.sendRequest({'method':'getPattern'}, function(response) {
    SEARCH_PATTERN = response.search_pattern;
    manager.wrapMusicElements()

    document.body.addEventListener('ex_search', function(){
        var track = document.body.readAttribute('data-track')

        chrome.extension.sendRequest({'method':'search', 'track':track}, function(response){
            console.log('response',response.url);

            document.body.setAttribute('data-url', response.url);
            document.body.dispatchEvent(customEvent);   
        })
    })    

 
    // Tabs when switching in charts
    $$('.horizontalOptions').each(function(element){
        element.observe('click', function(){
            setTimeout(function(){manager.wrapMusicElements()}, 1000)
        })
    })
})


