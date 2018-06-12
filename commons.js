/* Background script that sets some variables 
 * that must be accessed from anywhere in the
 * extension code.
 *
 * @author: alexdma
 */
 
var myName = (typeof browser !== 'undefined') ? browser.runtime.getManifest().name : chrome.runtime.getManifest().name;
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

//================================================================================
// Functions
//================================================================================

function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
}

function postJsonResource(url, params, callback){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(){
	  if(req.readyState == 4) {
        callback(req.status, req.responseText);
	    if(req.status == 404)
          console.error("404 - is the page " + url + " present in the AFEL catalogue?");
      }
    };
    req.open("POST", url, true);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.send(params);
    return true
}
