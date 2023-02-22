/* eslint-disable no-console */
import 'tw-elements';
import 'jquery';
import $ from 'jquery';

import '../css/fonts.css';
import '../css/tailwind.css';
import '../css/popup.css';

import { removeClassStartsWith, arrayToConfigMap } from './lib/util';
import { FONT_CLASS_PREFIX } from './lib/consts';

/*
 * Send form to background store for saving
 *
 * @param form - jQuery form object
 * @param callback - gets new config as param
 */
function saveFormStateToStore(form, callback) {
  const formState = arrayToConfigMap(form.serializeArray());

  console.log('sending to background script:', formState);
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
function updateUiFromConfig(config, inputs, body) {
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
      case 'range':
        this.value = value;
        break;
    }
  });

  // toggle font
  removeClassStartsWith(body, FONT_CLASS_PREFIX);
  body.addClass(FONT_CLASS_PREFIX + config.fontChoice);

  // toggle visible sections
  const visibleSections = $('[data-show-when]');
  visibleSections.each(function() {
    const elem = $(this);
    const showWhen = elem.data('show-when');
    if (config[showWhen]) {
      elem.show();
    } else {
      elem.hide();
    }
  });
}

window.onload = function() {
  $(document).ready(function() {
    const inputs = $('#configForm input');
    const form = $('#configForm');
    const ruler = $('#dyslexia-friendly-ruler');
    const rulerRangeSlider = $('#ruler-size-range');
    const configForm = $('#configForm');
    const body = $('body');

    // form is submitted on any input change
    inputs.change(function() {
      form.submit();
    });

    // submitting the form saves the new config and updates the UI
    configForm.submit(function(e) {
      saveFormStateToStore($(this), config => {
        updateUiFromConfig(config, inputs, body);
      });
      e.preventDefault();
    });

    // update ruler size live as the user slides the range
    rulerRangeSlider.on('input', function() {
      const value = rulerRangeSlider.val();
      updateRulerSize(ruler, value);
    });

    // bind ruler to mouse
    body.mousemove(() => {
      ruler.css('top', event.pageY);
    });

    // On popup open, load config from store and update ui,
    chrome.runtime.sendMessage({ message: 'getConfig' }, config => {
      updateRulerSize(ruler, config.rulerSize);
      updateUiFromConfig(config, inputs, body);
    });
  });
};

const updateRulerSize = function(ruler, value) {
  ruler.css('height', value);
  ruler.css('marginTop', -value / 2);
};
