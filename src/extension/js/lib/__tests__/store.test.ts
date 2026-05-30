import { DEFAULT_CONFIG, store, updateChangedConfigValues } from '../store';
import { describe, expect, test } from '@jest/globals';

describe('store', () => {
  test('getAll() returns default config if none already exists', (done) => {
    global.chrome = {
      storage: {
        sync: {
          get: function (key, fn) {
            fn({});
          },
        },
      },
    };
    store.getAll(function (config) {
      try {
        expect(config).toEqual(DEFAULT_CONFIG);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  test('getAll() returns saved config in chrome.storage', (done) => {
    const mockConfig = { somevalue: 1 };
    global.chrome = {
      storage: {
        sync: {
          get: function (key, fn) {
            fn({ config: { ...mockConfig } });
          },
        },
      },
    };
    store.getAll(function (config) {
      try {
        expect(config).toEqual(mockConfig);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  test('get() returns the value', (done) => {
    const mockConfig = { somevalue: 1 };
    global.chrome = {
      storage: {
        sync: {
          get: function (key, fn) {
            fn({ config: { ...mockConfig } });
          },
        },
      },
    };
    store.get('somevalue', function (value) {
      try {
        expect(value).toEqual(1);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  test('update() returns updated config', (done) => {
    const mockConfig = { somevalue: 1 };
    const mockNewConfigValues = { anewvalue: 2 };
    const mockUpdatedConfig = { somevalue: 1, anewvalue: 2 };
    global.chrome = {
      storage: {
        sync: {
          get: function (key, fn) {
            fn({ config: { ...mockConfig } });
          },
          set: function (obj, fn) {
            fn();
          },
        },
      },
    };
    store.update(mockNewConfigValues, function (config) {
      try {
        expect(config).toEqual(mockUpdatedConfig);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  test('updateChangedConfigValue() updates correct values', () => {
    const storedConfig = {
      somenumber: 1,
      extensionEnabled: true,
      fontChoice: 'opendyslexic',
      fontEnabled: false,
      backgroundEnabled: true,
      backgroundChoice: 'cream',
    };

    const newConfigValues = {
      fontChoice: 'comicsans',
      fontEnabled: true,
      backgroundChoice: 'softblue',
    };

    const updatedConfig = {
      somenumber: 1,
      extensionEnabled: false,
      fontChoice: 'comicsans',
      fontEnabled: true,
      backgroundEnabled: false,
      backgroundChoice: 'softblue',
    };

    expect(updateChangedConfigValues(storedConfig, newConfigValues)).toEqual(
      updatedConfig,
    );
  });

  // RAN-23: a new subscriber must be primed with the *stored* config,
  // not DEFAULT_CONFIG. The old behaviour pushed rulerEnabled:true on every
  // service-worker cold start, making a disabled ruler reappear in new tabs.
  test('subscribe() primes the callback with stored config, not defaults', (done) => {
    const storedConfig = { ...DEFAULT_CONFIG, rulerEnabled: false };
    global.chrome = {
      storage: {
        sync: {
          get: function (key, fn) {
            fn({ config: { ...storedConfig } });
          },
        },
      },
    };
    store.subscribe(function (config) {
      try {
        expect(config).toEqual(storedConfig);
        expect(config.rulerEnabled).toBe(false);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  test('default config includes background options', () => {
    expect(DEFAULT_CONFIG.backgroundEnabled).toBe(false);
    expect(DEFAULT_CONFIG.backgroundChoice).toBe('none');
  });

  test('supports all background color options', () => {
    const supportedBackgrounds = ['none', 'classic', 'cream', 'softblue', 'paleyellow'];
    
    // Test that updateChangedConfigValues works with all background options
    supportedBackgrounds.forEach(background => {
      const storedConfig = { ...DEFAULT_CONFIG };
      const newConfigValues = { backgroundChoice: background };
      const result = updateChangedConfigValues(storedConfig, newConfigValues);
      expect(result.backgroundChoice).toBe(background);
    });
  });
});
