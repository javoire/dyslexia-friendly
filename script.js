console.log('content script loaded');

// var all = document.getElementsByTagName("*");
// for (var i = all.length - 1; i >= 0; i--) {
  // all[i].style.backgroundColor = "#eee" // default bg color
  // all[i].style.color = "#000" // default bg color
  // all[i].style.border = "none" // default
// };

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('content script received message', message);
  switch(message.type) {
    case "bg-color":
      console.log('changing bg color to', message.color);
      var all = document.getElementsByTagName("*");
      for (var i = all.length - 1; i >= 0; i--) {
        all[i].style.backgroundColor = message.color
      };
      break;

    case "font-color":
      console.log('changing font color to', message.color);
      var all = document.getElementsByTagName("*");
      for (var i = all.length - 1; i >= 0; i--) {
        all[i].style.color = message.color
      };
      break;
    // case "font-family":
      // console.log('changing font family to', message.color);
      // var all = document.getElementsByTagName("*");
      // for (var i = all.length - 1; i >= 0; i--) {
      //   all[i].style.color = message.color
      // };
      // break;
  }
});