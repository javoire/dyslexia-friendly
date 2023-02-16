/* eslint-disable no-console */
'use strict';

import $ from 'jquery';

import { removeClassStartsWith } from './lib/util';

const cssNamespace = 'dyslexia-friendly';
const fontClassPrefix = 'dyslexia-friendly-font-';
const ruler = $('<div id="dyslexia-friendly-ruler"></div>');

$(document).ready(function() {
  $('body').append(ruler);
  $('body').mousemove(function(event) {
    ruler.css('top', event.pageY);
  });

  function applyConfig(config) {
    console.log(
      '[Dyslexia Friendly] applying user settings to webpage',
      config
    );
    const body = $('body');

    if (config.extensionEnabled) {
      // apply base CSS
      body.addClass(cssNamespace);

      // remove previous font class
      removeClassStartsWith(body, fontClassPrefix);
      if (config.fontEnabled) {
        body.addClass(fontClassPrefix + config.fontChoice);
      }

      ruler.css('marginTop', -config.rulerSize / 2);
      ruler.css('height', config.rulerSize);
      if (config.rulerEnabled) {
        ruler.show();
      } else {
        ruler.hide();
      }
    } else {
      // remove main class to disable all modifications
      body.removeClass(cssNamespace);
      ruler.hide();
    }
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
      case 'applyConfigInContentScript':
        applyConfig(request.config);
        break;
    }
    sendResponse(true);
  });
});
