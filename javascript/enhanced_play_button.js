var $ = window.jQuery;

function showButtons(link){   
    var track_info = window.getTrackInfo(link);

    console.log('track_info', track_info);

    var container = window.findParent(link, 'ex_container');

    var pos = $(link).offset();

    var buttons = [link];

    if((container && container.getAttribute('data-song')) || link.getAttribute('data-media-type') == 'raw-file'){
        var add_to_queue = document.createElement('a');
        add_to_queue.href = "javascript:;";
        add_to_queue.className = 'chromus_button add_to_queue';    
        add_to_queue.style.position = 'absolute';
        add_to_queue.style.top = pos.top + 1+ 'px';
        add_to_queue.style.left = pos.left + 18 + 'px';
        add_to_queue.style.zIndex = 1000;
        add_to_queue.title = 'Add to playlist';
        add_to_queue.addEventListener('click', function(evt){
            evt.stopPropagation();

            browser.postMessage({method:'add_to_playlist', track:track_info})
        }, false)
        
        document.body.appendChild(add_to_queue);

        buttons.push(add_to_queue);
    }           

    $(link).addClass('buttons_shown');

    var mouseover_func = function(e){
        for(i in buttons)
            clearInterval(buttons[i].hide_timer);
    }

    var mouseout_func = function(e){        
        this.hide_timer = setTimeout(function(){
            for (var i=0; i<buttons.length; i++) {
                if (!buttons[i]) {
                    continue;
                }

                buttons[i].removeEventListener("mouseout", mouseout_func, false);
                buttons[i].removeEventListener("mouseover", mouseover_func, false);

                if (!buttons[i].className.match(/buttons_shown/)) {
                    document.body.removeChild(buttons[i]);
                } else {
                    $(link).removeClass('buttons_shown');
                }
            }

        }, 500)
    };

    for (var i=0; i<buttons.length; i++) {
        if (!buttons[i]) {
            continue;
        }

        buttons[i].addEventListener("mouseout", mouseout_func, false);
        buttons[i].addEventListener("mouseover", mouseover_func, false);
    }
}

document.addEventListener("mouseover", function(evt){
    if(evt.target.className.match(/sm2_button/) && evt.target.nodeName.toUpperCase()=='A'){
        var link = evt.target;

        if(link.className.match(/buttons_shown/))
            return false;

        link.show_timer = setTimeout(function(){
            showButtons(link, evt);        
        }, 300);

        link.addEventListener("mouseout", function(e){
            clearInterval(this.show_timer)            

            this.removeEventListener("mouseout", arguments.calle, false);
        }, false)
    }
}, false)
