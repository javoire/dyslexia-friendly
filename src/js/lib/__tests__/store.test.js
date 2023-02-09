/* eslint-disable no-undef */

const { store, DEFAULT_CONFIG } = require('../store');

describe('store', () => {
  test('get() returns default store if none already exists', () => {
    global.chrome = {
      storage: {
        sync: {
          get: function(key, fn) {
            fn({});
          }
        }
      }
    };
    store.get(null, function(config) {
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });
  test('get() returns saved config in chrome.storage', () => {
    const mockConfig = { somevalue: 1 };
    global.chrome = {
      storage: {
        sync: {
          get: function(key, fn) {
            fn({ config: { ...mockConfig } });
          }
        }
      }
    };
    store.get(null, function(config) {
      expect(config).toEqual(mockConfig);
    });
  });
  test('update() returns updated config', () => {
    const mockConfig = { somevalue: 1 };
    const mockNewData = { anewvalue: 2 };
    const mockUpdatedConfig = { somevalue: 1, anewvalue: 2 };
    global.chrome = {
      storage: {
        sync: {
          get: function(key, fn) {
            fn({ config: { ...mockConfig } });
          },
          set: function(obj, fn) {
            fn();
          }
        }
      }
    };
    store.update(mockNewData, function(config) {
      expect(config).toEqual(mockUpdatedConfig);
    });
  });
});
