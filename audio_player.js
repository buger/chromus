var HTML5AudioPlayer = function(options){        
    this.audio = new Audio()

    if(!options)
        this.options = {}
            
    var audio = this.audio
    var player = this

    this.audio.addEventListener('canplay', function(){            
        console.log("duration:", audio.duration)
    }, false)

    this.audio.addEventListener('canplaythrough', function(){
        console.log("Can play through:", audio.duration)

        if(player.options.canPlayThrough)
            player.options.canPlayThrough()
    }, false)

    this.audio.addEventListener('durationchange', function(){
        console.log("duration change:", audio.currentTime)
    }, false)

    this.audio.addEventListener('progress', function(){
    
    }, false)

    this.audio.addEventListener('timeupdate', function(){
        if(audio.currentTime > 0 && audio.ended && player.options.onEnded)
            player.options.onEnded()
    },true)

    this.play = function(url){        
        if(url){
            console.log("Playing url:", url)

            this.url = url
            this.audio.src = url
            this.audio.load()
        }

        this.audio.play()                
    }

    this.pause = function(){
        this.audio.pause()
    }
}    
