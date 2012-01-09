// File: ./lib/zepto.min.js
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
(function(a){String.prototype.trim===a&&(String.prototype.trim=function(){return this.replace(/^\s+/,"").replace(/\s+$/,"")}),Array.prototype.reduce===a&&(Array.prototype.reduce=function(b){if(this===void 0||this===null)throw new TypeError;var c=Object(this),d=c.length>>>0,e=0,f;if(typeof b!="function")throw new TypeError;if(d==0&&arguments.length==1)throw new TypeError;if(arguments.length>=2)f=arguments[1];else do{if(e in c){f=c[e++];break}if(++e>=d)throw new TypeError}while(!0);while(e<d)e in c&&(f=b.call(a,f,c[e],e,c)),e++;return f})})();var Zepto=function(){function v(a){return{}.toString.call(a)=="[object Function]"}function w(a){return a instanceof Object}function x(a){return a instanceof Array}function y(a){return typeof a.length=="number"}function z(b){return b.filter(function(b){return b!==a&&b!==null})}function A(a){return a.length>0?[].concat.apply([],a):a}function B(a){return a.replace(/-+(.)?/g,function(a,b){return b?b.toUpperCase():""})}function C(a){return a.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/_/g,"-").toLowerCase()}function D(a){return a.filter(function(a,b,c){return c.indexOf(a)==b})}function E(a){return a in i?i[a]:i[a]=new RegExp("(^|\\s)"+a+"(\\s|$)")}function F(a,b){return typeof b=="number"&&!k[C(a)]?b+"px":b}function G(a){var b,c;return h[a]||(b=g.createElement(a),g.body.appendChild(b),c=j(b,"").getPropertyValue("display"),b.parentNode.removeChild(b),c=="none"&&(c="block"),h[a]=c),h[a]}function H(b,c){c===a&&l.test(b)&&RegExp.$1,c in q||(c="*");var d=q[c];return d.innerHTML=""+b,f.call(d.childNodes)}function I(a,b){return a=a||e,a.__proto__=I.prototype,a.selector=b||"",a}function J(b,d){if(!b)return I();if(d!==a)return J(d).find(b);if(v(b))return J(g).ready(b);if(b instanceof I)return b;var e;return x(b)?e=z(b):m.indexOf(b.nodeType)>=0||b===window?(e=[b],b=null):l.test(b)?(e=H(b.trim(),RegExp.$1),b=null):b.nodeType&&b.nodeType==3?e=[b]:e=c(g,b),I(e,b)}function K(b,c){return c===a?J(b):J(b).filter(c)}function L(a,b,c,d){return v(b)?b.call(a,c,d):b}function M(a,b,c){var d=a%2?b:b.parentNode;d&&d.insertBefore(c,a?a==1?d.firstChild:a==2?b:null:b.nextSibling)}function N(a,b){b(a);for(var c in a.childNodes)N(a.childNodes[c],b)}var a,b,c,d,e=[],f=e.slice,g=window.document,h={},i={},j=g.defaultView.getComputedStyle,k={"column-count":1,columns:1,"font-weight":1,"line-height":1,opacity:1,"z-index":1,zoom:1},l=/^\s*<(\w+)[^>]*>/,m=[1,9,11],n=["after","prepend","before","append"],o=g.createElement("table"),p=g.createElement("tr"),q={tr:g.createElement("tbody"),tbody:o,thead:o,tfoot:o,td:p,th:p,"*":g.createElement("div")},r=/complete|loaded|interactive/,s=/^\.([\w-]+)$/,t=/^#([\w-]+)$/,u=/^[\w-]+$/;return J.extend=function(a){return f.call(arguments,1).forEach(function(c){for(b in c)a[b]=c[b]}),a},J.qsa=c=function(a,b){var c;return a===g&&t.test(b)?(c=a.getElementById(RegExp.$1))?[c]:e:f.call(s.test(b)?a.getElementsByClassName(RegExp.$1):u.test(b)?a.getElementsByTagName(b):a.querySelectorAll(b))},J.isFunction=v,J.isObject=w,J.isArray=x,J.map=function(a,b){var c,d=[],e,f;if(y(a))for(e=0;e<a.length;e++)c=b(a[e],e),c!=null&&d.push(c);else for(f in a)c=b(a[f],f),c!=null&&d.push(c);return A(d)},J.each=function(a,b){var c,d;if(y(a)){for(c=0;c<a.length;c++)if(b(c,a[c])===!1)return a}else for(d in a)if(b(d,a[d])===!1)return a;return a},J.fn={forEach:e.forEach,reduce:e.reduce,push:e.push,indexOf:e.indexOf,concat:e.concat,map:function(a){return J.map(this,function(b,c){return a.call(b,c,b)})},slice:function(){return J(f.apply(this,arguments))},ready:function(a){return r.test(g.readyState)?a(J):g.addEventListener("DOMContentLoaded",function(){a(J)},!1),this},get:function(b){return b===a?this:this[b]},size:function(){return this.length},remove:function(){return this.each(function(){this.parentNode!=null&&this.parentNode.removeChild(this)})},each:function(a){return this.forEach(function(b,c){a.call(b,c,b)}),this},filter:function(a){return J([].filter.call(this,function(b){return b.parentNode&&c(b.parentNode,a).indexOf(b)>=0}))},end:function(){return this.prevObject||J()},andSelf:function(){return this.add(this.prevObject||J())},add:function(a,b){return J(D(this.concat(J(a,b))))},is:function(a){return this.length>0&&J(this[0]).filter(a).length>0},not:function(b){var c=[];if(v(b)&&b.call!==a)this.each(function(a){b.call(this,a)||c.push(this)});else{var d=typeof b=="string"?this.filter(b):y(b)&&v(b.item)?f.call(b):J(b);this.forEach(function(a){d.indexOf(a)<0&&c.push(a)})}return J(c)},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){var a=this[0];return a&&!w(a)?a:J(a)},last:function(){var a=this[this.length-1];return a&&!w(a)?a:J(a)},find:function(a){var b;return this.length==1?b=c(this[0],a):b=this.map(function(){return c(this,a)}),J(b)},closest:function(a,b){var d=this[0],e=c(b||g,a);e.length||(d=null);while(d&&e.indexOf(d)<0)d=d!==b&&d!==g&&d.parentNode;return J(d)},parents:function(a){var b=[],c=this;while(c.length>0)c=J.map(c,function(a){if((a=a.parentNode)&&a!==g&&b.indexOf(a)<0)return b.push(a),a});return K(b,a)},parent:function(a){return K(D(this.pluck("parentNode")),a)},children:function(a){return K(this.map(function(){return f.call(this.children)}),a)},siblings:function(a){return K(this.map(function(a,b){return f.call(b.parentNode.children).filter(function(a){return a!==b})}),a)},empty:function(){return this.each(function(){this.innerHTML=""})},pluck:function(a){return this.map(function(){return this[a]})},show:function(){return this.each(function(){this.style.display=="none"&&(this.style.display=null),j(this,"").getPropertyValue("display")=="none"&&(this.style.display=G(this.nodeName))})},replaceWith:function(a){return this.each(function(){J(this).before(a).remove()})},wrap:function(a){return this.each(function(){J(this).wrapAll(J(a)[0].cloneNode(!1))})},wrapAll:function(a){return this[0]&&(J(this[0]).before(a=J(a)),a.append(this)),this},unwrap:function(){return this.parent().each(function(){J(this).replaceWith(J(this).children())}),this},hide:function(){return this.css("display","none")},toggle:function(b){return(b===a?this.css("display")=="none":b)?this.show():this.hide()},prev:function(){return J(this.pluck("previousElementSibling"))},next:function(){return J(this.pluck("nextElementSibling"))},html:function(b){return b===a?this.length>0?this[0].innerHTML:null:this.each(function(a){var c=this.innerHTML;J(this).empty().append(L(this,b,a,c))})},text:function(b){return b===a?this.length>0?this[0].textContent:null:this.each(function(){this.textContent=b})},attr:function(c,d){var e;return typeof c=="string"&&d===a?this.length==0?a:c=="value"&&this[0].nodeName=="INPUT"?this.val():!(e=this[0].getAttribute(c))&&c in this[0]?this[0][c]:e:this.each(function(a){if(w(c))for(b in c)this.setAttribute(b,c[b]);else this.setAttribute(c,L(this,d,a,this.getAttribute(c)))})},removeAttr:function(a){return this.each(function(){this.removeAttribute(a)})},data:function(a,b){return this.attr("data-"+a,b)},val:function(b){return b===a?this.length>0?this[0].value:null:this.each(function(a){this.value=L(this,b,a,this.value)})},offset:function(){if(this.length==0)return null;var a=this[0].getBoundingClientRect();return{left:a.left+window.pageXOffset,top:a.top+window.pageYOffset,width:a.width,height:a.height}},css:function(c,d){if(d===a&&typeof c=="string")return this.length==0?a:this[0].style[B(c)]||j(this[0],"").getPropertyValue(c);var e="";for(b in c)e+=C(b)+":"+F(b,c[b])+";";return typeof c=="string"&&(e=C(c)+":"+F(c,d)),this.each(function(){this.style.cssText+=";"+e})},index:function(a){return a?this.indexOf(J(a)[0]):this.parent().children().indexOf(this[0])},hasClass:function(a){return this.length<1?!1:E(a).test(this[0].className)},addClass:function(a){return this.each(function(b){d=[];var c=this.className,e=L(this,a,b,c);e.split(/\s+/g).forEach(function(a){J(this).hasClass(a)||d.push(a)},this),d.length&&(this.className+=(c?" ":"")+d.join(" "))})},removeClass:function(b){return this.each(function(c){if(b===a)return this.className="";d=this.className,L(this,b,c,d).split(/\s+/g).forEach(function(a){d=d.replace(E(a)," ")}),this.className=d.trim()})},toggleClass:function(b,c){return this.each(function(d){var e=L(this,b,d,this.className);(c===a?!J(this).hasClass(e):c)?J(this).addClass(e):J(this).removeClass(e)})}},"filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings".split(",").forEach(function(a){var b=J.fn[a];J.fn[a]=function(){var a=b.apply(this,arguments);return a.prevObject=this,a}}),["width","height"].forEach(function(b){J.fn[b]=function(c){var d,e=b.replace(/./,function(a){return a[0].toUpperCase()});return c===a?this[0]==window?window["inner"+e]:this[0]==g?g.documentElement["offset"+e]:(d=this.offset())&&d[b]:this.each(function(a){var d=J(this);d.css(b,L(this,c,a,d[b]()))})}}),n.forEach(function(a,b){J.fn[a]=function(a){var c=w(a)?a:H(a);if(!("length"in c)||c.nodeType)c=[c];if(c.length<1)return this;var d=this.length,e=d>1,f=b<2;return this.each(function(a,g){for(var h=0;h<c.length;h++){var i=c[f?c.length-h-1:h];N(i,function(a){a.nodeName!=null&&a.nodeName.toUpperCase()==="SCRIPT"&&(!a.type||a.type==="text/javascript")&&window.eval.call(window,a.innerHTML)}),e&&a<d-1&&(i=i.cloneNode(!0)),M(b,g,i)}})};var c=b%2?a+"To":"insert"+(b?"Before":"After");J.fn[c]=function(b){return J(b)[a](this),this}}),I.prototype=J.fn,J}();window.Zepto=Zepto,"$"in window||(window.$=Zepto),function(a){function f(a){return a._zid||(a._zid=d++)}function g(a,b,d,e){b=h(b);if(b.ns)var g=i(b.ns);return(c[f(a)]||[]).filter(function(a){return a&&(!b.e||a.e==b.e)&&(!b.ns||g.test(a.ns))&&(!d||a.fn==d)&&(!e||a.sel==e)})}function h(a){var b=(""+a).split(".");return{e:b[0],ns:b.slice(1).sort().join(" ")}}function i(a){return new RegExp("(?:^| )"+a.replace(" "," .* ?")+"(?: |$)")}function j(b,c,d){a.isObject(b)?a.each(b,d):b.split(/\s/).forEach(function(a){d(a,c)})}function k(b,d,e,g,i){var k=f(b),l=c[k]||(c[k]=[]);j(d,e,function(c,d){var e=i&&i(d,c),f=e||d,j=function(a){var c=f.apply(b,[a].concat(a.data));return c===!1&&a.preventDefault(),c},k=a.extend(h(c),{fn:d,proxy:j,sel:g,del:e,i:l.length});l.push(k),b.addEventListener(k.e,j,!1)})}function l(a,b,d,e){var h=f(a);j(b||"",d,function(b,d){g(a,b,d,e).forEach(function(b){delete c[h][b.i],a.removeEventListener(b.e,b.proxy,!1)})})}function p(b){var c=a.extend({originalEvent:b},b);return a.each(o,function(a,d){c[a]=function(){return this[d]=m,b[a].apply(b,arguments)},c[d]=n}),c}function q(a){if(!("defaultPrevented"in a)){a.defaultPrevented=!1;var b=a.preventDefault;a.preventDefault=function(){this.defaultPrevented=!0,b.call(this)}}}var b=a.qsa,c={},d=1,e={};e.click=e.mousedown=e.mouseup=e.mousemove="MouseEvents",a.event={add:k,remove:l},a.fn.bind=function(a,b){return this.each(function(){k(this,a,b)})},a.fn.unbind=function(a,b){return this.each(function(){l(this,a,b)})},a.fn.one=function(a,b){return this.each(function(c,d){k(this,a,b,null,function(a,b){return function(){var c=a.apply(d,arguments);return l(d,b,a),c}})})};var m=function(){return!0},n=function(){return!1},o={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"};a.fn.delegate=function(b,c,d){return this.each(function(e,f){k(f,c,d,b,function(c){return function(d){var e,g=a(d.target).closest(b,f).get(0);if(g)return e=a.extend(p(d),{currentTarget:g,liveFired:f}),c.apply(g,[e].concat([].slice.call(arguments,1)))}})})},a.fn.undelegate=function(a,b,c){return this.each(function(){l(this,b,c,a)})},a.fn.live=function(b,c){return a(document.body).delegate(this.selector,b,c),this},a.fn.die=function(b,c){return a(document.body).undelegate(this.selector,b,c),this},a.fn.on=function(b,c,d){return c===undefined||a.isFunction(c)?this.bind(b,c):this.delegate(c,b,d)},a.fn.off=function(b,c,d){return c===undefined||a.isFunction(c)?this.unbind(b,c):this.undelegate(c,b,d)},a.fn.trigger=function(b,c){return typeof b=="string"&&(b=a.Event(b)),q(b),b.data=c,this.each(function(){this.dispatchEvent(b)})},a.fn.triggerHandler=function(b,c){var d,e;return this.each(function(f,h){d=p(typeof b=="string"?a.Event(b):b),d.data=c,d.target=h,a.each(g(h,b.type||b),function(a,b){e=b.proxy(d);if(d.isImmediatePropagationStopped())return!1})}),e},"focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout change select keydown keypress keyup error".split(" ").forEach(function(b){a.fn[b]=function(a){return this.bind(b,a)}}),["focus","blur"].forEach(function(b){a.fn[b]=function(a){if(a)this.bind(b,a);else if(this.length)try{this.get(0)[b]()}catch(c){}return this}}),a.Event=function(a,b){var c=document.createEvent(e[a]||"Events"),d=!0;if(b)for(var f in b)f=="bubbles"?d=!!b[f]:c[f]=b[f];return c.initEvent(a,d,!0,null,null,null,null,null,null,null,null,null,null,null,null),c}}(Zepto),function(a){function b(a){var b=this.os={},c=this.browser={},d=a.match(/WebKit\/([\d.]+)/),e=a.match(/(Android)\s+([\d.]+)/),f=a.match(/(iPad).*OS\s([\d_]+)/),g=!f&&a.match(/(iPhone\sOS)\s([\d_]+)/),h=a.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),i=h&&a.match(/TouchPad/),j=a.match(/(BlackBerry).*Version\/([\d.]+)/);d&&(c.version=d[1]),c.webkit=!!d,e&&(b.android=!0,b.version=e[2]),g&&(b.ios=!0,b.version=g[2].replace(/_/g,"."),b.iphone=!0),f&&(b.ios=!0,b.version=f[2].replace(/_/g,"."),b.ipad=!0),h&&(b.webos=!0,b.version=h[2]),i&&(b.touchpad=!0),j&&(b.blackberry=!0,b.version=j[2])}b.call(a,navigator.userAgent),a.__detect=b}(Zepto),function(a,b){function k(a){return a.toLowerCase()}function l(a){return d?d+a:k(a)}var c="",d,e,f,g={Webkit:"webkit",Moz:"",O:"o",ms:"MS"},h=window.document,i=h.createElement("div"),j=/^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i;a.each(g,function(a,e){if(i.style[a+"TransitionProperty"]!==b)return c="-"+k(a)+"-",d=e,!1}),a.fx={off:d===b&&i.style.transitionProperty===b,cssPrefix:c,transitionEnd:l("TransitionEnd"),animationEnd:l("AnimationEnd")},a.fn.animate=function(b,c,d,e){return a.isObject(c)&&(d=c.easing,e=c.complete,c=c.duration),c&&(c/=1e3),this.anim(b,c,d,e)},a.fn.anim=function(d,e,f,g){var h,i={},k,l=this,m,n=a.fx.transitionEnd;e===b&&(e=.4),a.fx.off&&(e=0);if(typeof d=="string")i[c+"animation-name"]=d,i[c+"animation-duration"]=e+"s",n=a.fx.animationEnd;else{for(k in d)j.test(k)?(h||(h=[]),h.push(k+"("+d[k]+")")):i[k]=d[k];h&&(i[c+"transform"]=h.join(" ")),a.fx.off||(i[c+"transition"]="all "+e+"s "+(f||""))}return m=function(){var b={};b[c+"transition"]=b[c+"animation-name"]="none",a(this).css(b),g&&g.call(this)},e>0&&this.one(n,m),setTimeout(function(){l.css(i),e<=0&&setTimeout(function(){l.each(function(){m.call(this)})},0)},0),this},i=null}(Zepto),function(a){function g(b,c,d){var e=a.Event(c);return a(b).trigger(e,d),!e.defaultPrevented}function h(a,b,c,e){if(a.global)return g(b||d,c,e)}function i(b){b.global&&a.active++===0&&h(b,null,"ajaxStart")}function j(b){b.global&&!--a.active&&h(b,null,"ajaxStop")}function k(a,b){var c=b.context;if(b.beforeSend.call(c,a,b)===!1||h(b,c,"ajaxBeforeSend",[a,b])===!1)return!1;h(b,c,"ajaxSend",[a,b])}function l(a,b,c){var d=c.context,e="success";c.success.call(d,a,e,b),h(c,d,"ajaxSuccess",[b,c,a]),n(e,b,c)}function m(a,b,c,d){var e=d.context;d.error.call(e,c,b,a),h(d,e,"ajaxError",[c,d,a]),n(b,c,d)}function n(a,b,c){var d=c.context;c.complete.call(d,b,a),h(c,d,"ajaxComplete",[b,c]),j(c)}function o(){}function q(b,d,e,f){var g=a.isArray(d);a.each(d,function(d,h){f&&(d=e?f:f+"["+(g?"":d)+"]"),!f&&g?b.add(h.name,h.value):(e?a.isArray(h):c(h))?q(b,h,e,d):b.add(d,h)})}var b=0,c=a.isObject,d=window.document,e,f;a.active=0,a.ajaxJSONP=function(c){var e="jsonp"+ ++b,f=d.createElement("script"),g=function(){a(f).remove(),e in window&&(window[e]=o),n(h,c,"abort")},h={abort:g},i;return window[e]=function(b){clearTimeout(i),a(f).remove(),delete window[e],l(b,h,c)},f.src=c.url.replace(/=\?/,"="+e),a("head").append(f),c.timeout>0&&(i=setTimeout(function(){h.abort(),n(h,c,"timeout")},c.timeout)),h},a.ajaxSettings={type:"GET",beforeSend:o,success:o,error:o,complete:o,context:null,global:!0,xhr:function(){return new window.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript",json:"application/json",xml:"application/xml, text/xml",html:"text/html",text:"text/plain"},crossDomain:!1,timeout:0},a.ajax=function(b){var d=a.extend({},b||{});for(e in a.ajaxSettings)d[e]===undefined&&(d[e]=a.ajaxSettings[e]);i(d),d.crossDomain||(d.crossDomain=/^([\w-]+:)?\/\/([^\/]+)/.test(d.url)&&RegExp.$2!=window.location.host);if(/=\?/.test(d.url))return a.ajaxJSONP(d);d.url||(d.url=window.location.toString()),d.data&&!d.contentType&&(d.contentType="application/x-www-form-urlencoded"),c(d.data)&&(d.data=a.param(d.data));if(d.type.match(/get/i)&&d.data){var g=d.data;d.url.match(/\?.*=/)?g="&"+g:g[0]!="?"&&(g="?"+g),d.url+=g}var h=d.accepts[d.dataType],j={},n=/^([\w-]+:)\/\//.test(d.url)?RegExp.$1:window.location.protocol,p=a.ajaxSettings.xhr(),q;d.crossDomain||(j["X-Requested-With"]="XMLHttpRequest"),h&&(j.Accept=h),d.headers=a.extend(j,d.headers||{}),p.onreadystatechange=function(){if(p.readyState==4){clearTimeout(q);var a,b=!1;if(p.status>=200&&p.status<300||p.status==0&&n=="file:"){if(h=="application/json"&&!/^\s*$/.test(p.responseText))try{a=JSON.parse(p.responseText)}catch(c){b=c}else a=p.responseText;b?m(b,"parsererror",p,d):l(a,p,d)}else m(null,"error",p,d)}},p.open(d.type,d.url,!0),d.contentType&&(d.headers["Content-Type"]=d.contentType);for(f in d.headers)p.setRequestHeader(f,d.headers[f]);return k(p,d)===!1?(p.abort(),!1):(d.timeout>0&&(q=setTimeout(function(){p.onreadystatechange=o,p.abort(),m(null,"timeout",p,d)},d.timeout)),p.send(d.data),p)},a.get=function(b,c){return a.ajax({url:b,success:c})},a.post=function(b,c,d,e){return a.isFunction(c)&&(e=e||d,d=c,c=null),a.ajax({type:"POST",url:b,data:c,success:d,dataType:e})},a.getJSON=function(b,c){return a.ajax({url:b,success:c,dataType:"json"})},a.fn.load=function(b,c){if(!this.length)return this;var e=this,f=b.split(/\s/),g;return f.length>1&&(b=f[0],g=f[1]),a.get(b,function(b){e.html(g?a(d.createElement("div")).html(b).find(g).html():b),c&&c.call(e)}),this};var p=encodeURIComponent;a.param=function(a,b){var c=[];return c.add=function(a,b){this.push(p(a)+"="+p(b))},q(c,a,b),c.join("&").replace("%20","+")}}(Zepto),function(a){a.fn.serializeArray=function(){var b=[],c;return a(Array.prototype.slice.call(this.get(0).elements)).each(function(){c=a(this);var d=c.attr("type");!this.disabled&&d!="submit"&&d!="reset"&&d!="button"&&(d!="radio"&&d!="checkbox"||this.checked)&&b.push({name:c.attr("name"),value:c.val()})}),b},a.fn.serialize=function(){var a=[];return this.serializeArray().forEach(function(b){a.push(encodeURIComponent(b.name)+"="+encodeURIComponent(b.value))}),a.join("&")},a.fn.submit=function(b){if(b)this.bind("submit",b);else if(this.length){var c=a.Event("submit");this.eq(0).trigger(c),c.defaultPrevented||this.get(0).submit()}return this}}(Zepto),function(a){function d(a){return"tagName"in a?a:a.parentNode}function e(a,b,c,d){var e=Math.abs(a-b),f=Math.abs(c-d);return e>=f?a-b>0?"Left":"Right":c-d>0?"Up":"Down"}function g(){b.last&&Date.now()-b.last>=f&&(a(b.target).trigger("longTap"),b={})}var b={},c,f=750;a(document).ready(function(){a(document.body).bind("touchstart",function(a){var e=Date.now(),h=e-(b.last||e);b.target=d(a.touches[0].target),c&&clearTimeout(c),b.x1=a.touches[0].pageX,b.y1=a.touches[0].pageY,h>0&&h<=250&&(b.isDoubleTap=!0),b.last=e,setTimeout(g,f)}).bind("touchmove",function(a){b.x2=a.touches[0].pageX,b.y2=a.touches[0].pageY}).bind("touchend",function(d){b.isDoubleTap?(a(b.target).trigger("doubleTap"),b={}):b.x2>0||b.y2>0?((Math.abs(b.x1-b.x2)>30||Math.abs(b.y1-b.y2)>30)&&a(b.target).trigger("swipe")&&a(b.target).trigger("swipe"+e(b.x1,b.x2,b.y1,b.y2)),b.x1=b.x2=b.y1=b.y2=b.last=0):"last"in b&&(c=setTimeout(function(){c=null,a(b.target).trigger("tap"),b={}},250))}).bind("touchcancel",function(){b={}})}),["swipe","swipeLeft","swipeRight","swipeUp","swipeDown","doubleTap","tap","longTap"].forEach(function(b){a.fn[b]=function(a){return this.bind(b,a)}})}(Zepto)

// File: ./lib/store.js
/* Copyright (c) 2010-2011 Marcus Westin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var store = (function(){
	var api = {},
		win = window,
		doc = win.document,
		localStorageName = 'localStorage',
		globalStorageName = 'globalStorage',
		namespace = '__storejs__',
		storage

	api.disabled = false
	api.set = function(key, value) {}
	api.get = function(key) {}
	api.remove = function(key) {}
	api.clear = function() {}
	api.transact = function(key, transactionFn) {
		var val = api.get(key)
		if (typeof val == 'undefined') { val = {} }
		transactionFn(val)
		api.set(key, val)
	}

	api.serialize = function(value) {
		return JSON.stringify(value)
	}
	api.deserialize = function(value) {
		if (typeof value === "undefined" || typeof value != 'string' || value === "undefined" || value === "null") { return undefined }        
		return JSON.parse(value)
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior 
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}
	
	function isGlobalStorageNameSupported() {
		try { return (globalStorageName in win && win[globalStorageName] && win[globalStorageName][win.location.hostname]) }
		catch(err) { return false }
	}	

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		api.set = function(key, val) { 
			if (typeof val === "undefined" || val === null)
				api.remove(key)
			else
				storage.setItem(key, api.serialize(val)) 			
		}
		api.get = function(key) { return api.deserialize(storage.getItem(key)) }
		api.remove = function(key) { storage.removeItem(key) }
		api.clear = function() { storage.clear() }

	} else if (isGlobalStorageNameSupported()) {
		storage = win[globalStorageName][win.location.hostname]
		api.set = function(key, val) { storage[key] = api.serialize(val) }
		api.get = function(key) { return api.deserialize(storage[key] && storage[key].value) }
		api.remove = function(key) { delete storage[key] }
		api.clear = function() { for (var key in storage ) { delete storage[key] } }

	} else if (doc.documentElement.addBehavior) {
		var storage = doc.createElement('div')
		function withIEStorage(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				doc.body.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(api, args)
				doc.body.removeChild(storage)
				return result
			}
		}
		api.set = withIEStorage(function(storage, key, val) {
			storage.setAttribute(key, api.serialize(val))
			storage.save(localStorageName)
		})
		api.get = withIEStorage(function(storage, key) {
			return api.deserialize(storage.getAttribute(key))
		})
		api.remove = withIEStorage(function(storage, key) {
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		api.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=0, attr; attr = attributes[i]; i++) {
				storage.removeAttribute(attr.name)
			}
			storage.save(localStorageName)
		})
	}
	
	try {
		api.set(namespace, namespace)
		if (api.get(namespace) != namespace) { api.disabled = true }
		api.remove(namespace)
	} catch(e) {
		api.disabled = true
	}
	
	return api
})();

if (typeof module != 'undefined') { module.exports = store }

// File: ./lib/underscore-min.js
// Underscore.js 1.2.0
// (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){function q(a,c,d){if(a===c)return a!==0||1/a==1/c;if(a==null)return a===c;var e=typeof a;if(e!=typeof c)return false;if(!a!=!c)return false;if(b.isNaN(a))return b.isNaN(c);var f=b.isString(a),g=b.isString(c);if(f||g)return f&&g&&String(a)==String(c);f=b.isNumber(a);g=b.isNumber(c);if(f||g)return f&&g&&+a==+c;f=b.isBoolean(a);g=b.isBoolean(c);if(f||g)return f&&g&&+a==+c;f=b.isDate(a);g=b.isDate(c);if(f||g)return f&&g&&a.getTime()==c.getTime();f=b.isRegExp(a);g=b.isRegExp(c);if(f||g)return f&&
g&&a.source==c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase;if(e!="object")return false;if(a._chain)a=a._wrapped;if(c._chain)c=c._wrapped;if(b.isFunction(a.isEqual))return a.isEqual(c);for(e=d.length;e--;)if(d[e]==a)return true;d.push(a);e=0;f=true;if(a.length===+a.length||c.length===+c.length){if(e=a.length,f=e==c.length)for(;e--;)if(!(f=e in a==e in c&&q(a[e],c[e],d)))break}else{for(var h in a)if(l.call(a,h)&&(e++,!(f=l.call(c,h)&&q(a[h],c[h],d))))break;if(f){for(h in c)if(l.call(c,
h)&&!e--)break;f=!e}}d.pop();return f}var r=this,F=r._,n={},k=Array.prototype,o=Object.prototype,i=k.slice,G=k.unshift,u=o.toString,l=o.hasOwnProperty,v=k.forEach,w=k.map,x=k.reduce,y=k.reduceRight,z=k.filter,A=k.every,B=k.some,p=k.indexOf,C=k.lastIndexOf,o=Array.isArray,H=Object.keys,s=Function.prototype.bind,b=function(a){return new m(a)};typeof module!=="undefined"&&module.exports?(module.exports=b,b._=b):r._=b;b.VERSION="1.2.0";var j=b.each=b.forEach=function(a,c,b){if(a!=null)if(v&&a.forEach===
v)a.forEach(c,b);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(b,a[e],e,a)===n)break}else for(e in a)if(l.call(a,e)&&c.call(b,a[e],e,a)===n)break};b.map=function(a,c,b){var e=[];if(a==null)return e;if(w&&a.map===w)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=d!==void 0;a==null&&(a=[]);if(x&&a.reduce===x)return e&&(c=b.bind(c,e)),f?a.reduce(c,d):a.reduce(c);j(a,function(a,b,i){f?d=c.call(e,
d,a,b,i):(d=a,f=true)});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){a==null&&(a=[]);if(y&&a.reduceRight===y)return e&&(c=b.bind(c,e)),d!==void 0?a.reduceRight(c,d):a.reduceRight(c);a=(b.isArray(a)?a.slice():b.toArray(a)).reverse();return b.reduce(a,c,d,e)};b.find=b.detect=function(a,c,b){var e;D(a,function(a,g,h){if(c.call(b,a,g,h))return e=a,true});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;
if(z&&a.filter===z)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;if(A&&a.every===A)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,a,g,h)))return n});return e};var D=b.some=b.any=function(a,c,d){var c=c||b.identity,e=false;if(a==null)return e;if(B&&a.some===B)return a.some(c,
d);j(a,function(a,b,h){if(e|=c.call(d,a,b,h))return n});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(p&&a.indexOf===p)return a.indexOf(c)!=-1;D(a,function(a){if(b=a===c)return true});return b};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,function(a){return(c.call?c||a:a[c]).apply(a,d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a))return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;
var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a))return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var c=[],b;j(a,function(a,f){f==0?c[0]=a:(b=Math.floor(Math.random()*(f+1)),c[f]=c[b],c[b]=a)});return c};b.sortBy=function(a,
c,d){return b.pluck(b.map(a,function(a,b,g){return{value:a,criteria:c.call(d,a,b,g)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,b){var d={};j(a,function(a,f){var g=b(a,f);(d[g]||(d[g]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:a.toArray?a.toArray():b.isArray(a)?i.call(a):b.isArguments(a)?i.call(a):
b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=b.head=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=null&&!d?i.call(a,a.length-b):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a){return b.reduce(a,function(a,d){if(b.isArray(d))return a.concat(b.flatten(d));
a[a.length]=d;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,e=[];b.reduce(d,function(d,g,h){if(0==h||(c===true?b.last(d)!=g:!b.include(d,g)))d[d.length]=g,e[e.length]=a[h];return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};
b.difference=function(a,c){return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d)return d=b.sortedIndex(a,c),a[d]===c?d:-1;if(p&&a.indexOf===p)return a.indexOf(c);for(d=0,e=a.length;d<e;d++)if(a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(C&&a.lastIndexOf===C)return a.lastIndexOf(b);
for(var d=a.length;d--;)if(a[d]===b)return d;return-1};b.range=function(a,b,d){arguments.length<=1&&(b=a||0,a=0);for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;)g[f++]=a,a+=d;return g};b.bind=function(a,b){if(a.bind===s&&s)return s.apply(a,i.call(arguments,1));var d=i.call(arguments,2);return function(){return a.apply(b,d.concat(i.call(arguments)))}};b.bindAll=function(a){var c=i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});
return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var b=c.apply(this,arguments);return l.call(d,b)?d[b]:d[b]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(a,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};var E=function(a,b,d){var e;return function(){var f=this,g=arguments,h=function(){e=null;a.apply(f,g)};d&&clearTimeout(e);if(d||!e)e=setTimeout(h,b)}};b.throttle=
function(a,b){return E(a,b,false)};b.debounce=function(a,b){return E(a,b,true)};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments));return b.apply(this,d)}};b.compose=function(){var a=i.call(arguments);return function(){for(var b=i.call(arguments),d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return function(){if(--a<1)return b.apply(this,
arguments)}};b.keys=H||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[],d;for(d in a)l.call(a,d)&&(b[b.length]=d);return b};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)b[d]!==void 0&&(a[d]=b[d])});return a};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=
b[d])});return a};b.clone=function(a){return b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return q(a,b,[])};b.isEmpty=function(a){if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(l.call(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=o||function(a){return u.call(a)==="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return!(!a||!l.call(a,"callee"))};
b.isFunction=function(a){return!(!a||!a.constructor||!a.call||!a.apply)};b.isString=function(a){return!!(a===""||a&&a.charCodeAt&&a.substr)};b.isNumber=function(a){return!!(a===0||a&&a.toExponential&&a.toFixed)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||u.call(a)=="[object Boolean]"};b.isDate=function(a){return!(!a||!a.getTimezoneOffset||!a.setUTCFullYear)};b.isRegExp=function(a){return!(!a||!a.test||!a.exec||!(a.ignoreCase||a.ignoreCase===false))};b.isNull=
function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.noConflict=function(){r._=F;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.mixin=function(a){j(b.functions(a),function(c){I(c,b[c]=a[c])})};var J=0;b.uniqueId=function(a){var b=
J++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};b.template=function(a,c){var d=b.templateSettings,d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.escape,function(a,b){return"',_.escape("+b.replace(/\\'/g,"'")+"),'"}).replace(d.interpolate,function(a,b){return"',"+b.replace(/\\'/g,"'")+",'"}).replace(d.evaluate||null,function(a,
b){return"');"+b.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');",d=new Function("obj",d);return c?d(c):d};var m=function(a){this._wrapped=a};b.prototype=m.prototype;var t=function(a,c){return c?b(a).chain():a},I=function(a,c){m.prototype[a]=function(){var a=i.call(arguments);G.call(a,this._wrapped);return t(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),
function(a){var b=k[a];m.prototype[a]=function(){b.apply(this._wrapped,arguments);return t(this._wrapped,this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];m.prototype[a]=function(){return t(b.apply(this._wrapped,arguments),this._chain)}});m.prototype.chain=function(){this._chain=true;return this};m.prototype.value=function(){return this._wrapped}})();

// File: ./lib/backbone-min.js
// Backbone.js 0.5.3
// (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://documentcloud.github.com/backbone
(function(){var h=this,p=h.Backbone,e;e=typeof exports!=="undefined"?exports:h.Backbone={};e.VERSION="0.5.3";var f=h._;if(!f&&typeof require!=="undefined")f=require("underscore")._;var g=h.jQuery||h.Zepto;e.noConflict=function(){h.Backbone=p;return this};e.emulateHTTP=!1;e.emulateJSON=!1;e.Events={bind:function(a,b,c){var d=this._callbacks||(this._callbacks={});(d[a]||(d[a]=[])).push([b,c]);return this},unbind:function(a,b){var c;if(a){if(c=this._callbacks)if(b){c=c[a];if(!c)return this;for(var d=
0,e=c.length;d<e;d++)if(c[d]&&b===c[d][0]){c[d]=null;break}}else c[a]=[]}else this._callbacks={};return this},trigger:function(a){var b,c,d,e,f=2;if(!(c=this._callbacks))return this;for(;f--;)if(b=f?a:"all",b=c[b])for(var g=0,h=b.length;g<h;g++)(d=b[g])?(e=f?Array.prototype.slice.call(arguments,1):arguments,d[0].apply(d[1]||this,e)):(b.splice(g,1),g--,h--);return this}};e.Model=function(a,b){var c;a||(a={});if(c=this.defaults)f.isFunction(c)&&(c=c.call(this)),a=f.extend({},c,a);this.attributes={};
this._escapedAttributes={};this.cid=f.uniqueId("c");this.set(a,{silent:!0});this._changed=!1;this._previousAttributes=f.clone(this.attributes);if(b&&b.collection)this.collection=b.collection;this.initialize(a,b)};f.extend(e.Model.prototype,e.Events,{_previousAttributes:null,_changed:!1,idAttribute:"id",initialize:function(){},toJSON:function(){return f.clone(this.attributes)},get:function(a){return this.attributes[a]},escape:function(a){var b;if(b=this._escapedAttributes[a])return b;b=this.attributes[a];
return this._escapedAttributes[a]=(b==null?"":""+b).replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")},has:function(a){return this.attributes[a]!=null},set:function(a,b){b||(b={});if(!a)return this;if(a.attributes)a=a.attributes;var c=this.attributes,d=this._escapedAttributes;if(!b.silent&&this.validate&&!this._performValidation(a,b))return!1;if(this.idAttribute in a)this.id=a[this.idAttribute];
var e=this._changing;this._changing=!0;for(var g in a){var h=a[g];if(!f.isEqual(c[g],h))c[g]=h,delete d[g],this._changed=!0,b.silent||this.trigger("change:"+g,this,h,b)}!e&&!b.silent&&this._changed&&this.change(b);this._changing=!1;return this},unset:function(a,b){if(!(a in this.attributes))return this;b||(b={});var c={};c[a]=void 0;if(!b.silent&&this.validate&&!this._performValidation(c,b))return!1;delete this.attributes[a];delete this._escapedAttributes[a];a==this.idAttribute&&delete this.id;this._changed=
!0;b.silent||(this.trigger("change:"+a,this,void 0,b),this.change(b));return this},clear:function(a){a||(a={});var b,c=this.attributes,d={};for(b in c)d[b]=void 0;if(!a.silent&&this.validate&&!this._performValidation(d,a))return!1;this.attributes={};this._escapedAttributes={};this._changed=!0;if(!a.silent){for(b in c)this.trigger("change:"+b,this,void 0,a);this.change(a)}return this},fetch:function(a){a||(a={});var b=this,c=a.success;a.success=function(d,e,f){if(!b.set(b.parse(d,f),a))return!1;c&&
c(b,d)};a.error=i(a.error,b,a);return(this.sync||e.sync).call(this,"read",this,a)},save:function(a,b){b||(b={});if(a&&!this.set(a,b))return!1;var c=this,d=b.success;b.success=function(a,e,f){if(!c.set(c.parse(a,f),b))return!1;d&&d(c,a,f)};b.error=i(b.error,c,b);var f=this.isNew()?"create":"update";return(this.sync||e.sync).call(this,f,this,b)},destroy:function(a){a||(a={});if(this.isNew())return this.trigger("destroy",this,this.collection,a);var b=this,c=a.success;a.success=function(d){b.trigger("destroy",
b,b.collection,a);c&&c(b,d)};a.error=i(a.error,b,a);return(this.sync||e.sync).call(this,"delete",this,a)},url:function(){var a=k(this.collection)||this.urlRoot||l();if(this.isNew())return a;return a+(a.charAt(a.length-1)=="/"?"":"/")+encodeURIComponent(this.id)},parse:function(a){return a},clone:function(){return new this.constructor(this)},isNew:function(){return this.id==null},change:function(a){this.trigger("change",this,a);this._previousAttributes=f.clone(this.attributes);this._changed=!1},hasChanged:function(a){if(a)return this._previousAttributes[a]!=
this.attributes[a];return this._changed},changedAttributes:function(a){a||(a=this.attributes);var b=this._previousAttributes,c=!1,d;for(d in a)f.isEqual(b[d],a[d])||(c=c||{},c[d]=a[d]);return c},previous:function(a){if(!a||!this._previousAttributes)return null;return this._previousAttributes[a]},previousAttributes:function(){return f.clone(this._previousAttributes)},_performValidation:function(a,b){var c=this.validate(a);if(c)return b.error?b.error(this,c,b):this.trigger("error",this,c,b),!1;return!0}});
e.Collection=function(a,b){b||(b={});if(b.comparator)this.comparator=b.comparator;f.bindAll(this,"_onModelEvent","_removeReference");this._reset();a&&this.reset(a,{silent:!0});this.initialize.apply(this,arguments)};f.extend(e.Collection.prototype,e.Events,{model:e.Model,initialize:function(){},toJSON:function(){return this.map(function(a){return a.toJSON()})},add:function(a,b){if(f.isArray(a))for(var c=0,d=a.length;c<d;c++)this._add(a[c],b);else this._add(a,b);return this},remove:function(a,b){if(f.isArray(a))for(var c=
0,d=a.length;c<d;c++)this._remove(a[c],b);else this._remove(a,b);return this},get:function(a){if(a==null)return null;return this._byId[a.id!=null?a.id:a]},getByCid:function(a){return a&&this._byCid[a.cid||a]},at:function(a){return this.models[a]},sort:function(a){a||(a={});if(!this.comparator)throw Error("Cannot sort a set without a comparator");this.models=this.sortBy(this.comparator);a.silent||this.trigger("reset",this,a);return this},pluck:function(a){return f.map(this.models,function(b){return b.get(a)})},
reset:function(a,b){a||(a=[]);b||(b={});this.each(this._removeReference);this._reset();this.add(a,{silent:!0});b.silent||this.trigger("reset",this,b);return this},fetch:function(a){a||(a={});var b=this,c=a.success;a.success=function(d,f,e){b[a.add?"add":"reset"](b.parse(d,e),a);c&&c(b,d)};a.error=i(a.error,b,a);return(this.sync||e.sync).call(this,"read",this,a)},create:function(a,b){var c=this;b||(b={});a=this._prepareModel(a,b);if(!a)return!1;var d=b.success;b.success=function(a,e,f){c.add(a,b);
d&&d(a,e,f)};a.save(null,b);return a},parse:function(a){return a},chain:function(){return f(this.models).chain()},_reset:function(){this.length=0;this.models=[];this._byId={};this._byCid={}},_prepareModel:function(a,b){if(a instanceof e.Model){if(!a.collection)a.collection=this}else{var c=a;a=new this.model(c,{collection:this});a.validate&&!a._performValidation(c,b)&&(a=!1)}return a},_add:function(a,b){b||(b={});a=this._prepareModel(a,b);if(!a)return!1;var c=this.getByCid(a);if(c)throw Error(["Can't add the same model to a set twice",
c.id]);this._byId[a.id]=a;this._byCid[a.cid]=a;this.models.splice(b.at!=null?b.at:this.comparator?this.sortedIndex(a,this.comparator):this.length,0,a);a.bind("all",this._onModelEvent);this.length++;b.silent||a.trigger("add",a,this,b);return a},_remove:function(a,b){b||(b={});a=this.getByCid(a)||this.get(a);if(!a)return null;delete this._byId[a.id];delete this._byCid[a.cid];this.models.splice(this.indexOf(a),1);this.length--;b.silent||a.trigger("remove",a,this,b);this._removeReference(a);return a},
_removeReference:function(a){this==a.collection&&delete a.collection;a.unbind("all",this._onModelEvent)},_onModelEvent:function(a,b,c,d){(a=="add"||a=="remove")&&c!=this||(a=="destroy"&&this._remove(b,d),b&&a==="change:"+b.idAttribute&&(delete this._byId[b.previous(b.idAttribute)],this._byId[b.id]=b),this.trigger.apply(this,arguments))}});f.each(["forEach","each","map","reduce","reduceRight","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max",
"min","sortBy","sortedIndex","toArray","size","first","rest","last","without","indexOf","lastIndexOf","isEmpty","groupBy"],function(a){e.Collection.prototype[a]=function(){return f[a].apply(f,[this.models].concat(f.toArray(arguments)))}});e.Router=function(a){a||(a={});if(a.routes)this.routes=a.routes;this._bindRoutes();this.initialize.apply(this,arguments)};var q=/:([\w\d]+)/g,r=/\*([\w\d]+)/g,s=/[-[\]{}()+?.,\\^$|#\s]/g;f.extend(e.Router.prototype,e.Events,{initialize:function(){},route:function(a,
b,c){e.history||(e.history=new e.History);f.isRegExp(a)||(a=this._routeToRegExp(a));e.history.route(a,f.bind(function(d){d=this._extractParameters(a,d);c.apply(this,d);this.trigger.apply(this,["route:"+b].concat(d))},this))},navigate:function(a,b){e.history.navigate(a,b)},_bindRoutes:function(){if(this.routes){var a=[],b;for(b in this.routes)a.unshift([b,this.routes[b]]);b=0;for(var c=a.length;b<c;b++)this.route(a[b][0],a[b][1],this[a[b][1]])}},_routeToRegExp:function(a){a=a.replace(s,"\\$&").replace(q,
"([^/]*)").replace(r,"(.*?)");return RegExp("^"+a+"$")},_extractParameters:function(a,b){return a.exec(b).slice(1)}});e.History=function(){this.handlers=[];f.bindAll(this,"checkUrl")};var j=/^#*/,t=/msie [\w.]+/,m=!1;f.extend(e.History.prototype,{interval:50,getFragment:function(a,b){if(a==null)if(this._hasPushState||b){a=window.location.pathname;var c=window.location.search;c&&(a+=c);a.indexOf(this.options.root)==0&&(a=a.substr(this.options.root.length))}else a=window.location.hash;return decodeURIComponent(a.replace(j,
""))},start:function(a){if(m)throw Error("Backbone.history has already been started");this.options=f.extend({},{root:"/"},this.options,a);this._wantsPushState=!!this.options.pushState;this._hasPushState=!(!this.options.pushState||!window.history||!window.history.pushState);a=this.getFragment();var b=document.documentMode;if(b=t.exec(navigator.userAgent.toLowerCase())&&(!b||b<=7))this.iframe=g('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,this.navigate(a);
this._hasPushState?g(window).bind("popstate",this.checkUrl):"onhashchange"in window&&!b?g(window).bind("hashchange",this.checkUrl):setInterval(this.checkUrl,this.interval);this.fragment=a;m=!0;a=window.location;b=a.pathname==this.options.root;if(this._wantsPushState&&!this._hasPushState&&!b)return this.fragment=this.getFragment(null,!0),window.location.replace(this.options.root+"#"+this.fragment),!0;else if(this._wantsPushState&&this._hasPushState&&b&&a.hash)this.fragment=a.hash.replace(j,""),window.history.replaceState({},
document.title,a.protocol+"//"+a.host+this.options.root+this.fragment);if(!this.options.silent)return this.loadUrl()},route:function(a,b){this.handlers.unshift({route:a,callback:b})},checkUrl:function(){var a=this.getFragment();a==this.fragment&&this.iframe&&(a=this.getFragment(this.iframe.location.hash));if(a==this.fragment||a==decodeURIComponent(this.fragment))return!1;this.iframe&&this.navigate(a);this.loadUrl()||this.loadUrl(window.location.hash)},loadUrl:function(a){var b=this.fragment=this.getFragment(a);
return f.any(this.handlers,function(a){if(a.route.test(b))return a.callback(b),!0})},navigate:function(a,b){var c=(a||"").replace(j,"");if(!(this.fragment==c||this.fragment==decodeURIComponent(c))){if(this._hasPushState){var d=window.location;c.indexOf(this.options.root)!=0&&(c=this.options.root+c);this.fragment=c;window.history.pushState({},document.title,d.protocol+"//"+d.host+c)}else if(window.location.hash=this.fragment=c,this.iframe&&c!=this.getFragment(this.iframe.location.hash))this.iframe.document.open().close(),
this.iframe.location.hash=c;b&&this.loadUrl(a)}}});e.View=function(a){this.cid=f.uniqueId("view");this._configure(a||{});this._ensureElement();this.delegateEvents();this.initialize.apply(this,arguments)};var u=/^(\S+)\s*(.*)$/,n=["model","collection","el","id","attributes","className","tagName"];f.extend(e.View.prototype,e.Events,{tagName:"div",$:function(a){return g(a,this.el)},initialize:function(){},render:function(){return this},remove:function(){g(this.el).remove();return this},make:function(a,
b,c){a=document.createElement(a);b&&g(a).attr(b);c&&g(a).html(c);return a},delegateEvents:function(a){if(a||(a=this.events))for(var b in f.isFunction(a)&&(a=a.call(this)),g(this.el).unbind(".delegateEvents"+this.cid),a){var c=this[a[b]];if(!c)throw Error('Event "'+a[b]+'" does not exist');var d=b.match(u),e=d[1];d=d[2];c=f.bind(c,this);e+=".delegateEvents"+this.cid;d===""?g(this.el).bind(e,c):g(this.el).delegate(d,e,c)}},_configure:function(a){this.options&&(a=f.extend({},this.options,a));for(var b=
0,c=n.length;b<c;b++){var d=n[b];a[d]&&(this[d]=a[d])}this.options=a},_ensureElement:function(){if(this.el){if(f.isString(this.el))this.el=g(this.el).get(0)}else{var a=this.attributes||{};if(this.id)a.id=this.id;if(this.className)a["class"]=this.className;this.el=this.make(this.tagName,a)}}});e.Model.extend=e.Collection.extend=e.Router.extend=e.View.extend=function(a,b){var c=v(this,a,b);c.extend=this.extend;return c};var w={create:"POST",update:"PUT","delete":"DELETE",read:"GET"};e.sync=function(a,
b,c){var d=w[a];c=f.extend({type:d,dataType:"json"},c);if(!c.url)c.url=k(b)||l();if(!c.data&&b&&(a=="create"||a=="update"))c.contentType="application/json",c.data=JSON.stringify(b.toJSON());if(e.emulateJSON)c.contentType="application/x-www-form-urlencoded",c.data=c.data?{model:c.data}:{};if(e.emulateHTTP&&(d==="PUT"||d==="DELETE")){if(e.emulateJSON)c.data._method=d;c.type="POST";c.beforeSend=function(a){a.setRequestHeader("X-HTTP-Method-Override",d)}}if(c.type!=="GET"&&!e.emulateJSON)c.processData=
!1;return g.ajax(c)};var o=function(){},v=function(a,b,c){var d;d=b&&b.hasOwnProperty("constructor")?b.constructor:function(){return a.apply(this,arguments)};f.extend(d,a);o.prototype=a.prototype;d.prototype=new o;b&&f.extend(d.prototype,b);c&&f.extend(d,c);d.prototype.constructor=d;d.__super__=a.prototype;return d},k=function(a){if(!a||!a.url)return null;return f.isFunction(a.url)?a.url():a.url},l=function(){throw Error('A "url" property or function must be specified');},i=function(a,b,c){return function(d){a?
a(b,d,c):b.trigger("error",b,d,c)}}}).call(this);

// File: ./src/chromus.js
(function() {
  var Chromus, global;

  global = this;

  Chromus = (function() {

    Chromus.prototype.baseURL = "http://chromusapp-v2.appspot.com";

    Chromus.prototype.audio_players = {};

    Chromus.prototype.audio_sources = {};

    Chromus.prototype.media_types = {};

    Chromus.prototype.plugins = {};

    Chromus.prototype.plugins_info = {};

    Chromus.prototype.plugins_list = ['iframe_player', 'music_manager', 'ui', 'echonest', 'lastfm', 'loved_tracks_radio', 'vkontakte', 'about'];

    function Chromus() {
      _.bindAll(this);
      this.loadPlugins();
    }

    Chromus.prototype.injectPluginFiles = function() {
      var files, meta, plugin, _i, _len, _ref;
      files = [];
      _ref = this.plugins_list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plugin = _ref[_i];
        meta = this.plugins_info[plugin];
        files.push(_.map(meta['files'], function(file) {
          var match;
          match = file.match(/(.*!)?(.*)/);
          return "" + (match[1] || '') + meta.path + "/" + match[2] + "?" + (+new Date());
        }));
      }
      return yepnope({
        load: _.flatten(files),
        complete: this.pluginsLoadedCallback
      });
    };

    Chromus.prototype.loadPlugins = function() {
      var callback, plugin, _i, _len, _ref, _results;
      var _this = this;
      callback = _.after(this.plugins_list.length, this.injectPluginFiles);
      _ref = this.plugins_list;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plugin = _ref[_i];
        _results.push((function(plugin) {
          var package_path, plugin_path;
          plugin_path = browser.extension.getURL("/plugins/" + plugin);
          package_path = "" + plugin_path + "/package.json?" + (+new Date());
          if (global.debug || (typeof exports !== "undefined" && exports !== null)) {
            return $.getJSON(package_path, function(package) {
              _this.plugins_info[plugin] = package;
              _this.plugins_info[plugin].path = plugin_path;
              return callback();
            });
          } else {
            _this.plugins_info[plugin] = {};
            return _this.plugins_info[plugin].path = plugin_path;
          }
        })(plugin));
      }
      return _results;
    };

    Chromus.prototype.pluginsLoadedCallback = function() {
      if (typeof global.isTestMode === "function" ? global.isTestMode() : void 0) {
        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        return jasmine.getEnv().execute();
      }
    };

    Chromus.prototype.registerPlugin = function(name, context) {
      return this.plugins[name] = context;
    };

    Chromus.prototype.registerPlayer = function(name, context) {
      return this.audio_players[name] = context;
    };

    Chromus.prototype.registerAudioSource = function(name, context) {
      return this.audio_sources[name] = context;
    };

    Chromus.prototype.registerMediaType = function(name, context) {
      return this.media_types[name] = context;
    };

    Chromus.prototype.addMenu = function(el) {
      return $('#main_menu').append(el);
    };

    Chromus.prototype.openPanel = function(content) {
      var panel;
      panel = $('<div class="panel">').html(content).appendTo($("#wrapper")).delegate('.back', 'click', function() {
        panel.removeClass('show');
        return _.delay(function() {
          return panel.remove();
        }, 300);
      });
      _.defer(function() {
        return panel.addClass('show');
      });
      return panel;
    };

    Chromus.prototype.closePanel = function() {
      var latest_panel;
      latest_panel = _.last($('.panel'));
      return $(latest_panel).find('.back').trigger('click');
    };

    return Chromus;

  })();

  this.chromus = new Chromus();

  this.chromus.utils = {
    uid: function() {
      var _ref;
      if ((_ref = this.uid_start) == null) this.uid_start = +new Date();
      return this.uid_start++;
    }
  };

}).call(this);

// File: ./src/utils.js
function findParent(element, className){
    if (!element)
      return false;

    if(element.className && element.className.match(className))
        return element
    else
        return findParent(element.parentNode, className)
}

function findElementPosition(element){
    var curleft = 0;
    var curtop = 0;

    if (element.offsetParent) {
        while (element.offsetParent) {
            curleft += element.offsetLeft - element.scrollLeft;
            curtop += element.offsetTop - element.scrollTop;

            var position='';

            if (element.style && element.style.position)
              position = element.style.position.toLowerCase();

            if (!position)
               if (element.currentStyle && element.currentStyle.position)
                   position = element.currentStyle.position.toLowerCase();

            if ((position=='absolute')||(position=='relative')) break;

            while (element.parentNode != element.offsetParent) {   
                element = element.parentNode;
                curleft -= element.scrollLeft;
                curtop -= element.scrollTop;
            }

            element = element.offsetParent;
        }
    } else {
        if (obj.x)
            curleft += obj.x;
        if (obj.y)
            curtop += obj.y;
    }
    
    return {left:curleft,top:curtop};
}

function xhrRequest(url, method, data, callback){
    var xhr = new XMLHttpRequest()

    //console.debug('Sending request:', url+'?'+data)

    if(method == "POST"){
        xhr.open(method, url, true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send(data)
    } else {
        if(url.match(/\?/))
            xhr.open(method, url+'&'+data, true)
        else
            xhr.open(method, url+'?'+data, true)

        xhr.send()
    }

    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log("Response on "+url+" :", xhr, data)
//            console.log("Response text:", xhr.responseText)
            callback(xhr)
        }
    }
}

function xhrRedirectUrl(url, callback){    
    console.log("ASDASDASD")

    var xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.send()
    
    console.log("Sending redirect response:", url)

    xhr.onreadystatechange = function(){
        console.log("Redirect response:", xhr)
    }
}

function prettyTime(seconds){
    seconds = parseInt(seconds)

    var minutes = parseInt(seconds/60)

    var seconds = seconds % 60
    if(seconds < 10)
        seconds = "0"+seconds

    if(minutes < 10)
        minutes = " "+minutes

    return minutes + ":" + seconds
}

function timeToSeconds(time){
    time = time.split(':')

    return parseInt(time[0])*60 + parseInt(time[1])
}

String.prototype.replaceEntities = function(){
   return this.replace(/&amp;/g, '&').replace(/%27/g,"'") 
}

String.prototype.stripHTML = function(){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = this;
   return tmp.textContent||tmp.innerText;
}

Function.prototype.bind = function(scope) {
  var _function = this;
  
  return function() {
    return _function.apply(scope, arguments);
  }
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

Array.prototype.random = function() {
    return this[Math.floor(Math.random()*this.length)];
}

function getTrackInfo(button){
    if (button.getAttribute('data-media-type') == 'raw-file'){
        return {
            file_url: button.getAttribute('data-url'),
            source_url: document.location.href,      
            source_host: document.location.host,      
            song: button.innerHTML.stripHTML().trim() || "Loading track info...",
            element_id: button.id,
            index: 0
        }
    }

    var container = findParent(button, "ex_container");
    var streamable = false;

    if (container.className && container.className.match('fdl'))
        streamable = 'free';
    else if (container.className && container.className.match('streamable'))
        streamable = true;

    if (!window.pageID) {
        window.pageID = new Date().getTime();
    }

    var track_info = {
        artist:     container.getAttribute('data-artist'),
        song:       container.getAttribute('data-song'),
        album:      container.getAttribute('data-album'),
        track_id:   container.getAttribute('data-track-id'),
        index:      parseInt(container.getAttribute('data-index-number')),
        page_id:    window.pageID,
        source_url: document.location.href,      
        source_host: document.location.host,      
      
        element_id: button.id,
        streamable: streamable
    };

    if (!track_info.song) {
        if (!track_info.album) {
            track_info.type = "artist"
        } else {
            track_info.type = "album"
        }
    } else {
        track_info.type = "track"
    }


    for (var i; i < track_info.length; i++)
        if (track_info[i] == undefined) 
            delete track_info[i];
  
    return track_info
}


// Exporting functions for injected scripts in opera
window.getTrackInfo = getTrackInfo;
window.findParent = findParent;
// File: ./plugins/iframe_player/iframe_player.js
(function() {
  var Player;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Player = (function() {

    __extends(Player, Backbone.Model);

    function Player() {
      Player.__super__.constructor.apply(this, arguments);
    }

    Player.prototype.player_url = "http://chromusapp.appspot.com/";

    Player.prototype.initialize = function() {
      _.bindAll(this);
      this.path = chromus.plugins_info['iframe_player'].path;
      this.state = new Backbone.Model();
      return this.createFrame();
    };

    Player.prototype.createFrame = function() {
      this.player_frame = document.createElement("iframe");
      this.player_frame.id = 'player_frame';
      this.player_frame.style.display = 'none';
      if (!browser.isFrame && !browser.isSafari) {
        this.player_frame.src = this.player_url + "sm2_iframe";
      } else {
        this.player_frame.src = ("" + this.path + "/lib/iframe.htm?") + (+new Date());
      }
      document.body.appendChild(this.player_frame);
      this.player_ready = false;
      return window.addEventListener('message', this.listener, false);
    };

    Player.prototype.listener = function(evt) {
      var msg;
      if (!evt.data) return;
      msg = JSON.parse(evt.data);
      switch (msg.method) {
        case 'sm2:playerState':
          return this.state.set(msg.state);
        case 'sm2:ready':
          return this.player_ready = true;
        case 'sm2:finished':
          this.state.set({
            name: "stopped"
          });
          return this.state.unset('name', {
            silent: true
          });
      }
    };

    Player.prototype.postMessageToPlayer = function(data) {
      return this.player_frame.contentWindow.postMessage(JSON.stringify(data), '*');
    };

    Player.prototype.play = function(track) {
      this.state.unset('name', {
        silent: true
      });
      this.postMessageToPlayer({
        'method': 'play',
        'url': track.file_url,
        'track': track.id,
        'use_flash': track.use_flash
      });
      return this.setVolume();
    };

    Player.prototype.preload = function(track) {
      return this.postMessageToPlayer({
        'method': 'preload',
        'url': track.file_url,
        'track': track.id,
        'use_flash': track.use_flash
      });
    };

    Player.prototype.pause = function() {
      return this.postMessageToPlayer({
        'method': 'pause'
      });
    };

    Player.prototype.stop = function() {
      return this.postMessageToPlayer({
        'method': 'stop'
      });
    };

    Player.prototype.setVolume = function(value) {
      if (value == null) value = this.value;
      this.value = value != null ? value : 100;
      return this.postMessageToPlayer({
        'method': 'setVolume',
        'volume': this.value
      });
    };

    Player.prototype.setPosition = function(value) {
      return this.postMessageToPlayer({
        'method': 'setPosition',
        'position': value
      });
    };

    return Player;

  })();

  this.chromus.registerPlayer("iframe_player", new Player());

}).call(this);

// File: ./plugins/music_manager/music_manager.js
(function() {
  var MusicManager, Playlist, Track, music_manager;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Track = (function() {

    __extends(Track, Backbone.Model);

    function Track() {
      Track.__super__.constructor.apply(this, arguments);
    }

    Track.prototype.initialize = function() {
      return this.set({
        'id': !this.id ? chromus.utils.uid() : void 0
      });
    };

    Track.prototype.title = function() {
      return "" + (this.get('song')) + " — " + (this.get('artist'));
    };

    return Track;

  })();

  Playlist = (function() {

    __extends(Playlist, Backbone.Collection);

    function Playlist() {
      Playlist.__super__.constructor.apply(this, arguments);
    }

    Playlist.prototype.model = Track;

    return Playlist;

  })();

  MusicManager = (function() {

    __extends(MusicManager, Backbone.Model);

    function MusicManager() {
      MusicManager.__super__.constructor.apply(this, arguments);
    }

    MusicManager.prototype.initialize = function() {
      _.bindAll(this, "onPlaylistReset", "updateState");
      this.playlist = new Playlist();
      this.state = new Backbone.Model();
      this.settings = new Backbone.Model();
      this.playlist.bind('reset', this.onPlaylistReset);
      this.playlist.reset();
      this.setPlayer();
      return this.setVolume();
    };

    MusicManager.prototype.setPlayer = function(player) {
      if (player == null) player = 'iframe_player';
      if (this.player) this.player.state.unbind();
      this.player = chromus.audio_players[player];
      return this.player.state.bind('change', this.updateState);
    };

    MusicManager.prototype.onPlaylistReset = function() {
      return this.stop();
    };

    MusicManager.prototype.currentTrack = function() {
      return this.playlist.get(this.get('current_track'));
    };

    MusicManager.prototype.nextTrack = function() {
      var index, next_track;
      if (!this.get('current_track')) return;
      if (this.settings.get('shuffle')) {
        return this.playlist.models[Math.floor(Math.random() * this.playlist.length - 1)];
      } else {
        index = this.playlist.indexOf(this.currentTrack());
        next_track = this.playlist.models[index + 1];
        if (this.settings.get('repeat') && !next_track) {
          return this.playlist.first();
        } else {
          return next_track;
        }
      }
    };

    MusicManager.prototype.prevTrack = function() {
      var index;
      index = this.playlist.indexOf(this.currentTrack());
      return this.playlist.models[index - 1];
    };

    MusicManager.prototype.setEmptyState = function() {
      return this.state.set({
        duration: 0,
        played: 0,
        buffered: 0,
        name: "stopped"
      });
    };

    MusicManager.prototype.updateState = function(state) {
      this.state.set(state.toJSON());
      if (state.get('name') === "stopped") return this.play(this.nextTrack());
    };

    MusicManager.prototype.searchTrack = function(track, callback) {
      var name, obj, results, searchCallback, _ref, _results;
      var _this = this;
      if (callback == null) callback = function() {};
      results = [];
      searchCallback = function() {
        var match;
        if (!_.isEmpty(results)) {
          match = results[0];
          track.set({
            'file_url': match.file_url,
            'duration': match.duration
          });
          if (!track.get('source_title')) {
            track.set({
              'source_title': match.source_title,
              'source_icon': match.source_icon
            });
          }
          return callback(track);
        } else {
          return callback();
        }
      };
      _ref = chromus.audio_sources;
      _results = [];
      for (name in _ref) {
        obj = _ref[name];
        _results.push(obj.search({
          artist: track.get('artist'),
          song: track.get('song')
        }, function(tracks) {
          results = _.union(results, tracks);
          return searchCallback();
        }));
      }
      return _results;
    };

    MusicManager.prototype.play = function(track) {
      var _this = this;
      if (!track) return;
      if (!_.isObject(track)) track = this.playlist.get(track);
      if (!_.isFunction(track.get)) track = new Track(track);
      if (!track.get('action')) {
        if (track !== this.currentTrack()) this.stop();
        if (track.get('type') == null) {
          this.set({
            'current_track': track.id
          });
        }
        this.state.set({
          'name': 'loading'
        });
      }
      console.warn("trying to play track", track);
      if (!track.get('type')) {
        if (track.get('file_url')) {
          this.state.set({
            'name': 'playing'
          });
          return this.player.play(track.toJSON());
        } else {
          return this.searchTrack(track, function(track) {
            if (track) {
              return _this.play(track);
            } else {
              return _this.play(_this.nextTrack());
            }
          });
        }
      } else {
        return this._handleMediaType(track);
      }
    };

    MusicManager.prototype._handleMediaType = function(track, media_type) {
      var media_handler;
      var _this = this;
      if (media_type == null) media_type = track.get('type');
      console.warn("trying to handle media type", track);
      if (!(media_handler = chromus.media_types[media_type])) {
        throw "Can't find handler for media type `" + media_type + "`";
      }
      return media_handler(track, function(resp) {
        console.warn("resp", resp);
        if (_.isArray(resp)) {
          _this.playlist.reset(resp);
          return _this.play(_this.playlist.first());
        } else {
          track.set(resp);
          track.unset('type');
          return _this.play(track);
        }
      });
    };

    MusicManager.prototype.pause = function() {
      this.state.set({
        'name': 'paused'
      });
      return this.player.pause();
    };

    MusicManager.prototype.preload = function(track) {
      return this.player.preload(track.toJSON());
    };

    MusicManager.prototype.stop = function() {
      this.unset('current_track');
      this.state.set({
        'name': 'stopped'
      }, {
        silent: true
      });
      if (this.player) this.player.stop();
      return this.setEmptyState();
    };

    MusicManager.prototype.setPosition = function(value) {
      return this.player.setPosition(value);
    };

    MusicManager.prototype.setVolume = function(volume) {
      if (volume != null) this.volume = volume;
      return this.player.setVolume(this.volume);
    };

    MusicManager.prototype.getVolume = function() {
      var _ref;
      return (_ref = this.volume) != null ? _ref : 100;
    };

    return MusicManager;

  })();

  music_manager = new MusicManager();

  chromus.registerPlugin("music_manager", music_manager);

  if (browser.isPokki) {
    music_manager.state.bind('change', function(state) {
      if (state.get('name') === 'playing') {
        return pokki.setIdleDetect('background', false);
      } else {
        return pokki.setIdleDetect('background', true);
      }
    });
  }

}).call(this);

// File: ./plugins/music_manager/music_manager_api.js
(function() {
  var music_manager;

  music_manager = chromus.plugins.music_manager;

  browser.addMessageListener(function(msg, sender, sendResponse) {
    var track, _i, _len, _ref, _results;
    var _this = this;
    if (!msg.method.match('(playerState|updateState)')) {
      console.log(msg.method, msg, sender);
    }
    switch (msg.method) {
      case "pause":
        return music_manager.pause();
      case "play":
        if (_.isArray(msg.track)) {
          music_manager.playlist.reset(msg.track);
          return music_manager.play(music_manager.playlist.first());
        } else {
          return music_manager.play(msg.track);
        }
        break;
      case "addToPlaylist":
        _ref = msg.tracks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          track = _ref[_i];
          if (track.type) {
            track = new Backbone.Model(track);
            _results.push(chromus.media_types[track.get('type')](track, function(resp) {
              music_manager.playlist.remove(track);
              return music_manager.playlist.add(resp);
            }));
          } else {
            _results.push(music_manager.playlist.add(track));
          }
        }
        return _results;
        break;
      case "nextTrack":
        return music_manager.play(music_manager.nextTrack());
      case "previousTrack":
        return music_manager.play(music_manager.prevTrack());
      case "setVolume":
        return music_manager.setVolume(msg.volume);
      case "setPosition":
        return music_manager.setPosition(msg.position);
      case "setSettings":
        return music_manager.settings.set(msg.data);
      case "clearPlaylist":
        return music_manager.playlist.reset();
    }
  });

}).call(this);

// File: ./plugins/ui/ui_background.js
(function() {
  var event, music_manager, _i, _len, _ref;

  music_manager = chromus.plugins.music_manager;

  music_manager.state.bind('change', function(state) {
    var time_left, title, track;
    track = music_manager.currentTrack();
    time_left = state.get('duration') - state.get('played');
    if (state.get('name') === "stopped" || time_left <= 0) {
      browser.toolbarItem.setText("");
    } else {
      browser.toolbarItem.setText(prettyTime(time_left));
    }
    if (track) {
      title = "(-" + (prettyTime(time_left).trim()) + ")  " + (track.title());
      browser.toolbarItem.setTitle(title);
    }
    return browser.broadcastMessage({
      method: "updateState",
      state: state,
      track: track
    });
  });

  _ref = ['reset', 'add', 'create', 'change:song'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    event = _ref[_i];
    music_manager.playlist.bind(event, function() {
      return browser.postMessage({
        method: "loadPlaylist",
        playlist: music_manager.playlist.toJSON(),
        current_track: music_manager.get('current_track'),
        state: music_manager.state.toJSON()
      });
    });
  }

  music_manager.settings.bind('change', function(settings) {
    return browser.postMessage({
      method: "updateSettings",
      settings: settings.toJSON()
    });
  });

  browser.addMessageListener(function(msg, sender, sendResponse) {
    switch (msg.method) {
      case "ui:init":
        return browser.postMessage({
          method: "loadPlaylist",
          playlist: music_manager.playlist.toJSON(),
          current_track: music_manager.get('current_track'),
          state: music_manager.state.toJSON(),
          volume: music_manager.getVolume(),
          settings: music_manager.settings.toJSON()
        });
    }
  });

}).call(this);

// File: ./plugins/echonest/echonest.js
(function() {
  var Echo, _ref;

  Echo = {
    settings: {
      baseURL: "http://developer.echonest.com/api/v4",
      format: "jsonp",
      api_key: "D3QELXPGA1KC6AJ6U"
    },
    callMethod: function(method, data, callback) {
      if (data == null) data = {};
      data.format = this.settings.format;
      data.api_key = this.settings.api_key;
      return $.ajax({
        url: "" + this.settings.baseURL + "/" + method,
        data: data,
        cache: true,
        dataType: this.settings.format,
        success: function(resp) {
          console.log("Echo response:", resp);
          return callback(resp.response);
        }
      });
    },
    song: {
      search: function(string, callback) {
        return Echo.callMethod("song/search", {
          combined: string,
          sort: "artist_familiarity-desc"
        }, function(resp) {
          return callback(resp.songs);
        });
      }
    },
    artist: {
      suggest: function(string, callback) {
        return Echo.callMethod("artist/suggest", {
          name: string
        }, function(resp) {
          return callback(resp.artists);
        });
      }
    }
  };

  if ((_ref = this.chromus) != null) _ref.registerPlugin("echo", Echo);

}).call(this);

// File: ./plugins/lastfm/lastfm.js
(function() {
  var LastFM, hashToQueryString;
  var __hasProp = Object.prototype.hasOwnProperty;

  hashToQueryString = function(hash) {
    var key, params, value;
    params = [];
    for (key in hash) {
      if (!__hasProp.call(hash, key)) continue;
      value = hash[key];
      params.push("" + key + "=" + value);
    }
    return params.join('&');
  };

  LastFM = {
    settings: {
      baseURL: "http://ws.audioscrobbler.com/2.0/",
      format: "json",
      api_key: "48e602d0f8c4d34f00b1b17d96ab88c1",
      api_secret: "c129f28ec70abc4311b21fa8473d34e7"
    },
    getSignature: function(data) {
      var key, signature, value;
      signature = [];
      for (key in data) {
        if (!__hasProp.call(data, key)) continue;
        value = data[key];
        if (key !== 'format') signature.push(key + value);
      }
      signature.sort();
      return MD5(signature.join('') + LastFM.settings.api_secret);
    },
    getSession: function() {
      if (browser.isPokki) {
        return pokki.descramble(store.get('lastfm:key'));
      } else {
        return store.get('lastfm:key');
      }
    },
    callMethod: function(method, data, callback) {
      if (data == null) data = {};
      data.format = this.settings.format;
      data.api_key = this.settings.api_key;
      data.method = method;
      if (data.sig_call) {
        delete data.sig_call;
        if (!method.match(/^auth/)) data.sk = LastFM.getSession();
        data.api_sig = this.getSignature(data);
      }
      return $.ajax({
        url: "" + this.settings.baseURL,
        data: data,
        cache: true,
        dataType: this.settings.format,
        success: function(resp) {
          console.log("Lastfm response:", resp);
          return callback(resp);
        },
        error: function(resp) {
          return callback({
            error: "asd"
          });
        }
      });
    },
    convertDateToUTC: function(date) {
      if (date == null) date = new Date();
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    },
    fakePostRequest: function(url, data) {
      var form, iframe, input, key, value;
      iframe = document.createElement('iframe');
      iframe.name = iframe.id = +new Date();
      document.body.appendChild(iframe);
      form = document.createElement('form');
      form.action = url;
      form.method = "post";
      form.target = iframe.id;
      for (key in data) {
        if (!__hasProp.call(data, key)) continue;
        value = data[key];
        input = document.createElement('input');
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      return setTimeout(function() {
        document.body.removeChild(iframe);
        return document.body.removeChild(form);
      }, 2000);
    },
    track: {
      scrobble: function(data, callback) {
        var signature;
        data.method = 'track.scrobble';
        data.timestamp = ((+new Date()) / 1000) | 0;
        data.sk = LastFM.getSession();
        data.api_key = LastFM.settings.api_key;
        signature = LastFM.getSignature(data);
        data.api_sig = signature;
        return LastFM.fakePostRequest("" + LastFM.settings.baseURL, data);
      },
      updateNowPlaying: function(data, callback) {
        var signature;
        data.method = 'track.updateNowPlaying';
        data.sk = LastFM.getSession();
        data.api_key = LastFM.settings.api_key;
        signature = LastFM.getSignature(data);
        data.api_sig = signature;
        return LastFM.fakePostRequest("" + LastFM.settings.baseURL, data);
      },
      search: function(string, callback) {
        return LastFM.callMethod("track.search", {
          track: string
        }, function(resp) {
          var _ref;
          return callback((_ref = resp.results.trackmatches) != null ? _ref.track : void 0);
        });
      }
    },
    artist: {
      search: function(string, callback) {
        return LastFM.callMethod("artist.search", {
          artist: string
        }, function(resp) {
          var _ref;
          return callback((_ref = resp.results.artistmatches) != null ? _ref.artist : void 0);
        });
      },
      getTopTracks: function(artist, callback) {
        return LastFM.callMethod("artist.getTopTracks", {
          "artist": artist
        }, function(resp) {
          var tracks;
          tracks = resp.toptracks.track;
          tracks = _.map(tracks, function(track) {
            return {
              artist: track.artist.name,
              song: track.name,
              duration: parseInt(track.duration),
              images: track.image
            };
          });
          return callback(tracks);
        });
      }
    },
    album: {
      search: function(album, callback) {
        return LastFM.callMethod("album.search", {
          "album": album
        }, function(resp) {
          var _ref;
          return callback((_ref = resp.results.albummatches) != null ? _ref.album : void 0);
        });
      },
      getInfo: function(artist, album, callback) {
        return LastFM.callMethod("album.getInfo", {
          "album": album,
          "artist": artist
        }, function(resp) {
          var tracks;
          tracks = resp.album.tracks.track;
          tracks = _.map(tracks, function(track) {
            return {
              artist: track.artist.name,
              song: track.name,
              duration: parseInt(track.duration),
              images: track.images
            };
          });
          return callback(tracks);
        });
      }
    },
    image: function(options) {
      var method_prefix, params, _ref;
      if (!options.artist) return;
      if ((_ref = options.size) == null) options.size = "mediumsquare";
      params = [];
      if (options.album) {
        method_prefix = "album";
        params.push("album=" + encodeURIComponent(options.album));
      } else {
        method_prefix = "artist";
        params.push("artist=" + encodeURIComponent(options.artist));
      }
      return "" + LastFM.settings.baseURL + "?api_key=" + LastFM.settings.api_key + "&method=" + method_prefix + ".getImageRedirect&size=" + options.size + "&" + (params.join('&'));
    },
    radio: {
      getPlaylist: function(callback) {
        return LastFM.callMethod("radio.getPlaylist", {
          sig_call: true
        }, function(resp) {
          var tracks;
          tracks = resp.playlist.trackList.track;
          tracks = _.map(tracks, function(track) {
            return {
              artist: track.creator,
              song: track.title,
              file_url: track.location,
              images: [track.image],
              duration: track.duration / 1000,
              lastfm_radio: true,
              type: 'lastfm:stream_track',
              source_title: resp.playlist.title,
              source_icon: "http://cdn.last.fm/flatness/favicon.2.ico"
            };
          });
          tracks.push({
            song: "Load next tracks",
            artist: "",
            type: "lastfm:radio_loader",
            action: true
          });
          return callback(tracks);
        });
      },
      tune: function(station, callback) {
        var data, signature;
        if (station.match(/loved$/)) {
          LastFM._station = 'loved';
          return callback();
        }
        data = {
          station: station
        };
        data.method = 'radio.tune';
        data.sk = LastFM.getSession();
        data.api_key = LastFM.settings.api_key;
        signature = LastFM.getSignature(data);
        data.api_sig = signature;
        data.format = "json";
        data._url = "" + LastFM.settings.baseURL;
        data._method = "POST";
        return $.ajax({
          url: "" + chromus.baseURL + "/proxy?_callback=?",
          data: data,
          dataType: "jsonp",
          cache: true,
          success: function(resp) {
            resp = JSON.parse(resp.response);
            if (!resp.error) {
              return callback();
            } else {
              return browser.postMessage({
                method: "lastfm:error",
                error: resp.error.code
              });
            }
          }
        });
      }
    }
  };

  this.chromus.registerPlugin("lastfm", LastFM);

}).call(this);

// File: ./plugins/lastfm/lastfm_bg.js
(function() {

  /*
      Track scrobbling
  */

  var addNextTracks, last_scrobbled, lastfm, manager;
  var _this = this;

  lastfm = chromus.plugins.lastfm;

  manager = chromus.plugins.music_manager;

  last_scrobbled = void 0;

  chromus.plugins.music_manager.state.bind('change', function(state) {
    var percent_played, track;
    if (!(store.get('lastfm:scrobbling') && store.get('lastfm:key'))) return;
    track = manager.currentTrack();
    if (!track) return;
    if (state.get('name') === "playing" && track.id !== last_scrobbled) {
      percent_played = (state.get('played') / track.get('duration')) * 100;
      if (percent_played > 30 && track.get('duration') > 30) {
        last_scrobbled = track.id;
        lastfm.track.scrobble({
          artist: track.get('artist'),
          track: track.get('song'),
          duration: track.get('duration')
        });
      }
    } else if (state.get('name') === 'stopped') {
      last_scrobbled = void 0;
    }
    if (state.get('name') === "playing" && state.previous("name") !== state.get('name')) {
      return lastfm.track.updateNowPlaying({
        artist: track.get('artist'),
        track: track.get('song'),
        duration: track.get('duration')
      });
    }
  });

  addNextTracks = function() {
    var loader, loaders, _i, _len;
    loaders = manager.playlist.filter(function(i) {
      return i.get('type') === 'lastfm:radio_loader';
    });
    for (_i = 0, _len = loaders.length; _i < _len; _i++) {
      loader = loaders[_i];
      loader.set({
        'song': "Loading..."
      });
    }
    return lastfm.radio.getPlaylist(function(tracks) {
      manager.playlist.remove(loaders);
      return manager.playlist.add(tracks);
    });
  };

  chromus.plugins.music_manager.bind('change:current_track', function() {
    var index, previous_tracks, track, _i, _len, _ref, _ref2;
    if ((_ref = manager.currentTrack()) != null ? _ref.get('lastfm_radio') : void 0) {
      index = manager.playlist.indexOf(manager.currentTrack());
      previous_tracks = _.first(manager.playlist.models, index);
      for (_i = 0, _len = previous_tracks.length; _i < _len; _i++) {
        track = previous_tracks[_i];
        if (track.get('radio')) {
          track.unset('file_url');
          track.unset('radio');
          track.unset('source_title');
          track.unset('source_icon');
          track.unset('type');
        }
      }
      if (((_ref2 = manager.nextTrack()) != null ? _ref2.get('type') : void 0) === "lastfm:radio_loader") {
        return addNextTracks();
      }
    }
  });

  chromus.registerMediaType("lastfm:radio_loader", function(track) {
    return addNextTracks();
  });

  chromus.registerMediaType("artist", function(track, callback) {
    return lastfm.artist.getTopTracks(track.get('artist'), callback);
  });

  chromus.registerMediaType("track", function(track, callback) {
    return callback([
      {
        artist: track.get('artist'),
        song: track.get('song')
      }
    ]);
  });

  chromus.registerMediaType("album", function(track, callback) {
    return lastfm.album.getInfo(track.get('artist'), track.get('album'), callback);
  });

  chromus.registerMediaType("lastfm:radio", function(track, callback) {
    manager.settings.set({
      'repeat': false,
      'shuffle': false
    });
    return lastfm.radio.tune(track.get('station'), function() {
      return lastfm.radio.getPlaylist(callback);
    });
  });

  chromus.registerMediaType("lastfm:stream_track", function(track, callback) {
    return $.ajax({
      url: "http://chromusapp.appspot.com/proxy?_callback=?",
      dataType: "jsonp",
      data: {
        '_url': track.get('file_url')
      },
      cache: true,
      success: function(resp) {
        return callback({
          file_url: resp.headers.location
        }, false);
      }
    });
  });

}).call(this);

// File: ./plugins/lastfm/md5.js
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Copyright (C) Paul Johnston 1999 - 2000.
 * Updated by Greg Holt 2000 - 2001.
 * See http://pajhome.org.uk/site/legal.html for details.
 */

/*
 * Convert a 32-bit number to a hex string with ls-byte first
 */
(function(global){
var hex_chr = "0123456789abcdef";
function rhex(num)
{
  str = "";
  for(j = 0; j <= 3; j++)
    str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
           hex_chr.charAt((num >> (j * 8)) & 0x0F);
  return str;
}

/*
 * Convert a string to a sequence of 16-word blocks, stored as an array.
 * Append padding bits and the length, as described in the MD5 standard.
 */
function str2blks_MD5(str)
{
  nblk = ((str.length + 8) >> 6) + 1;
  blks = new Array(nblk * 16);
  for(i = 0; i < nblk * 16; i++) blks[i] = 0;
  for(i = 0; i < str.length; i++)
    blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
  blks[i >> 2] |= 0x80 << ((i % 4) * 8);
  blks[nblk * 16 - 2] = str.length * 8;
  return blks;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally 
 * to work around bugs in some JS interpreters.
 */
function add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * These functions implement the basic operation for each round of the
 * algorithm.
 */
function cmn(q, a, b, x, s, t)
{
  return add(rol(add(add(a, q), add(x, t)), s), b);
}
function ff(a, b, c, d, x, s, t)
{
  return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function gg(a, b, c, d, x, s, t)
{
  return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function hh(a, b, c, d, x, s, t)
{
  return cmn(b ^ c ^ d, a, b, x, s, t);
}
function ii(a, b, c, d, x, s, t)
{
  return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Take a string and return the hex representation of its MD5.
 */
function calcMD5(str)
{
  x = str2blks_MD5(str);
  a =  1732584193;
  b = -271733879;
  c = -1732584194;
  d =  271733878;

  for(i = 0; i < x.length; i += 16)
  {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;

    a = ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = ff(c, d, a, b, x[i+10], 17, -42063);
    b = ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = ff(d, a, b, c, x[i+13], 12, -40341101);
    c = ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = ff(b, c, d, a, x[i+15], 22,  1236535329);    

    a = gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = gg(c, d, a, b, x[i+11], 14,  643717713);
    b = gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = gg(c, d, a, b, x[i+15], 14, -660478335);
    b = gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = gg(b, c, d, a, x[i+12], 20, -1926607734);
    
    a = hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = hh(b, c, d, a, x[i+14], 23, -35309556);
    a = hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = hh(d, a, b, c, x[i+12], 11, -421815835);
    c = hh(c, d, a, b, x[i+15], 16,  530742520);
    b = hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = ii(c, d, a, b, x[i+10], 15, -1051523);
    b = ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = ii(d, a, b, c, x[i+15], 10, -30611744);
    c = ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = add(a, olda);
    b = add(b, oldb);
    c = add(c, oldc);
    d = add(d, oldd);
  }
  return rhex(a) + rhex(b) + rhex(c) + rhex(d);
}

global.MD5 = calcMD5
})(this);
// File: ./plugins/loved_tracks_radio/loved_tracks_radio.js
(function() {
  var LastfmLovedRadio, addNextTracks, manager, radio;

  LastfmLovedRadio = (function() {

    function LastfmLovedRadio() {}

    LastfmLovedRadio.prototype.initialize = function() {
      return this.reset();
    };

    LastfmLovedRadio.prototype.reset = function() {
      this.pages = [];
      this.page = 1;
      return this.played_tracks = [];
    };

    LastfmLovedRadio.prototype.getNext = function(callback) {
      var _this = this;
      if (this.pages.length) {
        this.pages = _.shuffle(this.pages);
        this.page = this.pages[0];
      }
      return chromus.plugins.lastfm.callMethod("user.getlovedtracks", {
        user: store.get("lastfm:user"),
        page: this.page
      }, function(response) {
        var tracks;
        console.warn(_this.page, response.lovedtracks.track.length, _this.pages);
        if (!_this.pages.length) {
          _this.pages = response.lovedtracks["@attr"].totalPages;
          _this.pages = _.range(1, _this.pages + 1);
          if (response.lovedtracks.track.length) {
            return _this.getNext(callback);
          } else {
            return callback([]);
          }
        }
        tracks = _.difference(response.lovedtracks.track, _this.played_tracks);
        tracks = _.shuffle(tracks);
        if (!tracks.length) {
          _this.pages = _.without(_this.pages, _this.page);
          return _this.getNext(callback);
        }
        tracks = _.first(tracks, 3);
        _this.played_tracks = _.union(_this.played_tracks, tracks);
        tracks = _.map(tracks, function(track) {
          return {
            song: track.name,
            artist: track.artist.name,
            source_title: "Last.fm Loved Tracks Radio (Free)",
            source_icon: browser.extension.getURL('/assets/icons/19x19.png'),
            loved_radio: true
          };
        });
        tracks.push({
          song: "Load next tracks",
          artist: "",
          type: "lastfm:loved_loader",
          action: true
        });
        return callback(tracks);
      });
    };

    return LastfmLovedRadio;

  })();

  radio = new LastfmLovedRadio();

  manager = chromus.plugins.music_manager;

  addNextTracks = function() {
    var loader, loaders, _i, _len;
    loaders = manager.playlist.filter(function(i) {
      return i.get('type') === 'lastfm:loved_loader';
    });
    for (_i = 0, _len = loaders.length; _i < _len; _i++) {
      loader = loaders[_i];
      loader.set({
        'song': 'Loading...'
      });
    }
    return radio.getNext(function(tracks) {
      manager.playlist.remove(loaders);
      return manager.playlist.add(tracks);
    });
  };

  manager.bind('change:current_track', function() {
    var track, _ref;
    track = manager.currentTrack();
    if ((track != null ? track.get('loved_radio') : void 0) && ((_ref = manager.nextTrack()) != null ? _ref.get('type') : void 0) === "lastfm:loved_loader") {
      return addNextTracks();
    }
  });

  chromus.registerMediaType("lastfm:loved_loader", function(track) {
    return addNextTracks();
  });

  chromus.registerMediaType("lastfm:loved", function(track, callback) {
    radio.reset();
    manager.settings.set({
      'repeat': false,
      'shuffle': false
    });
    return radio.getNext(callback);
  });

}).call(this);

// File: ./plugins/vkontakte/vkontakte.js
(function() {
  var VK, global;

  global = this;

  VK = {
    APP_ID: global.debug ? "2649785" : "2698877",
    SCOPE: "audio,offline",
    authURL: function() {
      var baseLocation, link, plugin_path, redirect_uri;
      if (browser.isChrome) {
        baseLocation = "" + chromus.baseURL + "/chromus/index.html";
      } else {
        baseLocation = document.location.toString();
      }
      plugin_path = chromus.plugins_info.vkontakte.path;
      plugin_path = plugin_path.replace(/chrome-extension:\/\/\w+\//, "");
      redirect_uri = [baseLocation, "/../", plugin_path, "/oauth.html"].join('');
      return link = ["http://api.vkontakte.ru/oauth/authorize?", "client_id=" + VK.APP_ID, "scope=" + VK.SCOPE, "redirect_uri=" + redirect_uri, "display=popup", "response_type=token"].join('&');
    },
    searchWithoutLogin: function(args, callback) {
      return $.ajax({
        url: "" + chromus.baseURL + "/api/token/get",
        dataType: "jsonp",
        success: function(resp) {
          if (!resp.error) {
            args.access_token = resp.token;
            return VK.searchAPI(args, callback);
          }
        }
      });
    },
    searchAPI: function(args, callback) {
      var data, query;
      console.warn('searching as logged user');
      query = "" + args.artist + " " + args.song;
      data = {
        q: query,
        format: 'json',
        sort: 2,
        count: 10
      };
      if (!args.access_token) {
        if (browser.isPokki) {
          data.access_token = pokki.descrumble(store.get('vk:token'));
        } else {
          data.access_token = store.get('vk:token');
        }
      } else {
        data.access_token = args.access_token;
      }
      return $.ajax({
        url: "https://api.vkontakte.ru/method/audio.search",
        data: data,
        dataType: "jsonp",
        cache: true,
        success: function(result) {
          var records;
          if (!result.response) return callback([]);
          records = _.map(_.rest(result.response), function(i) {
            return {
              artist: i.artist,
              song: i.title,
              duration: parseInt(i.duration),
              file_url: i.url,
              source_title: "Vkontakte",
              source_icon: "http://vkontakte.ru/favicon.ico"
            };
          });
          return callback(records);
        }
      });
    },
    search: function(args, callback) {
      if (store.get('vk:user_id')) {
        return VK.searchAPI(args, callback);
      } else {
        return VK.searchWithoutLogin(args, callback);
      }
    }
  };

  this.chromus.registerPlugin("vkontakte", VK);

  this.chromus.registerAudioSource("vkontakte", VK);

  browser.addMessageListener(function(msg, sender, sendResponse) {
    switch (msg.method) {
      case "vk:auth":
        store.set("vk:token", msg.auth.access_token);
        store.set("vk:user_id", msg.auth.user_id);
        $.ajax({
          url: "" + chromus.baseURL + "/api/token/add",
          data: {
            token: msg.auth.access_token
          },
          dataType: "jsonp",
          success: function(resp) {
            return console.log('token added');
          }
        });
        return console.warn("logged!");
    }
  });

}).call(this);
