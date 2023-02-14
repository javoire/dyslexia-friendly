/* eslint-disable no-console */
// default user config
var DEFAULT_CONFIG = {
  // when the version number is updated, users locally stored config
  // will be wiped so it works with any new changes,
  // so there isn't any old deprecated or conflicting config values
  // TODO: automate this number by reading package.json or manifest.json, on build
  // with webpack Define plugin?
  // or/also, check if local config contains key names that are invalid (outdated)
  // and then also wipe it
  // TODO maybe store is wiped on extension updates anyway?
  extensionVersion: '2.0.0',

  // inputs:
  // these are the `name="something-checkbox"` etc,
  // names need to be manually in sync...
  extensionEnabled: true,
  fontEnabled: true,
  rulerEnabled: true,
  rulerSize: 30,
  fontChoice: 'opendyslexic'
};

const updateChangedConfigValues = (config, newConfigValues) => {
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
const store = {
  /**
   * Interpolate form data with what's in the store, in case values are missing from the form
   * then save.
   */
  update: function(newConfigValues, cb) {
    chrome.storage.sync.get('config', function(store) {
      const updatedConfig = updateChangedConfigValues(
        store.config,
        newConfigValues
      );
      chrome.storage.sync.set({ config: updatedConfig }, function() {
        console.log('saved updated config', updatedConfig);

        // notify subscribers
        subscribers.forEach(function(subscriber) {
          subscriber(updatedConfig);
        });
        return cb ? cb(updatedConfig) : true;
      });
    });
  },

  set: function(config, cb) {
    chrome.storage.sync.set({ config }, function() {
      chrome.storage.sync.get('config', function(store) {
        return cb ? cb(store.config) : true;
      });
    });
  },

  get: function(key, cb) {
    chrome.storage.sync.get('config', function(store) {
      const config = store.config;
      // this is a failsafe in case the config doesn't
      // exist in storage, shouldn't happen..
      if (!config) {
        return cb(DEFAULT_CONFIG[key]);
      }
      return cb(config[key]);
    });
  },

  getAll: function(cb) {
    chrome.storage.sync.get('config', function(store) {
      const config = store.config;
      // this is a failsafe in case the config doesn't
      // exist in storage, shouldn't happen..
      if (!config) {
        return DEFAULT_CONFIG;
      }
      return cb(config);
    });
  },

  // subscribe to changes in store
  subscribe: function(cb) {
    subscribers.push(cb);
    cb(store);
  }
};

module.exports = {
  store,
  DEFAULT_CONFIG,
  updateChangedConfigValues // for testing only
};
