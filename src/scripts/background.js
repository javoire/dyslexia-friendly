'use strict';

//
// var config = {
//   save: function() {
//
//   },
//   get: function(cb) {
//     chrome.storage.sync.get('config', function(config) {
//       if (!config) {
//         return new Error('Could not get config', config);
//       }
//       this = Object.create(config)
//       return cb(config);
//     });
//   }
// }

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
  selectedFont: 'opendyslectic'
};

var config = {
  /**
   * Set config by getting entire config obj,
   * updating the property and saving it back
   * @param  {String}   key   config key
   * @param  {String}   value config value
   * @param  {Function} cb    callback provided with the updated config obj
   */
  set: function(key, value, cb) {
    chrome.storage.sync.get('config', function(data) {
      var config = data.config;
      if (!config) {
        // safeguard if for some reason, the config is gone
        // from storage
        config = DEFAULT_CONFIG;
      }
      config[key] = value;
      chrome.storage.sync.set({config: config}, function() {
        console.log('Saved config', config);
        return cb ? cb(config) : undefined;
      });
    });
  },
  /**
   * Get specific config value
   * @param  {String}   key key to get value of
   * @param  {Function} cb  callback provided with the value
   */
  get: function(key, cb) {
    chrome.storage.sync.get('config', function(data) {
      return cb ? cb(data.config[key]) : undefined;
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

chrome.runtime.onMessage.addListener(function(request) {
  if (request.message === 'save') {
    config.set(request.data.configKey, request.data.configValue);
  }
});

// Run as soon as a navigation has been committed
// i.e. before document has loaded
chrome.webNavigation.onCommitted.addListener(function() {
  config.get('config', function(config) {
    if (!config.selectedFont) {
      return;
    }
    // injectCss('font-family', config.selectedFont);
  });
});


// TODO: this is ugly
// chrome.runtime.onMessage.addListener(function(request) {
//   if (request.message == 'init') {
//     // send the user config to the UI
//
//   }
//   else if (request.message === 'css') {
//     injectCss(request.data.key, request.data.value);
//   }
// });
