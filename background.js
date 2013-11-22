console.log('background.js loaded');

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('click event in popup received', request);

  chrome.tabs.getSelected(null, function(tab){
    var msg = {
      type: request.type, 
      color: request.color
    };
    console.log('background.js sending message to content script', msg);
    chrome.tabs.sendMessage(tab.id, msg);
  });

  return true;
});