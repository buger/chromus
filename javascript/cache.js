CACHE = {
    data:{}    
}

CACHE.set = function(key, value, expire_in_seconds){
    if(value == undefined && CACHE.data[key]){
        delete CACHE.data[key]       
    } else {    
        CACHE.data[key] = {
            value: value,
            expire: expire_in_seconds,
            created: (new Date().getTime())
        }
    }
}

CACHE.unset = function(key){
    CACHE.set(key)
}

CACHE.get = function(key) {
    var data = CACHE.data[key]

    if(data)
        return data['value']
}

CACHE.gc = function(){
    var time = new Date().getTime()
    var gc_objects = 0

    for(key in CACHE.data){
        if(CACHE.data[key]['expire'] && (time-CACHE.data[key]['created']) > CACHE.data[key]['expire']){
            delete CACHE.data[key]
            gc_objects += 1
        }
    }

    if(gc_objects)
        console.log("GC objects collected:", gc_objects)

    setTimeout(CACHE.gc, 100*1000)
}

CACHE.gc()