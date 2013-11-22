console.log('content script loaded');

var all = document.getElementsByTagName("*");
for (var i = all.length - 1; i >= 0; i--) {
  all[i].style.backgroundColor = "#eee" // default bg color
  all[i].style.color = "#000" // default bg color
  all[i].style.border = "none" // default
};

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('content script received message', message);
  switch(message.type) {
    case "bg-color":
    console.log('content script received message from background.js', message.color);

    var all = document.getElementsByTagName("*");
    for (var i = all.length - 1; i >= 0; i--) {
      all[i].style.backgroundColor = message.color
    };
    // console.log(document.getElementById("abBody"));
    // document.getElementById("abBody").backgroundColor = message.color // aftonbladet specific
    break;
  }
});