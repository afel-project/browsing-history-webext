var self = require("sdk/self");
var senddata = require('./inc/senddata.js');

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;

var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
tabs.on("ready", logURL);
 
var button = buttons.ActionButton({
  id: "list-tabs",
  label: "List Tabs",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: listTabs
});

function handleClick(state) {
  tabs.open("http://www.mozilla.org/");
}

function listTabs() {
  require('./inc/senddata.js').send();
  var tabs = require("sdk/tabs");
  for (let tab of tabs)
    console.log(tab.url);
}

function logURL(tab) {
  senddata.send(tab.url);
}