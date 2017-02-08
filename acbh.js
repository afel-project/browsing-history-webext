/* Main script for the AFEL browsing history WebExtension 
 * for Firefox 48+ and possibly other browsers.
 * Establishes connection to the AFEL platform and sends 
 * new data about activities
 *
 * @author: alexdma, mdaquin
 */

// console.log(myName+" is alive.");

//// FOR DEBUG - uncomment here for faking an existing dataset
// stg.set({"acbh_dataset_id": "test", "acbh_user_key": "test"}, function (){});
//// FOR DEBUG - uncomment here and later to force the re-creation of a new dataset
// stg.remove(["acbh_dataset_id", "acbh_user_key"], function (items){
acbh__getDatasetInfo();
//// FOR DEBUG - uncomment here as well to force the re-creation of a new dataset
//});

// Counter for number of times we went to a page without having any dataset info
var misses = 0;

// Update when something is visited
chrome.history.onVisited.addListener(function(details){
    acbh__save(details);
});

//================================================================================
// Functions
//================================================================================

/**
 * Generates RDF for the given historyItem
 */
function acbh__generateRDF(dataset, historyItem){
    var uri = config.base_ns+historyItem.id;
    var rdf = "<"+uri+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <"+config.base_ns+"onto/WebpageVisit> . \n";
    rdf += "<"+uri+"> <"+config.base_ns+"onto/resource> <"+historyItem.url+"> . \n";
    rdf += "<"+historyItem.url+"> <"+config.base_ns+'onto/url> "'+historyItem.url+'" . \n';
    if(historyItem.title) rdf += "<"+historyItem.url+"> <"+config.base_ns+'onto/title> "'+historyItem.title+'" . \n';
    rdf += "<"+uri+"> <"+config.base_ns+"onto/visitor> <"+config.base_ns+"user/"+dataset.acbh_user_key+"> . \n";
    rdf += "<"+uri+"> <"+config.base_ns+"onto/usingTool> <"+config.base_ns+"tool/"+app_short+"_browser> . \n";
    rdf += "<"+uri+"> <"+config.base_ns+"onto/atTime> \"\"\""+historyItem.lastVisitTime+"\"\"\"^^<http://www.w3.org/2001/XMLSchema#decimal> . \n";
    // TODO - way to describe the computer?
    return rdf;
}

/**
 * Checks if dataset exists with info in storage.
 * If it does, carry on.
 * If it does not, get the user to login with their data 
 * platform credentials, to obtain the info for the new dataset
 */
function acbh__getDatasetInfo(relogin=false){
    stg.get(["acbh_dataset_id", "acbh_user_key"], function (items){
	  if(!items.acbh_dataset_id || !items.acbh_user_key)
	    chrome.tabs.create({url: "html/login.html"}, function(){})
    });				   
}

function acbh__save(details){
    // check if dataset info is available
    stg.get(["acbh_dataset_id", "acbh_user_key"], function (items){
		if (items.acbh_dataset_id && items.acbh_user_key){	    
	    	var rdf = acbh__generateRDF(items, details);
	    	acbh__sendRDF(items, rdf);
	    	chrome.extension.getBackgroundPage().acbh__count++;
		} else { // if the dataset info is missing more than 50 times,
	         // try to redo the registration of the dataset to the AFEL platform
	    	if(++misses >= 50){ misses = 0; acbh__getDatasetInfo() }
		}
    });
}

/**
 * Sends the data to the data platform through ECAPI.
 */
function acbh__sendRDF(dataset, rdf){
    postJsonResource(
    	config.ecapi_url + "dataset/" + dataset.acbh_dataset_id + "?key=" + dataset.acbh_user_key , 
    	"data=" + escape(rdf) , 
    	function (status, text){
			// console.log("rdf sent");
    	}
    );
}
