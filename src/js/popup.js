/* eslint-disable no-console */
import 'tw-elements';
import 'jquery';
import $ from 'jquery';

import '../css/fonts.css';
import '../css/tailwind.css';
import '../css/popup.css';

/**
 * Parse config and update corresponding UI elements
 *
 * @param config
 * @returns {undefined}
 */
// function updateUI(config) {
//   // UPDATE UI
//   if (config.enabled) {
//     // height issue: https://bugs.chromium.org/p/chromium/issues/detail?id=428044
//     setTimeout(function() {
//       $('.show-when-enabled').show();
//     }, 100);
//   } else {
//     $('.show-when-enabled').hide();
//   }
//   if (config.rulerEnabled) {
//     setTimeout(function() {
//       $('.show-when-ruler').show();
//     }, 100);
//   } else {
//     $('.show-when-ruler').hide();
//   }
// }

function arrayToConfigMap(array) {
  const obj = {};
  array.forEach(item => {
    // the serialized form has "on" as checkbox values, convert to boolean instead
    obj[item.name] = item.value === 'on' ? true : item.value;
  });
  return obj;
}

function isValidCallback(callback) {
  return callback && typeof callback === 'function';
}

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
    updatedConfig => {
      // pass new config back to caller
      if (isValidCallback(callback)) {
        callback(updatedConfig);
      }
    }
  );
}

/**
 * Update form state based on config
 *
 * @param config
 * @param inputs - jQuery elements
 * @returns {undefined}
 */
function updateUiFromConfig(config, inputs) {
  // update all form input states
  inputs.each(function() {
    const value = config[this.name];
    console.log(this.name);
    switch (this.type) {
      case 'radio':
        this.checked = value === this.value;
        break;
      case 'checkbox':
        console.log(this.checked);
        this.checked = !!value;
        break;
      case 'range':
        this.value = value;
        // $('label[for="' + this.name + '"]').text(value + 'px');
        break;
    }
  });
  // update other UI states
}

window.onload = function() {
  $(document).ready(function() {
    const inputs = $('#configForm input');
    const form = $('#configForm');
    const ruler = $('#dyslexia-friendly-ruler');

    // form is submitted on any input change
    inputs.change(function() {
      form.submit();
    });

    // submitting the form saves the new config and updates the UI
    $('#configForm').submit(function(e) {
      saveFormStateToStore($(this), config => {
        updateUiFromConfig(config, inputs);
      });
      e.preventDefault();
    });

    // On startup, load config from store and update ui,
    // and bind ruler position to mouse Y
    chrome.runtime.sendMessage({ message: 'getConfig' }, config => {
      $('body').mousemove(() => ruler.css('top', event.pageY));
      updateUiFromConfig(config, inputs);
    });
  });
};

const getRulerTopPixels = config => config.rulerWidth / 2;
