# It can be used for offering music downloads

class Source

    baseURL: "http://search.4shared.com/q/CCQD/1/music"

    processResults: (response) ->
        results = $(response).find('table.listView tr')        

        results = _.map results, (tr) ->
            tr = $(tr)

            result =
                title: tr.find('.fname a').html()
                file_url: tr.find('.playThumb img')
                    ?.attr('onclick')
                    ?.match(/(http[^']*)/)?[1]

        results = _.reject results, (i) -> !i.title or !i.file_url
        
        callb        


    search: (args, callback = ->) ->
        query = "#{args.artist}_#{args.song}"
        query = query.replace(/\s+/,"_").replace(" ","_")
            
        console.warn query

        url = "#{@baseURL}/#{query}"        

        if browser.isFrame          
            data = 
                _url: url
                _method: "GET"              

            $.ajax
                url: "#{chromus.baseURL}/proxy"
                data: data
                dataType:"jsonp"
                cache: true
                success: (resp) =>     
                    responseHtml = resp.response.replace(/\n/g,'\uffff').replace(/<script.*?>.*?<\/script>/gi, '')
                        .replace(/\n/g,'\uffff')
                        .replace(/<script.*?>.*?<\/script>/gi, '')
                        .replace(/\uffff/g,'\n')
                        .replace(/<(\/?)noscript/gi, '<$1div')

                    callback @processResults(responseHtml)
        else
            $.ajax
                url: url

                success: (result) => callback @processResults()
                        

@chromus.registerAudioSource("for_shared", new Source())
@chromus.registerPlugin("for_shared", new Source())