import 'jquery';
import $ from 'jquery';

import '../../shared/css/tailwind.css';
import '../../shared/css/fonts.css';

import '../css/popup.css';

import { formToConfig, debug, removeClassStartsWith } from './lib/util.js';
import { FONT_CLASS_PREFIX } from './lib/consts.js';

/*
 * Send form to background store for saving
 *
 * @param form - jQuery form object
 * @param callback - gets new config as param
 */
function saveFormStateToStore(form, callback) {
  const config = formToConfig(form);

  debug('sending to service worker:', config);
  // pass new config to background script for saving
  chrome.runtime.sendMessage(
    {
      message: 'updateConfig',
      data: config,
    },
    callback,
  );
}

/**
 * Update UI state from config
 *
 * @param config
 * @param inputs - jQuery elements
 * @param body - jQuery element
 * @param ruler - jQuery element
 * @returns {undefined}
 */
function updateUiFromConfig(config, inputs, body, ruler) {
  debug('Updating popup UI with config:', config);

  // update all form input states
  inputs.each(function () {
    const value = config[this.name];
    switch (this.type) {
      case 'radio':
        this.checked = value === this.value;
        break;
      case 'checkbox':
        this.checked = !!value;
        break;
      default:
        this.value = value;
        break;
    }
  });

  // update ruler
  updateRulerSize(ruler, config.rulerSize);
  updateRulerOpacity(ruler, config.rulerOpacity);
  updateRulerColor(ruler, config.rulerColor);

  // toggle font
  removeClassStartsWith(body, FONT_CLASS_PREFIX);
  body.addClass(FONT_CLASS_PREFIX + config.fontChoice);

  // toggle visible sections
  const visibleSections = $('[data-show-when]');
  visibleSections.each(function () {
    const elem = $(this);

    // grab the data attr that controls when to show this element
    const showWhen = elem.data('show-when');

    // very rudimentary support for and-operator...
    const show = showWhen
      .split('&&')
      .map((s) => config[s.trim()])
      .every(Boolean);

    if (show) {
      elem.show();
    } else {
      elem.hide();
    }
  });
}

window.onload = function () {
  $(document).ready(function () {
    const inputs = $('#configForm input');
    const ruler = $('#dyslexia-friendly-ruler');
    const configForm = $('#configForm');
    const body = $('body');

    // initially hide ruler, it'll be temporarily shown
    // when related inputs are being changed
    ruler.hide();

    // continuous (live) event handler on input change
    inputs.on('input', function () {
      // update changes live in the popup
      updateUiFromConfig(formToConfig(configForm), inputs, body, ruler);

      // update changes live on the page for immediate feedback
      // this sends directly to the active tab, not via storage, to not spam the storage
      // there's a rate limit https://developer.chrome.com/docs/extensions/reference/api/storage
      // MAX_WRITE_OPERATIONS_PER_MINUTE
      const config = formToConfig(configForm);
      debug('sending config to active tab', config);
      requestAnimationFrame(() => {
        chrome.runtime.sendMessage({
          message: 'sendConfigToActiveTab',
          data: config,
        });
      });

      // if we're changing ruler settings, make the ruler
      // temporarily visible to reflect the changes live
      if (
        this.name === 'rulerSize' ||
        this.name === 'rulerOpacity' ||
        this.name === 'rulerColor'
      ) {
        ruler.show();
      }
    });

    // submitting form  on input value changes (not live)
    inputs.change(function () {
      configForm.submit();

      // ruler may have been shown while changing a ruler related input
      ruler.hide();
    });

    configForm.submit(function (e) {
      saveFormStateToStore($(this), (config) => {
        updateUiFromConfig(config, inputs, body, ruler);
      });
      e.preventDefault();
    });

    // bind ruler to mouse
    body.mousemove(() => {
      ruler.css('top', event.pageY);
    });

    // On popup open, load config from store and update ui,
    chrome.runtime.sendMessage({ message: 'getConfig' }, (config) => {
      updateUiFromConfig(config, inputs, body, ruler);
    });
  });
};

const updateRulerSize = function (ruler, value) {
  ruler.css('height', value);
  ruler.css('marginTop', -value / 2);
};

const updateRulerOpacity = function (ruler, value) {
  ruler.css('opacity', value);
};

const updateRulerColor = function (ruler, value) {
  ruler.css('background-color', value);
};
