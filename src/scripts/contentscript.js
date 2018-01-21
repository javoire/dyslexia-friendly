'use strict';

var ruler = document.createElement('div');
ruler.setAttribute('id', 'ruler');

function getRulerStyle(height) {
  return 'height:' + height + 'px; position:absolute; background:black; top:100px; opacity:0.3';
}

function applyConfig(config) {
  console.log('applying config in contentscript', config)
  // apply CSS based on config

  // enable ruler
  // set ruler width
  if (config.rulerEnabled) {
    $(document).ready(function () {
      document.body.appendChild(ruler)
      $('body').mousemove(function (event) {
        $(ruler).css('top', event.pageY - 30);
      });
    });
  } else {
    $(document).ready(function () {
      try {
        document.body.removeChild(ruler)
      } catch(e) {};
    });
  }

  ruler.setAttribute('style', getRulerStyle(config.rulerWidth))
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case 'applyConfigInContentScript':
      applyConfig(request.config)
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

// });
