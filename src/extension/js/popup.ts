import 'jquery';
import $ from 'jquery';

import '../../shared/css/tailwind.css';
import '../../shared/css/fonts.css';

import '../css/popup.css';

import { formToConfig, debug, removeClassStartsWith } from './lib/util';
import { FONT_CLASS_PREFIX } from './lib/consts';
import { DEFAULT_CONFIG, UserConfig } from './lib/store';

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
      // Update UI immediately with current form state
      const formConfig = formToConfig($(this));
      const currentConfig = { ...DEFAULT_CONFIG, ...formConfig } as UserConfig;
      updateUiFromConfig(currentConfig, inputs, body, ruler);

      // Then save to storage
      saveFormStateToStore($(this), (config) => {
        // Update UI again with the saved config in case there were any changes
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
