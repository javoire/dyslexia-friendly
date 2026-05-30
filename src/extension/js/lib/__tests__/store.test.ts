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
    expect(DEFAULT_CONFIG.customBackgroundColor).toBe('#fdf6e3');
  });

  test('updates custom background color', () => {
    const storedConfig = { ...DEFAULT_CONFIG };
    const newConfigValues = {
      backgroundChoice: 'custom',
      customBackgroundColor: '#ffcc00',
    };
    const result = updateChangedConfigValues(storedConfig, newConfigValues);
    expect(result.backgroundChoice).toBe('custom');
    expect(result.customBackgroundColor).toBe('#ffcc00');
  });

  test('default config includes font color options', () => {
    expect(DEFAULT_CONFIG.fontColorEnabled).toBe(false);
    expect(DEFAULT_CONFIG.fontColor).toBe('#000000');
  });

  test('updates font color', () => {
    const storedConfig = { ...DEFAULT_CONFIG };
    const newConfigValues = {
      fontColorEnabled: true,
      fontColor: '#cc0033',
    };
    const result = updateChangedConfigValues(storedConfig, newConfigValues);
    expect(result.fontColorEnabled).toBe(true);
    expect(result.fontColor).toBe('#cc0033');
  });

  // RAN-21: per-site blacklist
  test('default config includes an empty disabledSites array', () => {
    expect(DEFAULT_CONFIG.disabledSites).toEqual([]);
  });

  test('disabledSites survives updateChangedConfigValues (boolean reset)', () => {
    const storedConfig = {
      ...DEFAULT_CONFIG,
      disabledSites: ['example.com'],
    };
    // a boolean-only update must not wipe the array
    const result = updateChangedConfigValues(storedConfig, {
      fontEnabled: true,
    });
    expect(result.disabledSites).toEqual(['example.com']);
  });

  test('updateChangedConfigValues can write disabledSites', () => {
    const storedConfig = { ...DEFAULT_CONFIG };
    const result = updateChangedConfigValues(storedConfig, {
      disabledSites: ['127.0.0.1', 'foo.test'],
    });
    expect(result.disabledSites).toEqual(['127.0.0.1', 'foo.test']);
  });

  test('supports all background color options', () => {
    const supportedBackgrounds = ['none', 'classic', 'cream', 'softblue', 'paleyellow', 'custom'];
    
    // Test that updateChangedConfigValues works with all background options
    supportedBackgrounds.forEach(background => {
      const storedConfig = { ...DEFAULT_CONFIG };
      const newConfigValues = { backgroundChoice: background };
      const result = updateChangedConfigValues(storedConfig, newConfigValues);
      expect(result.backgroundChoice).toBe(background);
    });
  });
});
