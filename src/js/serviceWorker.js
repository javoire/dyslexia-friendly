'use strict';

import { debug, error } from './lib/util.js';
import { DEFAULT_CONFIG, store } from './lib/store.js';

function sendConfigToActiveTab(config) {
  debug('notifying contentscript', config);
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    function ([tab]) {
      if (!tab) {
        error('no active tab found, can not send message to contentscript');
        return;
      }
      chrome.tabs.sendMessage(
        tab.id,
        { message: 'applyConfigOnPage', config },
        function (ok) {
          if (ok) {
            debug('contentscript OK reply');
          } else {
            // this typically only happens on chrome settings pages,
            // where the contentscript isn't injected, so it isn't replying.
            // another edge case is when the extension is first installed,
            // then existing tabs won't have the contentscript injected, so
            // this will also occur.
            debug('contentscript no reply');
            debug('error:', chrome.runtime.lastError);
          }
        },
      );
    },
  );
}

/**
 * Installed
 */

// Save default config to store
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onInstalled
// fires when the extension is first installed, updated, or Chrome is updated.
// So we'll always write the default config to the store on install/update
chrome.runtime.onInstalled.addListener(function () {
  debug('installed');
  store.set(DEFAULT_CONFIG, (config) => {
    debug('default config created', config);
  });
});

/**
 * Runtime
 */

// listen for messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'updateConfig') {
    debug('updateConfig event', request.data);
    store.update(request.data, sendResponse);
  } else if (request.message === 'getConfig') {
    debug('getConfig event');
    store.getAll(sendResponse);
  } else if (request.message === 'sendConfigToActiveTab') {
    debug('sendConfigToActiveTab event');
    sendConfigToActiveTab(request.data);
  }
  return true; // so sendResponse can be called async
});

// 1) apply config on navigation / page reload
chrome.webNavigation.onDOMContentLoaded.addListener(function () {
  // onDOMContentLoaded means contentscript.js is alive
  debug('onDOMContentLoaded');
  store.getAll(sendConfigToActiveTab);
});

// 2) apply config on tab switch
// (only works for tabs opened after the extenion has been installed,
// bc otherwise content.js does not exist on the page to react to the message)
chrome.tabs.onActivated.addListener(function () {
  debug('tabs.onActivated');
  store.getAll(sendConfigToActiveTab);
});

// 3) apply config on store change
store.subscribe(sendConfigToActiveTab);
