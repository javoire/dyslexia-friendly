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
          console.log('contentscript no reply');
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
// This is not working at all. Even with a 2 second delay,
// the message is not sent to contentscript:
// "Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist."
// chrome.tabs.onActivated.addListener(function() {
//   console.log('onActivated');
//   setTimeout(() => {
//     store.getAll(notifyContentScript);
//   }, 2000);
// });

// 3) apply config on store change
store.subscribe(notifyContentScript);
