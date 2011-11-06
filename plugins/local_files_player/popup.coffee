class PopupLocalPlayer extends Backbone.Model

    initialize: ->      
        _.bindAll @

        @files = new Backbone.Collection()        

        $('#main_menu .open_local_files input').live 'change', @openFiles

    
    openFiles: (evt) -> 
        opened = _.filter evt.target.files, (file) -> file.type.match /^audio/

        for file in opened
            @files.add
                id: chromus.utils.uid()
                name: file.name
                player: "local_files_player"
                data: file
        
        if opened.length                
            browser.postMessage
                method: 'localPlayer:addFiles',
                files: @files.toJSON()
            

new PopupLocalPlayer()
    
