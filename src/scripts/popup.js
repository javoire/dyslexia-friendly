'use strict';

window.onload = function() {
  $(document).ready(function() {
    var inputs = $('#configForm input');
    var form = $('#configForm');

    // shows and hides parts of UI based on config
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
      var obj = {};
      array.forEach(function(item) {
        obj[item.name] = item.value;
      });
      return obj;
    }

    function syncFormToStore(form) {
      var data = formArrayToKeyValue(form.serializeArray());

      // decorate data with checkboxes that are "off" as they're not included in the serialized form data
      $('input[type=checkbox]:not(:checked)', form).each(function(checkbox) {
        data[this.name] = 0;
      });

      // convert string attr to int
      $('input[type=checkbox]:checked', form).each(function(checkbox) {
        data[this.name] = parseInt(this.value);
      });

      // console.log('sending to background script:', data);
      chrome.runtime.sendMessage({
        message: 'updateConfig',
        data: data,
      });

      updateUI(data);
    }

    function syncStoreToForm(config) {
      // for all inputs, based on their type, update their attributes accordingly
      inputs.each(function() {
        var value = config[this.name];
        switch (this.type) {
          case 'radio':
            if (value === this.value) {
              this.checked = true;
            } else {
              this.checked = false;
            }
            break;
          case 'checkbox':
            if (value) {
              this.checked = true;
            } else {
              this.checked = false;
            }
            break;
          case 'range':
            this.value = value;
            $('label[for="' + this.name + '"]').text(value + 'px');
            break;
        }
      });

      updateUI(config);
    }

    // listen on changes on any form elements,
    // submit form and update all configs
    inputs.change(function() {
      if (this.type === 'range') {
        $('label[for="' + this.name + '"]').text(this.value + 'px');
      }
      form.submit();
    });

    // save for data to store
    $('#configForm').submit(function(e) {
      syncFormToStore($(this));
      e.preventDefault();
    });

    /**
     * Init
     */

    chrome.runtime.sendMessage({message: 'init'}, syncStoreToForm);
  });
};
