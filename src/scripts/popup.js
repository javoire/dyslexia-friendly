'use strict';

window.onload = function() {
  $(document).ready(function() {
    $('[data-config-key="enabled"]').change(function() {
      var enabled = $(this).is(':checked');
      chrome.runtime.sendMessage({
        message: 'save',
        data: {
          configKey: 'enabled',
          configValue: enabled
        }
      });
    });

    $('[data-config-key="selectedFont"]').click(function() {
      var selectedFont = $(this).data('configValue');
      chrome.runtime.sendMessage({
        message: 'save',
        data: {
          configKey: 'selectedFont',
          configValue: selectedFont
        }
      });
    });
  });
};
