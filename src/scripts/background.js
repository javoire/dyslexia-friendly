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

// default user config
var DEFAULT_CONFIG = {
  enabled: 1,
  font: "opendyslexic",
  rulerEnabled: 1,
  rulerWidth: "26"
};

var config = {
  /**
   * Interpolate form data with what's in the store, in case values are missing from the form
   * then save.
   */
  update: function (newData, cb) {

    chrome.storage.sync.get('config', function (store) {

      // since and "off" checkbox is non-existent in a jquery-serialized form we need to check if
      // it has "disappeared".. and thus assume it's now set to "off"

      // get entries with "on" value from store
      // 

      var updated = Object.assign(store.config, newData);
      // var config = data.config ||  DEFAULT_CONFIG; // fallback to default config
      chrome.storage.sync.set({ config: updated }, function () {
        console.log('Saved config', updated);
        return cb ? cb(updated) : true;
      });
    });
  },


  // /**
  //  * Set config by getting entire config obj,
  //  * updating the property and saving it back
  //  * @param  {String}   key   config key
  //  * @param  {String}   value config value
  //  * @param  {Function} cb    (Optional) callback provided with the updated config obj
  //  */
  // set: function (key, value, cb) {
  //   cb = cb || function () { };
  //   chrome.storage.sync.get('config', function (data) {
  //     var config = data.config ||  DEFAULT_CONFIG; // fallback to default config
  //     config[key] = value;
  //     chrome.storage.sync.set({ config: config }, function () {
  //       console.log('Saved config', config);
  //       return cb(config);
  //     });
  //   });
  // },
  // /**
  //  * Get specific config value
  //  * null key returns entire config
  //  * @param  {String}   key key to get value of
  //  * @param  {Function} cb  callback provided with the value
  //  */
  get: function (key, cb) {
    // cb = cb || function () { };
    chrome.storage.sync.get('config', function (data) {
      var config = data.config || DEFAULT_CONFIG; // fallback to default config

      // don't do this
      if (!key) {
        return cb(config);
      }
      return cb ? cb(config[key]) : true;
    });
  }
};

/**
 * Installed
 */

// save default config if not exists
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'updateConfig') {
    // config.set(request.data.configKey, request.data.configValue, function (config) {
    // Do things based on the configKey

    // NOTE: things here might move to contentscript.js
    // TODO: enable/disable
    // TODO: set ruler height
    // TODO: update colors
    // Set font family
    // injectCss('font-family', config.selectedFont);

    // pass the config to the popup
    // sendResponse(config);
    // });
    console.log(request)

    config.update(request.data)

    return true; // otherwise sendResponse won't be called
  } else if (request.message === 'init') {
    config.get(null, sendResponse);
    return true; // otherwise sendResponse won't be called
  }
});

// Run as soon as a navigation has been committed
// i.e. before document has loaded
chrome.webNavigation.onCommitted.addListener(function () {
  config.get(null, function (config) {
    // injectCss('font-family', config.selectedFont);
  });
});
