'use strict';

window.onload = function () {
  $(document).ready(function () {

    var inputs = $('#configForm input');
    var form = $('#configForm');

    function formArrayToKeyValue(array) {
      var obj = {};
      array.forEach(function (item) {
        obj[item.name] = item.value
      })
      return obj;
    }

    function syncFormToStore(form) {
      var data = formArrayToKeyValue(form.serializeArray());

      // decorate data with checkboxes that are "off" as they're not included in the serialized form data
      $('input[type=checkbox]:not(:checked)', form)
        .each(function (checkbox) {
          data[this.name] = 0
        });

      console.log('sending to background script:', data);
      chrome.runtime.sendMessage({
        message: 'updateConfig',
        data: data
      });
    }

    function syncStoreToForm(config) {
      // find elems where key is [name] and update state based on value
      window.hej = []
      Object.keys(config).forEach(function (key) {
        var hej = form.find('[name="' + key + '"]')
        window.hej.push(hej)
      });

      // for all inputs, based on their type, update their attributed accordingly

      inputs.each(function () {
        var value = config[this.name];
        switch (this.type) {
          case 'radio':
            if (value === this.value) {
              this.checked = true
            } else {
              this.checked = false
            }
            break;
          case 'checkbox':
            if (value) {
              this.checked = true
            } else {
              this.checked = false
            }
            break;
          case 'range':
            this.value = value
            $('label[for="'+ this.name +'"]').text(value + 'px')
            break;
        }
      })
    }

    // listen on changes on any form elements,
    // submit form and update all configs
    inputs.change(function () {
      if (this.type === 'range') {
        $('label[for="'+ this.name +'"]').text(this.value + 'px')
      }
      form.submit()
    })

    // update UI and save new config
    $('#configForm').submit(function (e) {
      syncFormToStore($(this))
      e.preventDefault();
    })

    /**
     * Update UI with current state of the config
     * @param  {Object} config Current config
     */
    // function update(config) {
    //   uiElements.enabled.prop('checked', config.enabled);
    //   uiElements.fontSelection.removeClass('selected');

    //   $('[data-config-value="'+config.selectedFont+'"]').addClass('selected');
    // }

    // var uiElements = {
    //   enabled: $('[data-config-key="enabled"]'),
    //   fontSelection: $('[data-config-key="selectedFont"]')
    // }

    /**
    * Init
    */

    chrome.runtime.sendMessage({ message: 'init' }, syncStoreToForm);

    /**
    * Event handlers
    */

    // uiElements.enabled.change(function() {
    //   var enabled = $(this).is(':checked');
    //   chrome.runtime.sendMessage({
    //     message: 'save',
    //     data: {
    //       configKey: 'enabled',
    //       configValue: enabled
    //     }
    //   }, update);
    // });

    // uiElements.fontSelection.click(function() {
    //   var selectedFont = $(this).data('configValue');
    //   chrome.runtime.sendMessage({
    //     message: 'save',
    //     data: {
    //       configKey: 'selectedFont',
    //       configValue: selectedFont
    //     }
    //   }, update);
    // });
  });
};
