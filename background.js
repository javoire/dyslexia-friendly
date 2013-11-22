console.log('background.js loaded');

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.type) {
    case "bg-color":
    console.log('click event in popup received', request.color);
    chrome.tabs.getSelected(null, function(tab){
      var msg = {
        type: "bg-color", 
        color: request.color
      };
      console.log('background.js sending message to content script', msg);
      chrome.tabs.sendMessage(tab.id, msg);
    });

    break;
  }
  return true;
});