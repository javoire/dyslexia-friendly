'use strict';

// function injectCss(key, value) {
//   var css = '* { ' + key + ': ' + value + ' !important}';
//   chrome.tabs.insertCSS({
//     code: css,
//     runAt: 'document_start' // inject before page css is loaded
//   });
// }

// default user config
var DEFAULT_CONFIG = {
  enabled: true,
  selectedFont: 'opendyslexic'
};

var config = {
  /**
   * Set config by getting entire config obj,
   * updating the property and saving it back
   * @param  {String}   key   config key
   * @param  {String}   value config value
   * @param  {Function} cb    (Optional) callback provided with the updated config obj
   */
  set: function(key, value, cb) {
    cb = cb || function() {};
    chrome.storage.sync.get('config', function(data) {
      var config = data.config || DEFAULT_CONFIG; // fallback to default config
      config[key] = value;
      chrome.storage.sync.set({config: config}, function() {
        console.log('Saved config', config);
        return cb(config);
      });
    });
  },
  /**
   * Get specific config value
   * null key returns entire config
   * @param  {String}   key key to get value of
   * @param  {Function} cb  callback provided with the value
   */
  get: function(key, cb) {
    cb = cb || function() {};
    chrome.storage.sync.get('config', function(data) {
      var config = data.config || DEFAULT_CONFIG; // fallback to default config
      if (!key) {
        return cb(config);
      }
      return cb(config[key]);
    });
  }
};

/**
 * Installed
 */

// save default config if not exists
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get('config', function(data) {
    if (!data.config) {
      chrome.storage.sync.set({config: DEFAULT_CONFIG}, function() {
        console.log('Default config saved', DEFAULT_CONFIG);
      });
    }
  });
});

/**
 * Runtime
 */

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'save') {
    config.set(request.data.configKey, request.data.configValue, sendResponse);
    return true; // otherwise sendResponse won't be called
  } else if (request.message === 'init') {
    config.get(null, sendResponse);
    return true; // otherwise sendResponse won't be called
  }
});

// Run as soon as a navigation has been committed
// i.e. before document has loaded
chrome.webNavigation.onCommitted.addListener(function() {
  config.get(null, function(config) {
    if (!config.selectedFont) {
      return;
    }
    // injectCss('font-family', config.selectedFont);
  });
});
