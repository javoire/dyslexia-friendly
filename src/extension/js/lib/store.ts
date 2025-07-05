import { debug } from './util';

export interface UserConfig {
  extensionEnabled: boolean;
  fontEnabled: boolean;
  rulerEnabled: boolean;
  rulerSize: number;
  rulerColor: string;
  rulerOpacity: number;
  fontChoice: string;
}

export type ConfigKey = keyof UserConfig;
export type ConfigValue = UserConfig[ConfigKey];

// default user config
export const DEFAULT_CONFIG: UserConfig = {
  // inputs:
  // these are the `name="something-checkbox"` etc,
  // names need to be manually in sync...
  extensionEnabled: true,
  fontEnabled: true,
  rulerEnabled: true,
  rulerSize: 30,
  rulerColor: '#000000',
  rulerOpacity: 0.1,
  fontChoice: 'opendyslexic',
};

export const updateChangedConfigValues = (
  config: UserConfig,
  newConfigValues: Partial<UserConfig>
): UserConfig => {
  for (const key in config) {
    if (typeof config[key as ConfigKey] === 'boolean') {
      // checkboxes that are off will be missing in the
      // form payload, so we set all checkboxes to off here,
      // and then below the ones that are checked will be
      // set to (back) on
      (config as any)[key] = false;
    }
  }
  return Object.assign(config, newConfigValues);
};

type ConfigCallback = (config: UserConfig) => void;
type ValueCallback = (value: ConfigValue) => void;

const subscribers: ConfigCallback[] = [];

export interface Store {
  update: (newConfigValues: Partial<UserConfig>, callback?: ConfigCallback) => void;
  set: (config: UserConfig, callback?: ConfigCallback) => void;
  get: (key: ConfigKey, callback: ValueCallback) => void;
  getAll: (callback: ConfigCallback) => void;
  subscribe: (callback: ConfigCallback) => void;
}

export const store: Store = {
  /**
   * Interpolate form data with what's in the store, in case values are missing from the form
   * then save.
   */
  update: function (newConfigValues: Partial<UserConfig>, callback?: ConfigCallback): void {
    chrome.storage.sync.get('config', function (storageData: { config?: UserConfig }) {
      const updatedConfig = updateChangedConfigValues(
        storageData.config || DEFAULT_CONFIG,
        newConfigValues,
      );
      chrome.storage.sync.set({ config: updatedConfig }, function () {
        debug('saved updated config', updatedConfig);

        // notify subscribers
        subscribers.forEach(function (subscriber) {
          subscriber(updatedConfig);
        });
        if (callback) {
          callback(updatedConfig);
        }
      });
    });
  },

  set: function (config: UserConfig, callback?: ConfigCallback): void {
    chrome.storage.sync.set({ config }, function () {
      chrome.storage.sync.get('config', function (storageData: { config: UserConfig }) {
        if (callback) {
          callback(storageData.config);
        }
      });
    });
  },

  get: function (key: ConfigKey, callback: ValueCallback): void {
    chrome.storage.sync.get('config', function (storageData: { config?: UserConfig }) {
      const config = storageData.config;
      // this is a failsafe in case the config doesn't
      // exist in storage, shouldn't happen..
      if (!config) {
        return callback(DEFAULT_CONFIG[key]);
      }
      return callback(config[key]);
    });
  },

  getAll: function (callback: ConfigCallback): void {
    chrome.storage.sync.get('config', function (storageData: { config?: UserConfig }) {
      const config = storageData.config;
      // this is a failsafe in case the config doesn't
      // exist in storage, shouldn't happen...
      if (!config) {
        return callback(DEFAULT_CONFIG);
      }
      return callback(config);
    });
  },

  // subscribe to changes in store
  subscribe: function (callback: ConfigCallback): void {
    subscribers.push(callback);
    callback(DEFAULT_CONFIG);
  },
};
