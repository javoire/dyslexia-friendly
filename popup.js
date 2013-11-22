console.log('popup.js loaded');

window.onload = function() {
  document.getElementById("apply-bg-color").addEventListener('click', sendBgColorMessage, false);
  document.getElementById("apply-font-color").addEventListener('click', sendFontColorMessage, false);
}

// TODO: repetetive code, fix
function sendBgColorMessage(e) {
  console.log('color selected', e.target.parentNode.querySelectorAll(".color")[0].value)
  var msg = {
    type: "bg-color",
    color: "#" + e.target.parentNode.querySelectorAll(".color")[0].value
  };
  console.log('sending message from popup', msg);
  chrome.extension.sendMessage(msg);
}

function sendFontColorMessage(e) {
  console.log('color selected', e.target.parentNode.querySelectorAll(".color")[0].value)
  var msg = {
    type: "font-color",
    color: "#" + e.target.parentNode.querySelectorAll(".color")[0].value
  };
  console.log('sending message from popup', msg);
  chrome.extension.sendMessage(msg);
}