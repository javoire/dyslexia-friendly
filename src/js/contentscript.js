'use strict';

import $ from 'jquery';

const ruler = document.createElement('div');
ruler.setAttribute('id', 'dyslexia-friendly-ruler');

const cssNamespace = 'dyslexia-friendly';
const fontClassPrefix = 'dyslexia-friendly-font-';

function getRulerStyle(height) {
  return 'height:' + height + 'px;';
}

// TODO: structure better
function applyConfig(config) {
  console.log('applying config in contentscript', config);

  if (config.enabled) {
    $(document).ready(function() {
      // apply base CSS
      document.body.classList.add(cssNamespace);

      // find previous font class and remove
      document.body.classList.forEach(function(classname) {
        if (classname.startsWith(fontClassPrefix)) {
          document.body.classList.remove(classname);
        }
      });
      document.body.classList.add(fontClassPrefix + config.font);
    });

    // enable ruler
    // set ruler width
    if (config.rulerEnabled) {
      $(document).ready(function() {
        document.body.appendChild(ruler);
        $('body').mousemove(function(event) {
          $(ruler).css('top', event.pageY - config.rulerWidth / 2);
        });
      });
    } else {
      $(document).ready(function() {
        try {
          document.body.removeChild(ruler);
        } catch (e) {}
      });
    }

    ruler.setAttribute('style', getRulerStyle(config.rulerWidth));
  } else {
    // remove css and ruler
    $(document).ready(function() {
      document.body.classList.remove(cssNamespace);
      try {
        document.body.removeChild(ruler);
      } catch (e) {}
    });
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.message) {
    case 'applyConfigInContentScript':
      applyConfig(request.config);
      break;
  }
});
