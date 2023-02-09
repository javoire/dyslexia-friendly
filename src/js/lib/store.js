// default user store
var DEFAULT_CONFIG = {
  enabled: 1,
  font: 'opendyslexic',
  rulerEnabled: 1,
  rulerWidth: '26'
};

const subscribers = [];
const store = {
  /**
   * Interpolate form data with what's in the store, in case values are missing from the form
   * then save.
   */
  update: function(newData, cb) {
    chrome.storage.sync.get('config', function(store) {
      var updated = Object.assign(store.config, newData);
      chrome.storage.sync.set({ config: updated }, function() {
        console.log('Saved config', updated);
        // notify subscribers
        subscribers.forEach(function(cb) {
          cb(updated);
        });
        return cb ? cb(updated) : true;
      });
    });
  },

  get: function(key, cb) {
    chrome.storage.sync.get('config', function(store) {
      var config = store.config || DEFAULT_CONFIG; // fallback to default store

      // don't do this
      if (!key) {
        return cb(config);
      }
      return cb ? cb(config[key]) : true;
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
  DEFAULT_CONFIG
};
