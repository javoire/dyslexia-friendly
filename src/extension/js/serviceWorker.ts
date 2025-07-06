import { debug, error } from './lib/util';
import { DEFAULT_CONFIG, store, UserConfig } from './lib/store';

interface RuntimeMessage {
  message: string;
  data?: UserConfig | Partial<UserConfig>;
}

function sendConfigToActiveTab(config: UserConfig): void {
  debug('notifying contentscript', config);
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    function (tabs: chrome.tabs.Tab[]) {
      const tab = tabs[0];
      if (!tab || !tab.id) {
        error('no active tab found, can not send message to contentscript');
        return;
      }
      chrome.tabs.sendMessage(
        tab.id,
        { message: 'applyConfigOnPage', config },
        function (response?: any) {
          if (response) {
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
chrome.runtime.onInstalled.addListener(function (
  details: chrome.runtime.InstalledDetails,
) {
  debug('installed', details);
  store.set(DEFAULT_CONFIG, (config: UserConfig) => {
    debug('default config created', config);
  });
});

/**
 * Runtime
 */

// listen for messages from popup
chrome.runtime.onMessage.addListener(function (
  request: RuntimeMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) {
  switch (request.message) {
    case 'updateConfig':
      debug('updateConfig event', request.data);
      if (request.data) {
        store.update(request.data, sendResponse);
      }
      break;
    case 'getConfig':
      debug('getConfig event');
      store.getAll(sendResponse);
      break;
    case 'sendConfigToActiveTab':
      debug('sendConfigToActiveTab event');
      if (request.data) {
        sendConfigToActiveTab(request.data as UserConfig);
      }
      break;
  }
  return true; // so sendResponse can be called async
});

// 1) apply config on navigation / page reload
chrome.webNavigation.onDOMContentLoaded.addListener(function (
  details: chrome.webNavigation.WebNavigationFramedCallbackDetails,
) {
  // onDOMContentLoaded means contentscript.js is alive
  debug('onDOMContentLoaded', details);
  store.getAll(sendConfigToActiveTab);
});

// 2) apply config on tab switch
// (only works for tabs opened after the extenion has been installed,
// bc otherwise content.js does not exist on the page to react to the message)
chrome.tabs.onActivated.addListener(function (
  activeInfo: chrome.tabs.TabActiveInfo,
) {
  debug('tabs.onActivated', activeInfo);
  store.getAll(sendConfigToActiveTab);
});

// 3) apply config on store change
store.subscribe(sendConfigToActiveTab);
