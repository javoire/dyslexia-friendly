console.log('content script loaded');

var all = document.getElementsByTagName("*");
for (var i = all.length - 1; i >= 0; i--) {
  // all[i].style.backgroundColor = "#eee" // default bg color
  // all[i].style.color = "#000" // default bg color
  // all[i].style.border = "none" // default
  all[i].style.fontFamily = "OpenDyslexic"; // default
};

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('content script received message', message);
  switch(message.type) {
    case "bg-color":
      console.log('changing bg color to', message.value);
      var all = document.getElementsByTagName("*");
      for (var i = all.length - 1; i >= 0; i--) {
        if (all[i].nodeName != "P" || all[i].nodeName != "LI") {
          all[i].style.backgroundColor = message.value
        };
      };
      break;
    case "font-color":
      console.log('changing font color to', message.value);
      var all = document.getElementsByTagName("*");
      for (var i = all.length - 1; i >= 0; i--) {
        all[i].style.color = message.value
      };
      break;
    case "font-family":
      console.log('changing font family to', message.value);
      var all = document.getElementsByTagName("*");
      for (var i = all.length - 1; i >= 0; i--) {
        all[i].style.fontFamily = message.value
      };
      break;
  }
});