
window.onload = function () {
    document.getElementById("gobutton").addEventListener("click", go);
    document.getElementById("password")
	.addEventListener("keyup", function(event) {
	    event.preventDefault();
	    if (event.keyCode == 13) {
		go();
	    }
	});
}

function go(){
    clearError();
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    if (!username || username.trim() == ""){
	displayError("please enter a username");
	return;
    }
    if (!password || password.trim() == ""){
	displayError("please enter a password");
	return;
    }
    displayLoading();
    getDatasetInfo(username, password);
}

function displayError(message){
    var e = document.getElementById("error");
    e.style.visibility="visible";
    e.innerHTML=message;
}

function clearError(){
    var e = document.getElementById("error");
    e.style.visibility="hidden";
}

function displayLoading(){
    displayError("Sending....");
}

// main bit - send the login credentials to the platform,
// which should come back with a dataset id and a user key
// record them locally
function getDatasetInfo(username, password){
    var ecapiconfig = generateConfig();
    postJsonResource(config.catalogue_base_url+"newuserdataset", 
    	"username="+username
    	+"&password="+password
    	+"&type=AFEL "+app_short+" Browsing Extension&description=Collects data about browsing activities from the "+app_short+" web browser.&ecapiconf="+encodeURIComponent(ecapiconfig)
    	, function (text){
	      var res=JSON.parse(text);	
	      if (res.error) { displayError(res.error) }
	      else if (res.key && res.dataset){
	        stg.set({"acbh_dataset_id": res.dataset, "acbh_user_key": res.key, "acbh_ecapi": res.ecapi}, 
              function(){
                console.log(myName+' is attempting to close its own login page.');
                var tabbs = typeof browser !== 'undefined' ? browser.tabs : chrome.tabs;
                tabbs.query({active:true,currentWindow:true}).then(function(value){ 
                	if(value.length>0) {
                		tabbs.remove(value[0].id).then(function(value){},function(reason){
                			alert(myName + 'failed to close its authentication window, you should do it manually now.'+'\nReason: '+reason)
                		});
                	}
                });
              }
            );
	      }
        });
}


function generateConfig(){
    var obj = {
	  "type/global:id/day": {
	    localise: 'function localise(stype,authority,uidcat,uid){ var day = uid; if (uid=="today") { var today = new Date(); var dd = today.getDate(); var mm = today.getMonth()+1; var yyyy = today.getFullYear(); if(dd<10) {dd="0"+dd} if(mm<10) {mm="0"+mm} day = dd+"-"+mm+"-"+yyyy;} var aday = day.split("-"); var st = new Date(aday[2], aday[1]-1, aday[0]).getTime(); return "filter ( ?t >= "+st+" && ?t < "+(st+24*60*60*1000)+")"; }',
        query_text: 'select distinct ?p1 ?o1 ?p2 ?o2 ?p3 ?o3 where { graph <[GRAPH]> {{{?o1 a <'+config.base_ns+'onto/WebpageVisit>. ?o1 <'+config.base_ns+'onto/atTime> ?t. [LURI]. bind (uri("'+config.base_ns+'onto/activities") as ?p1). ?o1 ?p2 ?o2. filter ( ?p2 in ( <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>, <'+config.base_ns+'onto/usingTool>, <'+config.base_ns+'onto/atTime> ) ) } UNION { ?o1 a <'+config.base_ns+'onto/WebpageVisit>. ?o1 <'+config.base_ns+'onto/atTime> ?t. [LURI]. bind (uri("'+config.base_ns+'onto/activities") as ?p1). ?o1 <'+config.base_ns+'onto/resource> ?o2. bind (uri("'+config.base_ns+'onto/resource") as ?p2). ?o2 ?p3 ?o3}}}} order by ?t'
      },
      "type/global:id/month": {
	    localise: 'function localise(stype,authority,uidcat,uid){ var month = uid; if (uid=="current") { var today = new Date(); var mm = today.getMonth()+1; var yyyy = today.getFullYear(); if(mm<10) {mm="0"+mm} month = mm+"-"+yyyy;} var amonth = month.split("-"); var st = new Date(amonth[1], amonth[0]-1, 01).getTime(); return "filter ( ?t >= "+st+" && ?t < "+(st+31*24*60*60*1000)+")"; }',
        query_text: 'select distinct ?p1 ?o1 ?p2 ?o2 ?p3 ?o3 where { graph <[GRAPH]> {{{?o1 a <'+config.base_ns+'onto/WebpageVisit>. ?o1 <'+config.base_ns+'onto/atTime> ?t. [LURI]. bind (uri("'+config.base_ns+'onto/activities") as ?p1). ?o1 ?p2 ?o2. filter ( ?p2 in ( <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>, <'+config.base_ns+'onto/usingTool>, <'+config.base_ns+'onto/atTime> ) ) } UNION { ?o1 a <'+config.base_ns+'onto/WebpageVisit>. ?o1 <'+config.base_ns+'onto/atTime> ?t. [LURI]. bind (uri("'+config.base_ns+'onto/activities") as ?p1). ?o1 <'+config.base_ns+'onto/resource> ?o2. bind (uri("'+config.base_ns+'onto/resource") as ?p2). ?o2 ?p3 ?o3}}}} order by ?t'
      },
      "type/global:id/year": {
	    localise: 'function localise(stype,authority,uidcat,uid){ var year = uid; if (uid=="current") { var today = new Date(); var yyyy = today.getFullYear(); year = yyyy;} var st = new Date(year, 00, 01).getTime(); return "filter ( ?t >= "+st+" && ?t < "+(st+365*24*60*60*1000)+")"; }',
        query_text: 'select distinct ?p1 ?o1 ?p2 ?o2 ?p3 ?o3 where { graph <[GRAPH]> {{{?o1 a <'+config.base_ns+'onto/WebpageVisit>. ?o1 <'+config.base_ns+'onto/atTime> ?t. [LURI]. bind (uri("'+config.base_ns+'onto/activities") as ?p1). ?o1 ?p2 ?o2. filter ( ?p2 in ( <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>, <'+config.base_ns+'onto/usingTool>, <'+config.base_ns+'onto/atTime> ) ) } UNION { ?o1 a <'+config.base_ns+'onto/WebpageVisit>. ?o1 <'+config.base_ns+'onto/atTime> ?t. [LURI]. bind (uri("'+config.base_ns+'onto/activities") as ?p1). ?o1 <'+config.base_ns+'onto/resource> ?o2. bind (uri("'+config.base_ns+'onto/resource") as ?p2). ?o2 ?p3 ?o3}}}} order by ?t'
      }
    };
    return JSON.stringify(obj);
}
