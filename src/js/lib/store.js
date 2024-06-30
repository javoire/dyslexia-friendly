import { debug } from './util.js';

// default user config
export const DEFAULT_CONFIG = {
  // inputs:
  // these are the `name="something-checkbox"` etc,
  // names need to be manually in sync...
  extensionEnabled: true,
  fontEnabled: true,
  rulerEnabled: true,
  rulerSize: 30,
  rulerColor: '#000000',
  rulerOpacity: 0.1,
  fontChoice: 'opendyslexic'
};

export const updateChangedConfigValues = (config, newConfigValues) => {
  for (const key in config) {
    if (typeof config[key] === 'boolean') {
      // checkboxes that are off will be missing in the
      // form payload, so we set all checkboxes to off here,
      // and then below the ones that are checked will be
      // set to (back) on
      config[key] = false;
    }
  }
  return Object.assign(config, newConfigValues);
};

const subscribers = [];
export const store = {
  /**
   * Interpolate form data with what's in the store, in case values are missing from the form
   * then save.
   */
  update: function(newConfigValues, callback) {
    chrome.storage.sync.get('config', function(store) {
      const updatedConfig = updateChangedConfigValues(
        store.config,
        newConfigValues
      );
      chrome.storage.sync.set({ config: updatedConfig }, function() {
        debug('saved updated config', updatedConfig);

        // notify subscribers
        subscribers.forEach(function(subscriber) {
          subscriber(updatedConfig);
        });
        return callback ? callback(updatedConfig) : true;
      });
    });
  },

  set: function(config, callback) {
    chrome.storage.sync.set({ config }, function() {
      chrome.storage.sync.get('config', function(store) {
        return callback ? callback(store.config) : true;
      });
    });
  },

  get: function(key, callback) {
    chrome.storage.sync.get('config', function(store) {
      const config = store.config;
      // this is a failsafe in case the config doesn't
      // exist in storage, shouldn't happen..
      if (!config) {
        return callback(DEFAULT_CONFIG[key]);
      }
      return callback(config[key]);
    });
  },

  getAll: function(callback) {
    chrome.storage.sync.get('config', function(store) {
      const config = store.config;
      // this is a failsafe in case the config doesn't
      // exist in storage, shouldn't happen...
      if (!config) {
        return callback(DEFAULT_CONFIG);
      }
      return callback(config);
    });
  },

  // subscribe to changes in store
  subscribe: function(callback) {
    subscribers.push(callback);
    callback(store);
  }
};
