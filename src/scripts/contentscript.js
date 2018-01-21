'use strict';

function applyConfig(config) {

}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case 'applyConfigInContentScript':
      console.log('config', request.config);
      applyConfig(request.config)
      // apply CSS based on config
      // enable ruler
      // set ruler width
      break;
  }

  // console.log(sender.tab ?
  // "from a content script:" + sender.tab.url :
  // "from the extension", request.greeting);
  // if (request.greeting == "hello")
  // sendResponse({farewell: "goodbye"});
});

// $(document).ready(function(){



  // check config for what to enable etc

  //-------------------------------
  // Ruler that follows mouse vertically
  //-------------------------------
  // $.get(chrome.extension.getURL('/ruler.html'), function(data) {
  //   $(data).appendTo('body');
  // });
  // $('body').mousemove(function(event) {
  //   $('#ruler').css('top', event.pageY - 30);
  // });
// });
