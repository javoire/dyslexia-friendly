'use strict';

const { store, DEFAULT_CONFIG } = require('./lib/store');

function notifyContentScript(config) {
  console.log('notifying contentscript');
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { message: 'applyConfigInContentScript', config: config },
      function() {}
    );
  });
}

/**
 * Installed
 */

// save default store if not exists
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get('config', function(data) {
    if (!data.config) {
      chrome.storage.sync.set({ config: DEFAULT_CONFIG }, function() {
        console.log('Default config saved', DEFAULT_CONFIG);
      });
    }
  });
});

/**
 * Runtime
 */

// listen for messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'updateConfig') {
    store.update(request.data);
  } else if (request.message === 'init') {
    store.get(null, sendResponse);
    return true; // otherwise sendResponse won't be called
  }
});

// 1) apply config on navigation
// NOTE: seems to run many times on one nav
chrome.webNavigation.onCommitted.addListener(function() {
  // Run as soon as a navigation has been committed
  // i.e. before document has loaded

  console.log('onCommitted');
  store.get(null, notifyContentScript);
});

// 2) apply config on tab switch
chrome.tabs.onActivated.addListener(function() {
  console.log('onActivated');
  store.get(null, notifyContentScript);
});

// 3) apply config on store change for current tab
store.subscribe(notifyContentScript);
