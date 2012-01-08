global = @

if @parent?.isTestMode?() or @location?.toString().match(/test_mode/)
    @testMode = true
    document.getElementsByTagName('html')[0].className += " test_mode"

@isTestMode = -> !!@testMode


yepnope.addPrefix 'bg', (resource) ->
        resource.bypass = browser.page_type isnt "background"
        resource

yepnope.addPrefix 'popup', (resource) ->
        resource.bypass = browser.page_type isnt "popup"
        resource

yepnope.addPrefix 'bg_spec', (resource) ->
        resource.bypass = !(@testMode and browser.page_type is "background")
        resource

yepnope.addPrefix 'popup_spec', (resource) ->
        resource.bypass = !(@testMode and browser.page_type is "popup")
        resource

yepnope.addPrefix 'test_mode', (resource) ->
        resource.bypass = !@testMode
        resource

yepnope.addPrefix 'css', (resource) ->
        resource.forceCSS = true
        resource


files = [
    "lib/jquery.min.js"    

    "lib/store.js"
    "lib/md5.js"

    "lib/underscore-min.js"
    "lib/backbone-min.js" 
    
    "popup!lib/iscroll.js"
    "popup!lib/handlebars.js"
    "popup!lib/spin.min.js"

    "test_mode!css!lib/jasmine/jasmine.css"
    "test_mode!lib/jasmine/jasmine.js"
    "test_mode!lib/jasmine/jasmine-html.js"

    "src/chromus.js?" + (+new Date())
    "src/utils.js"
]

yepnope
    load: "lib/browser_api.js"
    complete: -> 
        if browser.page_type is "popup" and global.isTestMode()
            browser.onReady ->
                browser._bg_page.style.display = 'block';

        yepnope load: files