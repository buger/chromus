var Autocompleter = function(element){
  this.element = element;
  this.element.value = "Type artist or track name..."

  this.bindEvents();
}

Autocompleter.prototype.bindEvents = function(){
  this.element.addEventListener('keydown', function(){
    clearInterval(this.interval)
  }.bind(this), true)

  this.element.addEventListener('keyup', function(){
    clearInterval(this.interval)

    this.interval = setTimeout(this.autocomplete.bind(this), 300)
  }.bind(this), true)

  this.element.addEventListener('focus', function(){
    if(this.className.match(/gray/)){
        this.value = ''
        this.className = ''
    }
  })

  this.element.addEventListener('blur', function(){
    if(this.value == ''){
        this.value = "Type artist or track name..."
        this.className = 'gray'
    }
  })
}

Autocompleter.prototype.autocomplete = function(evt){
  var search_text = this.element.value;

  if (search_text.replace(/\s/,'') == ''){
    document.getelementbyid('search_results').innerhtml = '';
    document.getelementbyid('search_results').style.display = 'none';
    return false;
  }
  
  Scrobbler.search(search_text, function(response){
    document.getElementById('search_results').innerHTML = response.html;
    document.getElementById('search_results').style.display = 'block';
  })
}
