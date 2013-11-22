console.log('background.js loaded');

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.type) {
    case "color-divs":
    console.log('click event in popup received', request.color);
    chrome.tabs.getSelected(null, function(tab){
      console.log('background.js sending message to content script');
      chrome.tabs.sendMessage(tab.id, {
        type: "colors-div", 
        color: request.color
      });
    });

    break;
  }
  return true;
});