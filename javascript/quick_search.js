var qs = document.createElement('div');
qs.id = 'cmp_quick_search_results';
qs.className = 'cmp_quick_search triangle-border top';
document.body.appendChild(qs);

port.onMessage.addListener(function(msg){
    console.log("Received message:", msg)

    if(msg.method == "searchResult") {
        var selected_text = window.getSelection().toString();  
        try{
            var bounding_rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        } catch(e){
            return false;
        }


      qs.style.display = 'block';          
      qs.innerHTML = msg.html;

      qs.style.top = bounding_rect.top + document.body.scrollTop + bounding_rect.height + 'px';
      qs.style.left = bounding_rect.left + document.body.scrollLeft - 20 + 'px';
      qs.innerHTML = "Searching '" + selected_text + "'";

    } else {
      console.log("Unknown message:", msg);
    }
})

var latest_search;

document.addEventListener("mouseup", function(evt){
  if (findParent(evt.target, 'cmp_quick_search'))
    return false;

  var selected_text = window.getSelection().toString();
  try{
    var bounding_rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
  } catch(e){
    return false
  }

  if (selected_text == "" || (latest_search == selected_text && qs.style.display != 'none') || !evt.ctrlKey){
    if(selected_text == "" || !evt.ctrlKey)
      qs.style.display = 'none';

    return false;
  }

  latest_search = selected_text;

  port.postMessage({method:'search', search_text: selected_text})
})

