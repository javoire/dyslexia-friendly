'use strict';

import 'jquery';
import $ from 'jquery';

import '../../shared/css/fonts.css';
import '../css/contentscript.css';

import { debug, removeClassStartsWith } from './lib/util';
import { CSS_NAMESPACE, FONT_CLASS_PREFIX, BACKGROUND_CLASS_PREFIX, RULER_ID } from './lib/consts';
import { applyFontScale } from './lib/fontScale';
import { UserConfig } from './lib/store';

interface RuntimeMessage {
  message: string;
  config?: UserConfig;
}

const ruler = $(`<div id="${RULER_ID}"></div>`);

const FONT_COLOR_STYLE_ID = 'dyslexia-friendly-font-color-style';

/**
 * Apply (or clear) the user's chosen text color.
 *
 * Background presets and the namespace CSS set `color` with `!important` on
 * `body`, `body *`, and various content containers (article/main/section/p and
 * matched divs), so a plain inline style on `body` can't win for descendants.
 * Among `!important` rules the winner is decided by specificity: the preset
 * container rules reach up to (0,3,2) (two namespace classes + a class-matching
 * attribute + two element names). We therefore repeat the namespace class four
 * times so our selector is (0,4,1) for descendants — a higher class count that
 * beats every preset rule regardless of its element/attribute parts. The style
 * is removed entirely when disabled so no leftover state remains.
 */
function applyFontColor(enabled: boolean, color: string): void {
  const existing = document.getElementById(FONT_COLOR_STYLE_ID);
  if (!enabled) {
    if (existing) {
      existing.remove();
    }
    return;
  }
  const ns = `.${CSS_NAMESPACE}`.repeat(4);
  const css = `body${ns},body${ns} *{color:${color} !important;}`;
  if (existing) {
    existing.textContent = css;
  } else {
    const style = document.createElement('style');
    style.id = FONT_COLOR_STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }
}

$(document).ready(function () {
  const body = $('body');
  body.append(ruler);
  body.mousemove(function (event: JQuery.MouseMoveEvent) {
    ruler.css('top', event.clientY);
  });

  // Apply user settings to webpage
  function applyConfigOnPage(config: UserConfig): void {
    debug('applying user settings to webpage', config);

    const root = document.documentElement;

    // per-site blacklist (RAN-21): if this host is disabled, treat the
    // extension as fully disabled regardless of other config.
    const siteDisabled = (config.disabledSites || []).includes(
      window.location.hostname,
    );

    const fontScaleEnabled =
      config.extensionEnabled &&
      !siteDisabled &&
      config.fontEnabled &&
      config.fontSizeEnabled;
    applyFontScale(root, fontScaleEnabled, config.fontSize);

    if (config.extensionEnabled && !siteDisabled) {
      debug('extension enabled');
      // apply base CSS
      body.addClass(CSS_NAMESPACE);

      // remove previous font class
      removeClassStartsWith(body, FONT_CLASS_PREFIX);
      if (config.fontEnabled) {
        body.addClass(FONT_CLASS_PREFIX + config.fontChoice);
      }

      // remove previous background class and inline color
      removeClassStartsWith(body, BACKGROUND_CLASS_PREFIX);
      body.css('background-color', '');
      if (config.backgroundEnabled && config.backgroundChoice === 'custom') {
        // custom color is applied inline instead of via a preset class
        body.css('background-color', config.customBackgroundColor);
      } else if (
        config.backgroundEnabled &&
        config.backgroundChoice !== 'none'
      ) {
        body.addClass(BACKGROUND_CLASS_PREFIX + config.backgroundChoice);
      }

      // text color: the user's explicit choice wins over background presets
      applyFontColor(config.fontColorEnabled, config.fontColor);

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
      removeClassStartsWith(body, FONT_CLASS_PREFIX);
      removeClassStartsWith(body, BACKGROUND_CLASS_PREFIX);
      body.css('background-color', '');
      applyFontColor(false, config.fontColor);
      applyFontScale(root, false, config.fontSize);
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
