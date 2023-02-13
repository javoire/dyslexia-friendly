/* eslint-disable no-console */
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
  console.log('[Dyslexia Friendly] applying user settings to webpage', config);
  $(document).ready(function() {
    if (config.extensionEnabled) {
      // apply base CSS
      document.body.classList.add(cssNamespace);

      // find previous font class and remove
      document.body.classList.forEach(function(classname) {
        if (classname.startsWith(fontClassPrefix)) {
          document.body.classList.remove(classname);
        }
      });
      // add chosen font
      document.body.classList.add(fontClassPrefix + config.fontChoice);

      // enable ruler
      // set ruler width
      if (config.rulerEnabled) {
        document.body.appendChild(ruler);
        $('body').mousemove(function(event) {
          $(ruler).css('top', event.pageY - config.rulerSize / 2);
        });
      } else {
        try {
          document.body.removeChild(ruler);
        } catch (e) {}
      }

      ruler.setAttribute('style', getRulerStyle(config.rulerSize));
    } else {
      // remove css and ruler
      document.body.classList.remove(cssNamespace);
      try {
        document.body.removeChild(ruler);
      } catch (e) {}
    }
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.message) {
    case 'applyConfigInContentScript':
      console.log(request, 'SDSADSAD');
      applyConfig(request.config);
      break;
  }
  return true;
});
