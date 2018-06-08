/* Main script for the AFEL browsing history WebExtension 
 * for Firefox 50+ and possibly other browsers.
 * Establishes connection to the AFEL platform and sends 
 * new data about activities
 *
 * @author: alexdma, mdaquin
 */

// TODO:
//   off button
//   https

acbh__checkActivity();
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
 * Performs all the checks that occur at the time the 
 * extension is (de-)activated.
 */
function acbh__checkActivity(){
	stg.get(["acbh_pref_active"], function(items){
		if(items.acbh_pref_active) {
			window.acbh__active = true
			chrome.browserAction.setIcon({ path:"img/afel_icon16.png" });
		} else {
			window.acbh__active = false
			chrome.browserAction.setIcon({ path:"img/afel_icon-off16.png" });
		}
	})
}

/**
 * Checks if dataset exists with info in storage.
 * If it does, carry on.
 * If it does not, get the user to login with their data 
 * platform credentials, to obtain the info for the new dataset
 */
function acbh__getDatasetInfo(){
    stg.get(["acbh_dataset_id", "acbh_user_key"], function (items){
	if( !items.acbh_dataset_id || !items.acbh_user_key)
	    chrome.tabs.create({url: "html/login.html"}, function(){})
    });
}

function acbh__save(details){
    // check if dataset info is available
    stg.get(["acbh_dataset_id", "acbh_user_key"], function (items){
		if (items.acbh_dataset_id && items.acbh_user_key){	    
	    	var tosend = acbh__generateJSON(items, details);
	    	acbh__sendJSON(items, tosend);
	    	chrome.extension.getBackgroundPage().acbh__count++;
		} else { // if the dataset info is missing more than 50 times,
	         // try to redo the registration of the dataset to the AFEL platform
	    	if(++misses >= 50){ 
				misses = 0; 
				acbh__getDatasetInfo() 
			}
		}
    });
}

/**
 * Generates JSON for the given historyItem
 */
function acbh__generateJSON(dataset, historyItem){
    var res = {};
    res.id = dataset.acbh_dataset_id+"_"+historyItem.id;
    res.type = "WebpageVisit";
    res.url = historyItem.url;
    res.title = historyItem.title;
    res.user = dataset.acbh_user_key;
    res.tool = app_short+"_browser";
    res.date = historyItem.lastVisitTime;
    res.dataset = dataset.acbh_dataset_id;
    return res;
}

/**
 * Sends the data to the data platform.
 */
function acbh__sendJSON(dataset, obj){
    // console.log(obj);
    postJsonResource(
    	config.ecapi_url + "bh/?id=" + dataset.acbh_dataset_id + "&key=" + dataset.acbh_user_key , 
    	"data=" + escape(JSON.stringify(obj)) , 
    	function (status, text){
    	}
    );
}
