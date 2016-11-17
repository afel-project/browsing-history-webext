var myName = typeof browser !== 'undefined' ? browser.runtime.getManifest().name : chrome.runtime.getManifest().name;

var config = {
   base_ns: "http://data.afel-project.org/acbh/",
   catalogue_base_url: "http://data.afel-project.eu/catalogue/",
   ecapi_url: "http://data.afel-project.eu/api/"
};

var app_short = 'generic';
if(window.navigator.userAgent.indexOf('OPR/') !== -1) app_short = 'opera';
else if(window.navigator.userAgent.indexOf('Firefox/') !== -1) app_short = 'firefox';
else if(window.navigator.userAgent.indexOf('Chrome/') !== -1) app_short = 'chrome';

// Prefer synchronised storage area if available.
// see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/Storage
var stg = (typeof chrome.storage.sync !== 'undefined') ? chrome.storage.sync : chrome.storage.local;


function postJsonResource(url, params, callback){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(){
	  if(req.readyState == 4) {
        callback(req.responseText);
	    if(req.status == 404)
          console.error("404 - is the page "+url+" present in the AFEL catalogue?");
      }
    };
    req.open("POST", url, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send(params);
    return true
}
