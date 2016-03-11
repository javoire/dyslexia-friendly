'use strict';

function injectCss(key, value) {
  var css = '* { ' + key + ': ' + value + ' !important}';
  chrome.tabs.insertCSS({
    code: css,
    runAt: 'document_start' // inject before page css is loaded
  });
}

// Run as soon as a navigation has been committed
// i.e. before document has loaded
chrome.webNavigation.onCommitted.addListener(function() {
  chrome.storage.sync.get('dfFont', function(data) {
    if (!data.dfFont) {
      return;
    }
    injectCss('font-family', data.dfFont);
  });
});

// TODO: this is ugly
chrome.runtime.onMessage.addListener(function(request) {
  if (request.message === 'css') {
    injectCss(request.data.key, request.data.value);
  }
});
