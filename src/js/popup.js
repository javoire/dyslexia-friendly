/* eslint-disable no-console */
import 'tw-elements';
import 'jquery';
import $ from 'jquery';

import '../css/fonts.css';
import '../css/tailwind.css';
import '../css/popup.css';

import { arrayToConfigMap, debug, removeClassStartsWith } from './lib/util';
import { FONT_CLASS_PREFIX } from './lib/consts';

/*
 * Send form to background store for saving
 *
 * @param form - jQuery form object
 * @param callback - gets new config as param
 */
function saveFormStateToStore(form, callback) {
  const formState = arrayToConfigMap(form.serializeArray());

  debug('sending to background script:', formState);
  // pass new config to background script for saving
  chrome.runtime.sendMessage(
    {
      message: 'updateConfig',
      data: formState
    },
    callback
  );
}

/**
 * Update UI state from config
 *
 * @param config
 * @param inputs - jQuery elements
 * @returns {undefined}
 */
function updateUiFromConfig(config, inputs, body, ruler) {
  debug('Updating popup UI with config:', config);

  // update all form input states
  inputs.each(function() {
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
  visibleSections.each(function() {
    const elem = $(this);

    // grab the data attr that controls when to show this element
    const showWhen = elem.data('show-when');

    // very rudimentary support for and-operator...
    const show = showWhen
      .split('&&')
      .map(s => config[s.trim()])
      .every(Boolean);

    if (show) {
      elem.show();
    } else {
      elem.hide();
    }
  });
}

window.onload = function() {
  $(document).ready(function() {
    const inputs = $('#configForm input');
    const ruler = $('#dyslexia-friendly-ruler');
    const configForm = $('#configForm');
    const body = $('body');

    // form is submitted on any input change, so changes are
    // reflected live on the page as the user modifies inputs
    // (I don't know if this could have negative performance implications on slow devices...)
    inputs.on('input', function() {
      configForm.submit();
    });
    configForm.submit(function(e) {
      saveFormStateToStore($(this), config => {
        updateUiFromConfig(config, inputs, body, ruler);
      });
      e.preventDefault();
    });

    // bind ruler to mouse
    body.mousemove(() => {
      ruler.css('top', event.pageY);
    });

    // On popup open, load config from store and update ui,
    chrome.runtime.sendMessage({ message: 'getConfig' }, config => {
      updateUiFromConfig(config, inputs, body, ruler);
    });
  });
};

const updateRulerSize = function(ruler, value) {
  ruler.css('height', value);
  ruler.css('marginTop', -value / 2);
};

const updateRulerOpacity = function(ruler, value) {
  ruler.css('opacity', value);
};

const updateRulerColor = function(ruler, value) {
  ruler.css('background-color', value);
};
