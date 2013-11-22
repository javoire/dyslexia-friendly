console.log('popup.js loaded');

window.onload = function() {
  var links = document.getElementsByTagName("a");
  for (var i = links.length - 1; i >= 0; i--) {
    var link = links[i];
    link.addEventListener('click', sendColorMessage, false);
  };
}


function sendColorMessage(e) {
  console.log('click color link', e.target);
  chrome.extension.sendMessage({
    type: "color-divs",
    color: e.target.getAttribute("data-color")
  });
}