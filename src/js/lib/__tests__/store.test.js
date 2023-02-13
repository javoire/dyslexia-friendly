/* eslint-disable no-undef */

const {
  store,
  DEFAULT_CONFIG,
  updateChangedConfigValues
} = require('../store');

describe('store', () => {
  test('getAll() returns default config if none already exists', () => {
    global.chrome = {
      storage: {
        sync: {
          get: function(key, fn) {
            fn({});
          }
        }
      }
    };
    store.getAll(function(config) {
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });
  test('getAll() returns saved config in chrome.storage', () => {
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
    store.getAll(function(config) {
      expect(config).toEqual(mockConfig);
    });
  });
  test('get() returns the value', () => {
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
    store.get('somevalue', function(value) {
      expect(value).toEqual(1);
    });
  });
  test('update() returns updated config', () => {
    const mockConfig = { somevalue: 1 };
    const mockNewConfigValues = { anewvalue: 2 };
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
    store.update(mockNewConfigValues, function(config) {
      expect(config).toEqual(mockUpdatedConfig);
    });
  });
});

describe('store', () => {
  test('updateChangedConfigValue() updates correct values', () => {
    const storedConfig = {
      somenumber: 1,
      extensionEnabled: true,
      fontChoice: 'opendyslexic',
      fontEnabled: false
    };

    const newConfigValues = {
      fontChoice: 'comicsans',
      fontEnabled: true
    };

    const updatedConfig = {
      somenumber: 1,
      extensionEnabled: false,
      fontChoice: 'comicsans',
      fontEnabled: true
    };

    expect(updateChangedConfigValues(storedConfig, newConfigValues)).toEqual(
      updatedConfig
    );
  });
});
