import 'jquery';
import $ from 'jquery';

import '../../shared/css/tailwind.css';
import '../../shared/css/fonts.css';

import '../css/popup.css';

import { formToConfig, debug, removeClassStartsWith } from './lib/util';
import { FONT_CLASS_PREFIX, BACKGROUND_CLASS_PREFIX } from './lib/consts';
import { DEFAULT_CONFIG, UserConfig } from './lib/store';

/**
 * Resolve the active tab's hostname so the popup can show and toggle the
 * per-site blacklist (RAN-21). Returns null for pages without a usable
 * http(s) host (e.g. chrome:// pages or the dev server).
 */
function getActiveTabHostname(callback: (hostname: string | null) => void): void {
  if (!chrome.tabs || !chrome.tabs.query) {
    return callback(null);
  }
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    function (tabs: chrome.tabs.Tab[]) {
      const url = tabs[0]?.url;
      if (!url) {
        return callback(null);
      }
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return callback(null);
        }
        callback(parsed.hostname);
      } catch {
        callback(null);
      }
    },
  );
}

/**
 * Set up the "Disable on this site" toggle: reflect current blacklist state
 * for the active tab, and add/remove the hostname on change.
 */
function setupDisableSiteToggle(): void {
  const section = $('#disable-site-section');
  const checkbox = $('#disable-site-checkbox');
  const hostnameLabel = $('#disable-site-hostname');

  getActiveTabHostname(function (hostname) {
    // No usable host (chrome:// pages etc.) — hide the toggle entirely.
    if (!hostname) {
      section.hide();
      return;
    }

    hostnameLabel.text(hostname);
    section.show();

    chrome.runtime.sendMessage(
      { message: 'getConfig' },
      (config: UserConfig) => {
        const disabledSites = config.disabledSites || [];
        (checkbox.get(0) as HTMLInputElement).checked =
          disabledSites.includes(hostname);
      },
    );

    checkbox.off('change.disableSite').on('change.disableSite', function () {
      const disable = (this as HTMLInputElement).checked;
      chrome.runtime.sendMessage(
        { message: 'getConfig' },
        (config: UserConfig) => {
          const current = config.disabledSites || [];
          const disabledSites = disable
            ? Array.from(new Set([...current, hostname]))
            : current.filter((h) => h !== hostname);
          debug('updating disabledSites', disabledSites);
          // persist via the normal update flow; the service worker pushes
          // the new config to the active tab so the change applies live.
          chrome.runtime.sendMessage({
            message: 'updateConfig',
            data: { disabledSites },
          });
        },
      );
    });
  });
}

// Mock chrome runtime for development
declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

// crude way to guess we're in webpack devserver
// todo: can we inject this from webpack instead?
const isDevServer = !(window as unknown as { chrome?: typeof chrome }).chrome
  ?.runtime;
if (!chrome.runtime) {
  (
    window as unknown as {
      chrome: { runtime: { sendMessage: () => Promise<void> } };
    }
  ).chrome = {
    runtime: {
      sendMessage: () => Promise.resolve(),
    },
  };
}

/*
 * Send form to background store for saving
 */
function saveFormStateToStore(
  form: JQuery<HTMLElement>,
  callback?: (config: UserConfig) => void,
): void {
  const config = formToConfig(form);

  debug('sending to service worker:', config);
  // pass new config to background script for saving
  chrome.runtime.sendMessage(
    {
      message: 'updateConfig',
      data: config,
    },
    callback || (() => {}),
  );
}

/**
 * Update UI state from config
 */
function updateUiFromConfig(
  config: UserConfig,
  inputs: JQuery<HTMLElement>,
  body: JQuery<HTMLElement>,
  ruler: JQuery<HTMLElement>,
): void {
  debug('Updating popup UI with config:', config);

  // update all form input states
  inputs.each(function (this: HTMLElement) {
    const inputElement = this as HTMLInputElement;
    const value = config[inputElement.name as keyof UserConfig];
    switch (inputElement.type) {
      case 'radio':
        inputElement.checked = value === inputElement.value;
        break;
      case 'checkbox':
        inputElement.checked = !!value;
        break;
      default:
        inputElement.value = String(value);
        break;
    }
  });

  // update ruler
  updateRulerSize(ruler, config.rulerSize);
  updateRulerOpacity(ruler, config.rulerOpacity);
  updateRulerColor(ruler, config.rulerColor);

  // toggle font
  removeClassStartsWith(body, FONT_CLASS_PREFIX);
  body.addClass(FONT_CLASS_PREFIX + config.fontChoice);

  // update font size value display
  $('#font-size-value').text(config.fontSize.toFixed(1) + 'x');

  const fontSizeEnabled = !!config.fontSizeEnabled;
  const fontSizeRange = $('#font-size-range');
  fontSizeRange.prop('disabled', !fontSizeEnabled);

  // toggle background
  removeClassStartsWith(body, BACKGROUND_CLASS_PREFIX);
  body.css('background-color', '');
  if (config.backgroundEnabled && config.backgroundChoice === 'custom') {
    body.css('background-color', config.customBackgroundColor);
  } else if (config.backgroundEnabled && config.backgroundChoice !== 'none') {
    body.addClass(BACKGROUND_CLASS_PREFIX + config.backgroundChoice);
  }

  // toggle font (text) color live preview in the popup
  body.css('color', '');
  if (config.fontColorEnabled) {
    body.css('color', config.fontColor);
  }

  // only show the custom color picker when the custom background is selected
  const customColorWrapper = $('#background-custom-color-wrapper');
  if (config.backgroundChoice === 'custom') {
    customColorWrapper.show();
  } else {
    customColorWrapper.hide();
  }

  // toggle visible sections
  const visibleSections = $('[data-show-when]');
  visibleSections.each(function (this: HTMLElement) {
    const elem = $(this);

    // grab the data attr that controls when to show this element
    const showWhen = elem.data('show-when') as string;

    // very rudimentary support for and-operator...
    const show = showWhen
      .split('&&')
      .map((s: string) => config[s.trim() as keyof UserConfig])
      .every(Boolean);

    if (show) {
      elem.show();
    } else {
      elem.hide();
    }
  });
}

window.onload = function () {
  $(document).ready(function () {
    const inputs = $('#configForm input');
    const ruler = $('#dyslexia-friendly-ruler');
    const configForm = $('#configForm');
    const body = $('body');

    // set UI state once on startup if webpack devserver
    if (isDevServer) {
      updateUiFromConfig(DEFAULT_CONFIG, inputs, body, ruler);
    }

    // initially hide ruler, it'll be temporarily shown
    // when related inputs are being changed
    ruler.hide();

    // continuous (live) event handler on input change
    inputs.on('input', function () {
      // update changes live in the popup
      updateUiFromConfig(
        { ...DEFAULT_CONFIG, ...formToConfig(configForm) } as UserConfig,
        inputs,
        body,
        ruler,
      );

      // update changes live on the page for immediate feedback
      // this sends directly to the active tab, not via storage, to not spam the storage
      // there's a rate limit https://developer.chrome.com/docs/extensions/reference/api/storage
      // MAX_WRITE_OPERATIONS_PER_MINUTE
      const config = formToConfig(configForm);
      debug('sending config to active tab', config);
      requestAnimationFrame(() => {
        chrome.runtime.sendMessage({
          message: 'sendConfigToActiveTab',
          data: config,
        });
      });

      // if we're changing ruler settings, make the ruler
      // temporarily visible to reflect the changes live
      const inputElement = this as HTMLInputElement;
      if (
        inputElement.name === 'rulerSize' ||
        inputElement.name === 'rulerOpacity' ||
        inputElement.name === 'rulerColor'
      ) {
        ruler.show();
      }
    });

    // submitting form  on input value changes (not live)
    inputs.change(function () {
      configForm.submit();

      // ruler may have been shown while changing a ruler related input
      ruler.hide();
    });

    configForm.submit(function (e) {
      // save to storage
      saveFormStateToStore($(this), (config) => {
        // update UI with the saved config
        updateUiFromConfig(config, inputs, body, ruler);
      });
      e.preventDefault();
    });

    // bind ruler to mouse
    body.mousemove((event: JQuery.MouseMoveEvent) => {
      ruler.css('top', event.pageY);
    });

    // On popup open, load config from store and update ui,
    chrome.runtime.sendMessage({ message: 'getConfig' }, (config) => {
      updateUiFromConfig(config, inputs, body, ruler);
    });

    // per-site blacklist toggle (RAN-21)
    setupDisableSiteToggle();
  });
};

const updateRulerSize = function (
  ruler: JQuery<HTMLElement>,
  value: number,
): void {
  ruler.css('height', value);
  ruler.css('marginTop', -value / 2);
};

const updateRulerOpacity = function (
  ruler: JQuery<HTMLElement>,
  value: number,
): void {
  ruler.css('opacity', value);
};

const updateRulerColor = function (
  ruler: JQuery<HTMLElement>,
  value: string,
): void {
  ruler.css('background-color', value);
};
