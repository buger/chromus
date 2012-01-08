fs = require "fs"

GLOBAL._ = require "./lib/underscore-min.js"

class yepnope
    FILES: []
    PREFIXES: []

    constructor: (options) ->
        yepnope::FILES.push options.load
        yepnope::FILES = _.flatten yepnope::FILES

        options.complete?.call()

yepnope.addPrefix = (prefix, rule) ->

yepnope.getFiles = (prefix) ->
    result = []

    for file in yepnope::FILES
        if file.match("#{prefix}!") or not file.match("!")
            file = file.replace(/.*!/,'').replace(/\?.*/,'')
            file = "./#{file}" unless file.match(/^\./)

            unless prefix is "css" and file.match(/\.js$/)
                result.push file

    result

GLOBAL.yepnope = yepnope

GLOBAL.browser = 
    extension:
        getURL: (url) -> ".#{url}"

GLOBAL.$ = 
    getJSON: (path, callback) ->
        path = path.replace(/\?.*/,'')

        fs.readFileSync path, "utf-8", (err, data) ->
            data = JSON.parse(data)
            callback(data)


require "./src/chromus_loader.coffee"
require "./src/chromus.coffee"

concat = (fileList, distPath) ->
    out = fileList.map (filePath) -> 
        fs.readFileSync(filePath, 'utf-8')

    fs.writeFileSync distPath, out.join("\n"), "utf-8"


uglify = (srcPath, distPath, header = "") ->    
    uglyfyJS = require('uglify-js')

    jsp = uglyfyJS.parser
    pro = uglyfyJS.uglify
    ast = jsp.parse fs.readFileSync(srcPath, "utf-8")

    ast = pro.ast_mangle(ast)
    ast = pro.ast_squeeze(ast)
    
    content = header + pro.gen_code(ast);
    fs.writeFileSync distPath, content, "utf-8"


task "build", "Build everything and minify", (options) ->
    popupjs = yepnope.getFiles('popup')
    concat popupjs, "./build/popup.js"
    uglify "./build/popup.js", "./build/popup.min.js", "window.debug=false;"

    bgjs = yepnope.getFiles('bg')
    concat bgjs, "./build/bg.js"
    uglify "./build/bg.js", "./build/bg.min.js", "window.debug=false;"

    concat yepnope.getFiles('css'), "./build/plugin_styles.css"