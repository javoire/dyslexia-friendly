console.log('background.js loaded');

// forward incoming msg from popup to content script
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('click event in popup received', request);

  chrome.tabs.getSelected(null, function(tab){
    var msg = {
      type: request.type,
      value: request.value
    };
    console.log('background.js sending message to content script', msg);
    chrome.tabs.sendMessage(tab.id, msg);
  });

  return true;
});