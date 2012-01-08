template = Handlebars.compile '    
    <header>
        <a class="back"></a>
        <h3>About</h3>
    </header>
    <div style="margin-top:20px; text-align:center">
        <h1 style="background:url(assets/icons/42x42.png) center left no-repeat; font-weight: bold; font-size: 16px; display: inline-block; line-height: 42px; padding-left: 50px">Chromus v3.0.2</h1>

        <a href="https://github.com/chromus/chromus" style="display:block;margin-top:15px; font-size: 14px;" target="_blank">github</a>

        <div>
            <label><input type="checkbox" name="debug" {{#if debug}}checked="checked"{{/if}}/> Debug mode</label>            
        </div>
    </div>
'

class About extends Backbone.View

    events:
        "change input[name='debug']": 'toggleDebug'

    initialize: ->
        chromus.openPanel @el
        @render()

    render: ->
        view =
            debug: store.get('debug')
                    
        @el.innerHTML = template(view)

    toggleDebug: (e) ->
        localStorage.setItem('debug', e.target.checked)


about = $('<li>About</li>')
    .bind 'click', ->
        $('#main_menu').hide()

        new About()


chromus.addMenu about