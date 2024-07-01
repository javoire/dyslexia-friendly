'use strict';

import $ from 'jquery';

import { debug, removeClassStartsWith } from './lib/util.js';
import { CSS_NAMESPACE, FONT_CLASS_PREFIX, RULER_ID } from './lib/consts.js';

const ruler = $(`<div id="${RULER_ID}"></div>`);

$(document).ready(function () {
  const body = $('body');
  body.append(ruler);
  body.mousemove(function (event) {
    ruler.css('top', event.pageY);
  });

  // Apply user settings to webpage
  function applyConfigOnPage(config) {
    debug('applying user settings to webpage', config);

    if (config.extensionEnabled) {
      debug('extension enabled');
      // apply base CSS
      body.addClass(CSS_NAMESPACE);

      // remove previous font class
      removeClassStartsWith(body, FONT_CLASS_PREFIX);
      if (config.fontEnabled) {
        body.addClass(FONT_CLASS_PREFIX + config.fontChoice);
      }

      // ruler
      ruler.css('background-color', config.rulerColor);
      ruler.css('opacity', config.rulerOpacity);
      ruler.css('marginTop', -config.rulerSize / 2);
      ruler.css('height', config.rulerSize);
      if (config.rulerEnabled) {
        ruler.show();
      } else {
        ruler.hide();
      }
    } else {
      debug('extension disabled');
      // remove main class to disable all modifications
      body.removeClass(CSS_NAMESPACE);
      ruler.hide();
    }
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.message) {
        case 'applyConfigOnPage':
          applyConfigOnPage(request.config);
          break;
      }
      sendResponse(true);
    },
  );
});
