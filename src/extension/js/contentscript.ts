'use strict';

import 'jquery';
import $ from 'jquery';

import '../../shared/css/fonts.css';
import '../css/contentscript.css';

import { RULER_ID } from './lib/consts';
import { UserConfig } from './lib/store';
import { applyConfigToRoot } from './lib/applyConfig';

interface RuntimeMessage {
  message: string;
  config?: UserConfig;
}

const ruler = $(`<div id="${RULER_ID}"></div>`);

const FONT_COLOR_STYLE_ID = 'dyslexia-friendly-font-color-style';

$(document).ready(function () {
  const body = $('body');
  body.append(ruler);
  body.mousemove(function (event: JQuery.MouseMoveEvent) {
    ruler.css('top', event.clientY);
  });

  // Apply user settings to the current webpage.
  function applyConfigOnPage(config: UserConfig): void {
    applyConfigToRoot(config, {
      root: body,
      ruler,
      scaleRoot: document.documentElement,
      fontColorStyleId: FONT_COLOR_STYLE_ID,
      hostname: window.location.hostname,
    });
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
