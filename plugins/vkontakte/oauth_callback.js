console.warn('asdasd', document.location, document.location.hash, document.location.hash.match(/access_token/))

if (document.location.hash.match(/access_token/)) {
	var hash = document.location.hash.substr(1).split('&');
	var auth = {}

    for (var param, i=0, l=hash.length; i<l; i++) {
        param = hash[i].split('=');

        auth[param[0]] = param[1];
    }

    message = {
    	method: 'vk:auth',
    	auth: auth
    }

    console.warn('sending auth', auth)
	
	chrome.extension.sendRequest(message);            
} else if (document.location.hash.match(/error/)) {
	chrome.extension.sendRequest({ method:'vk:auth', auth: {error: true}}); 
}