'use strict';

window.onload = function() {
  $(document).ready(function() {

    /**
    * Update UI with current state
    */
    function update(config) {
      uiElements.enabled.prop('checked', config.enabled);
      uiElements.fontSelection.removeClass('selected');

      $('[data-config-value="'+config.selectedFont+'"]').addClass('selected');
    }

    var uiElements = {
      enabled: $('[data-config-key="enabled"]'),
      fontSelection: $('[data-config-key="selectedFont"]')
    }


    /**
    * Event handlers
    */

    uiElements.enabled.change(function() {
      var enabled = $(this).is(':checked');
      chrome.runtime.sendMessage({
        message: 'save',
        data: {
          configKey: 'enabled',
          configValue: enabled
        }
      }, update);
    });

    uiElements.fontSelection.click(function() {
      var selectedFont = $(this).data('configValue');
      chrome.runtime.sendMessage({
        message: 'save',
        data: {
          configKey: 'selectedFont',
          configValue: selectedFont
        }
      }, update);
    });
  });
};
