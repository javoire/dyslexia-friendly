import '../css/fonts.css';
import '../css/tailwind.css';
import '../css/popup.css';
import 'jquery';
import $ from 'jquery';

/**
 * Parse config and update corresponding UI elements
 *
 * @param config
 * @returns {undefined}
 */
function updateUI(config) {
  // UPDATE UI
  if (config.enabled) {
    // height issue: https://bugs.chromium.org/p/chromium/issues/detail?id=428044
    setTimeout(function() {
      $('.show-when-enabled').show();
    }, 100);
  } else {
    $('.show-when-enabled').hide();
  }
  if (config.rulerEnabled) {
    setTimeout(function() {
      $('.show-when-ruler').show();
    }, 100);
  } else {
    $('.show-when-ruler').hide();
  }
}

function formArrayToKeyValue(array) {
  const obj = {};
  array.forEach(item => {
    obj[item.name] = item.value;
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
 * @param callback - callback when form has been saved, is passed {config}
 */
function syncFormToStore(form, callback) {
  const config = formArrayToKeyValue(form.serializeArray());

  // decorate config with checkboxes that are "off" as they're not included in the serialized form config
  $('input[type=checkbox]:not(:checked)', form).each(function() {
    config[this.name] = 0;
  });

  // convert string attr to int
  $('input[type=checkbox]:checked', form).each(function() {
    config[this.name] = parseInt(this.value);
  });

  // console.log('sending to background script:', config);
  chrome.runtime.sendMessage({
    message: 'updateConfig',
    data: config
  });

  if (isValidCallback(callback)) {
    callback(config);
  }
}

/**
 * Update form state based on saved config
 *
 * @param config
 * @param inputs
 * @returns {undefined}
 */
function syncStoreToForm(config, inputs) {
  // for all inputs, based on their type, update their attributes accordingly
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
        $('label[for="' + this.name + '"]').text(value + 'px');
        break;
    }
  });
}

window.onload = function() {
  $(document).ready(function() {
    const inputs = $('#configForm input');
    const form = $('#configForm');

    // listen on changes on any form elements,
    // submit form and update all configs
    inputs.change(function() {
      if (this.type === 'range') {
        $('label[for="' + this.name + '"]').text(this.value + 'px');
      }
      form.submit();
    });

    // save form data to store
    $('#configForm').submit(function(e) {
      syncFormToStore($(this), updateUI);
      e.preventDefault();
    });

    /**
     * Init
     */

    chrome.runtime.sendMessage({ message: 'init' }, config => {
      // load stored config data and update form and UI to reflect
      syncStoreToForm(config, inputs);
      updateUI(config);
    });
  });
};
