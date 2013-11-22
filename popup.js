console.log('popup.js loaded');

window.onload = function() {
  var apply_bg_color = document.getElementById("apply-bg-color");
  apply_bg_color.addEventListener('click', sendBgColorMessage, false);

  var apply_bg_color = document.getElementById("apply-font-color");
  apply_bg_color.addEventListener('click', sendFontColorMessage, false);
}

// TODO: repetetive code, fix
function sendBgColorMessage(e) {
  console.log('click color link', e.target);
  console.log('color selected', e.target.parentNode.querySelectorAll(".color")[0].value)
  chrome.extension.sendMessage({
    type: "bg-color",
    color: "#" + e.target.parentNode.querySelectorAll(".color")[0].value
  });
}

function sendFontColorMessage(e) {
  console.log('click color link', e.target);
  console.log('color selected', e.target.parentNode.querySelectorAll(".color")[0].value)
  chrome.extension.sendMessage({
    type: "bg-color",
    color: "#" + e.target.parentNode.querySelectorAll(".color")[0].value
  });
}