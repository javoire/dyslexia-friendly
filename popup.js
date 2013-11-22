console.log('popup.js loaded');

window.onload = function() {
  document.getElementById("apply-bg-color").addEventListener('click', sendBgColorMessage, false);
  document.getElementById("apply-font-color").addEventListener('click', sendFontColorMessage, false);
  
  font_links = document.querySelectorAll(".font-list li a");

  for (var i = font_links.length - 1; i >= 0; i--) {
    font_links[i].addEventListener('click', sendFontMessage, false);
  };
}

function sendFontMessage(e) {
  console.log('font selected', e.target);
  var msg = {
    type: "font-family",
    value: e.target.getAttribute("data-font")
  };
  console.log('sending font message from popup', msg);
  chrome.extension.sendMessage(msg);
}

// TODO: repetetive code, fix
function sendBgColorMessage(e) {
  console.log('color selected', e.target.parentNode.querySelectorAll(".color")[0].value)
  var msg = {
    type: "bg-color",
    value: "#" + e.target.parentNode.querySelectorAll(".color")[0].value
  };
  console.log('sending message from popup', msg);
  chrome.extension.sendMessage(msg);
}

function sendFontColorMessage(e) {
  console.log('color selected', e.target.parentNode.querySelectorAll(".color")[0].value)
  var msg = {
    type: "font-color",
    value: "#" + e.target.parentNode.querySelectorAll(".color")[0].value
  };
  console.log('sending message from popup', msg);
  chrome.extension.sendMessage(msg);
}