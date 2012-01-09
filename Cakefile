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
GLOBAL.debug = true

GLOBAL.browser = 
    extension:
        getURL: (url) -> ".#{url}"

GLOBAL.$ = 
    getJSON: (path, callback) ->
        path = path.replace(/\?.*/,'')

        data = fs.readFileSync path, "utf-8"
        data = JSON.parse(data)
        callback(data)


require "./src/chromus_loader.coffee"
require "./src/chromus.coffee"

concat = (fileList, distPath, postfix = "") ->
    out = fileList.map (filePath) -> 
        content = fs.readFileSync(filePath, 'utf-8')
        "// File: #{filePath}\n#{content}"

    fs.writeFileSync distPath, out.join(";\n")+postfix, "utf-8"


uglify = (srcPath, distPath) ->    
    uglyfyJS = require('uglify-js')

    jsp = uglyfyJS.parser
    pro = uglyfyJS.uglify
    ast = jsp.parse fs.readFileSync(srcPath, "utf-8")

    ast = pro.ast_mangle(ast)
    ast = pro.ast_squeeze(ast)
    
    fs.writeFileSync distPath, pro.gen_code(ast), "utf-8"


task "build", "Build everything and minify", (options) ->
    css_files = yepnope.getFiles('css').map (el) -> "\"css!#{el}\""
    loadCSSJS = "yepnope({load:[#{css_files}]});"

    popupjs = yepnope.getFiles('popup')
    concat popupjs, "./build/popup.js", loadCSSJS
    uglify "./build/popup.js", "./build/popup.min.js"

    bgjs = yepnope.getFiles('bg')
    concat bgjs, "./build/bg.js"
    uglify "./build/bg.js", "./build/bg.min.js"

walk = (dir, done) ->
    results = []
    fs.readdir dir, (err, list) ->
        return done(err) if (err)
        i = 0

        next = ->
            file = list[i++]

            return done(null, results) if not file

            file = dir + '/' + file
            
            fs.stat file, (err, stat) ->
                if stat and stat.isDirectory()
                  walk file, (err, res) ->
                    results = results.concat(res)
                    next()                  
                else
                  results.push(file)
                  next()
        next()

exec = require('child_process').exec

task "tmpl", "Compile handlebars templates", (options) ->
    walk "./", (err, files) ->
        for file in files
            if file.match(/\.tmpl$/)
                exec "handlebars #{file} -f #{file}.js -k each -k if -k unless"