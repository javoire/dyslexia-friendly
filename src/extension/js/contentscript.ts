'use strict';

import 'jquery';
import $ from 'jquery';

import '../../shared/css/fonts.css';
import '../css/contentscript.css';

import { debug, removeClassStartsWith } from './lib/util';
import { CSS_NAMESPACE, FONT_CLASS_PREFIX, BACKGROUND_CLASS_PREFIX, RULER_ID } from './lib/consts';
import { UserConfig } from './lib/store';

interface RuntimeMessage {
  message: string;
  config?: UserConfig;
}

const ruler = $(`<div id="${RULER_ID}"></div>`);

$(document).ready(function () {
  const body = $('body');
  body.append(ruler);
  body.mousemove(function (event: JQuery.MouseMoveEvent) {
    ruler.css('top', event.pageY);
  });

  // Apply user settings to webpage
  function applyConfigOnPage(config: UserConfig): void {
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

      // apply font size
      body.css('--dyslexia-friendly-font-size', config.fontSize + 'px');

      // remove previous background class
      removeClassStartsWith(body, BACKGROUND_CLASS_PREFIX);
      if (config.backgroundEnabled && config.backgroundChoice !== 'none') {
        body.addClass(BACKGROUND_CLASS_PREFIX + config.backgroundChoice);
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

  chrome.runtime.onMessage.addListener(function (
    request: RuntimeMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) {
    switch (request.message) {
      case 'applyConfigOnPage':
        if (request.config) {
          applyConfigOnPage(request.config);
        }
        break;
    }
    sendResponse(true);
  });
});
