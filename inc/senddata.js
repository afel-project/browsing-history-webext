var Request = require("sdk/request").Request;
var afelkey = gimmeAKey();

function gimmeAKey() {
  return "123druidia345";
}

function send(page) {
  var timestamp = Date.now();
  var datareq = Request({
    url : "http://data.afel-project.eu/api/dataset/" 
        //"http://localhost:8085/jit/dataset/"
        + afelkey + "?key=" + afelkey,
    content : "data=" + encodeURIComponent("<http://data.afel-project.eu/sth/browservisit/"
    	+ afelkey + "_" + timestamp + "> <http://linkedevents.org/ontology/atTime>"
    	+ " <http://data.afel-project.eu/sth/time/" + timestamp + "> . "
    	+ " <http://data.afel-project.eu/sth/browservisit/"
    	+ afelkey + "_" + timestamp + "> <http://linkedevents.org/ontology/involved>"
    	+ " <" + page + "> ."),
    onComplete: function (response) {
      console.log(response.url);
      console.log(response.status);
      console.log(response.json);
    }
  });
  datareq.post();
}

exports.gimmeAKey = gimmeAKey;
exports.send = send;