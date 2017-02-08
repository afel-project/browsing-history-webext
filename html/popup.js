document.addEventListener('DOMContentLoaded', function () {
  var c = chrome.extension.getBackgroundPage().acbh__count;
  document.getElementById('nvisits').innerHTML = c;
});
