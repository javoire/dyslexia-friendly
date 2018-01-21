'use strict';

var ruler = document.createElement('div');
ruler.setAttribute('id', 'dyslexia-friendly-ruler');

var cssNamespace = 'dyslexia-friendly';
var fontPrefix = 'dyslexia-friendly-font-';

function getRulerStyle(height) {
  return 'height:' + height + 'px;';
}


function applyConfig(config) {
  console.log('applying config in contentscript', config)

  if (config.enabled) {
    $(document).ready(function () {
      // apply base CSS
      document.body.classList.add(cssNamespace)

      // find previous font class and remove
      document.body.classList.forEach(function (classname) {
        if (classname.startsWith(fontPrefix)) {
          document.body.classList.remove(classname)
        }
      })
      document.body.classList.add(fontPrefix + config.font)
    });

    // apply font

    // enable ruler
    // set ruler width
    if (config.rulerEnabled) {
      $(document).ready(function () {
        document.body.appendChild(ruler)
        $('body').mousemove(function (event) {
          $(ruler).css('top', event.pageY - config.rulerWidth / 2);
        });
      });
    } else {
      $(document).ready(function () {
        try {
          document.body.removeChild(ruler)
        } catch (e) { };
      });
    }

    ruler.setAttribute('style', getRulerStyle(config.rulerWidth))
  } else {
    // remove css and ruler
    $(document).ready(function () {
      document.body.classList.remove(cssNamespace)
      try {
        document.body.removeChild(ruler)
      } catch (e) { };
    });
  }
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
