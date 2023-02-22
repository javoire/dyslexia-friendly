/* eslint-disable no-console */
'use strict';

const { store, DEFAULT_CONFIG } = require('./lib/store');

function notifyContentScript(config) {
  console.log('notifying contentscript', config);
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id, // TODO: null check
      { message: 'applyConfigInContentScript', config },
      function(ok) {
        if (ok) {
          console.log('contentscript OK reply');
        } else {
          // this typically only happens on chrome settings pages,
          // where the contentscript isn't injected, so it isn't replying.
          // another edge case is when the extension is first installed,
          // then existing tabs won't have the contentscript injected, so
          // this will also occur.
          console.log('contentscript no reply');
          console.log('error:', chrome.runtime.lastError);
        }
      }
    );
  });
}

/**
 * Installed
 */

// save default config to store
chrome.runtime.onInstalled.addListener(function() {
  console.log('installed');
  store.set(DEFAULT_CONFIG, config => {
    console.log('default config saved', config);
  });
});

/**
 * Runtime
 */

// listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'updateConfig') {
    console.log('updateConfig event', request.data);
    store.update(request.data, sendResponse);
  } else if (request.message === 'getConfig') {
    console.log('getConfig event');
    store.getAll(sendResponse);
  }
  return true; // so sendResponse can be called async
});

// 1) apply config on navigation / page reload
chrome.webNavigation.onDOMContentLoaded.addListener(function() {
  // onDOMContentLoaded means contentscript.js is alive
  console.log('onDOMContentLoaded');
  store.getAll(notifyContentScript);
});

// 2) apply config on tab switch
// (only works for tabs opened after the extenion has been installed,
// bc otherwise content.js does not exist on the page to react to the message)
chrome.tabs.onActivated.addListener(function() {
  console.log('tabs.onActivated');
  store.getAll(notifyContentScript);
});

// 3) apply config on store change
store.subscribe(notifyContentScript);
