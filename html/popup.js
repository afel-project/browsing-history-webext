document.addEventListener('DOMContentLoaded', function () {
	
  var c = chrome.extension.getBackgroundPage().acbh__count;
 
 // just to check if the upload button should be shown or not 
  // TODO : shall this be visible anyway?
  if (chrome.extension.getBackgroundPage().acbh__count == 0){
  	 document.getElementById('load-btn').style.display = 'block'; 
  } else {
  	document.getElementById('load-btn').style.display = 'none'; 
  }
  
  // at start, check if plugin is active or not 
  // shows respective panel
  if (chrome.extension.getBackgroundPage().acbh__active ) {
 	 document.getElementById('acbh_monitor').style.display = 'block';
 	 document.getElementById('acbh_monitor_off').style.display = 'none';
  } else {
  	 document.getElementById('acbh_monitor').style.display = 'none';
  	 document.getElementById('acbh_monitor_off').style.display = 'block';
  }
  
  document.getElementById('nvisits').innerHTML = c;
 
  
  document.getElementById('stop-btn').addEventListener('click', function() {
	 
	 chrome.extension.getBackgroundPage().acbh__active = false;
	 
	 //  TODO : check w/ MdA
 	 chrome.extension.getBackgroundPage().acbh__count = 0;
 	 document.getElementById('nvisits').innerHTML = 0;
 
 	 stg.remove(["acbh_dataset_id", "acbh_user_key"], function (items){});
	 
	 document.getElementById('acbh_monitor_off').style.display = 'block';
	 document.getElementById('acbh_monitor').style.display = 'none';

  });
  
  document.getElementById('start-btn').addEventListener('click', function() {
	 
 	 chrome.extension.getBackgroundPage().acbh__getDatasetInfo();

	 document.getElementById('acbh_monitor_off').style.display = 'none';
	 document.getElementById('acbh_monitor').style.display = 'block';
	 
  });
  
  // upload last 10 pages from history
  document.getElementById('load-btn').addEventListener('click', function(){
  	 
	 // To look for history items visited in the last week,
	  // subtract a week of microseconds from the current time.
	  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
	  var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
	  
	  chrome.history.search({ 
		  'text' : '',
		  'startTime': oneWeekAgo,
		  'maxResults' : 1000
		 }, function(historyItems) {
	          			 
			 for (var i = 0; i < historyItems.length; ++i) {
				 // console.log(historyItems[i].url);
				 chrome.extension.getBackgroundPage().acbh__save(historyItems[i]);
		   	     // console.log(chrome.extension.getBackgroundPage().acbh__count);
			 }
			 // TODO : this is a wordaround
			 document.getElementById('nvisits').innerHTML = chrome.extension.getBackgroundPage().acbh__count+historyItems.length;
			 
			 document.getElementById('load-btn').style.display = 'none'; 
	  });
	  
		 
	 
  }); 
}); 

