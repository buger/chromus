class About extends Backbone.View

    template: Handlebars.templates['about.ui.tmpl']

    events:
        "change input[name='debug']": 'toggleDebug'

    initialize: ->
        chromus.openPanel @el
        @render()

    render: ->
        view =
            debug: store.get('debug')
                    
        @el.innerHTML = @template(view)

    toggleDebug: (e) ->
        localStorage.setItem('debug', e.target.checked)


about = $('<li>About</li>')
    .bind 'click', ->
        $('#main_menu').hide()

        new About()


chromus.addMenu about