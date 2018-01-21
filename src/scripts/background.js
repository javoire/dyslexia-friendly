'use strict';

/**
 * Inject CSS in the web page
 * @param  {String} property   Css property
 * @param  {String} value Css value
 */
function injectCss(property, value) {
  var css = '* { ' + property + ': ' + value + ' !important}';
  chrome.tabs.insertCSS({
    code: css,
    runAt: 'document_start' // inject before page css is loaded
  });
}

// default user store
var DEFAULT_CONFIG = {
  enabled: 1,
  font: "opendyslexic",
  rulerEnabled: 1,
  rulerWidth: "26"
};

var subscribers = [];
var store = {
  /**
   * Interpolate form data with what's in the store, in case values are missing from the form
   * then save.
   */
  update: function (newData, cb) {
    chrome.storage.sync.get('config', function (store) {
      var updated = Object.assign(store.config, newData);
      chrome.storage.sync.set({ config: updated }, function () {
        console.log('Saved config', updated);
        // notify subscribers
        subscribers.forEach(function (cb) {
          cb(updated)
        })
        return cb ? cb(updated) : true;
      });
    });
  },

  get: function (key, cb) {
    chrome.storage.sync.get('config', function (store) {
      var config = store.config || DEFAULT_CONFIG; // fallback to default store

      // don't do this
      if (!key) {
        return cb(config);
      }
      return cb ? cb(config[key]) : true;
    });
  },

  // subscribe to changes in store
  subscribe: function (cb) {
    subscribers.push(cb)
    cb(store);
  }
};

/**
 * Installed
 */

// save default store if not exists
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.get('config', function (data) {
    if (!data.config) {
      chrome.storage.sync.set({ config: DEFAULT_CONFIG }, function () {
        console.log('Default config saved', DEFAULT_CONFIG);
      });
    }
  });
});

/**
 * Runtime
 */

// listen for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'updateConfig') {
    // store.set(request.data.configKey, request.data.configValue, function (store) {
    // Do things based on the configKey

    // NOTE: things here might move to contentscript.js
    // TODO: enable/disable
    // TODO: set ruler height
    // TODO: update colors
    // Set font family
    // injectCss('font-family', store.selectedFont);

    // pass the store to the popup
    // sendResponse(store);
    // });
    console.log(request)

    store.update(request.data)

    // return true; // otherwise sendResponse won't be called
  } else if (request.message === 'init') {
    store.get(null, sendResponse);
    return true; // otherwise sendResponse won't be called
  }
});

// 1) apply config on navigation
// NOTE: seems to run many times on one nav
chrome.webNavigation.onCommitted.addListener(function () {
  // Run as soon as a navigation has been committed
  // i.e. before document has loaded

  console.log('onCommitted');
  store.get(null, notifyContentScript);
});

// 2) apply config on tab switch
chrome.tabs.onActivated.addListener(function () {
  console.log('onActivated')
  store.get(null, notifyContentScript);
});

// 3) apply config on store change for current tab
store.subscribe(notifyContentScript)

function notifyContentScript(config) {
  console.log('notifying contentscript');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { message: "applyConfigInContentScript", config: config }, function (response) {
      // console.log(response.farewell);
    });
  });
  // injectCss('font-family', config.font);
}
