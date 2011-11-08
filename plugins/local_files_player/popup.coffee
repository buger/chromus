class PopupLocalPlayer extends Backbone.Model

    initialize: ->      
        _.bindAll @

        @files = new Backbone.Collection()

        $("
            <li class='open_local_files'>
                <span>Add files to playlist</span>
                <input type='file' multiple />
            </li>
        ").appendTo('#main_menu')
            .find('input').bind('change', @openFiles)

        browser.addMessageListener @listener

    
    openFiles: (evt) -> 
        opened = _.filter evt.target.files, (file) -> file.type.match /^audio/

        opened = _.map opened, (file) ->
            id: chromus.utils.uid()
            artist: "",
            song: file.name
            player: "local_files_player"
            data: file
            
        @files.add opened            
        
        if opened.length                
            browser.postMessage
                method: 'addToPlaylist',
                tracks: @files.toJSON()


    readFile: (id, callback = ->) ->        
        file = @files.get(id).get('data')

        reader = new FileReader()

        reader.onload = (evt) -> 
            console.warn "READ FILES", evt
            callback(evt.target.result)

        console.warn "reading files", file

        reader.readAsDataURL(file)

    
    listener: (msg) ->
        switch msg.method
            when 'localPlayer:getContent'
                @readFile msg.id, (content) ->
                    browser.postMessage 
                        method: 'localPlayer:fileContent'
                        id: msg.id
                        content: content

new PopupLocalPlayer()

$('#main_menu').show()