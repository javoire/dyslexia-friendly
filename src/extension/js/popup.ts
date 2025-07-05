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
const isDevServer = !(window as any).chrome?.runtime;
if (!chrome.runtime) {
  (window as any).chrome = {
    runtime: {
      sendMessage: () => {
        debug('mocking sendMessage');
      },
    },
  };
}

/*
 * Send form to background store for saving
 */
function saveFormStateToStore(form: JQuery, callback?: (config: UserConfig) => void): void {
  const config = formToConfig(form);

  debug('sending to service worker:', config);
  // pass new config to background script for saving
  chrome.runtime.sendMessage(
    {
      message: 'updateConfig',
      data: config,
    },
    callback,
  );
}

/**
 * Update UI state from config
 */
function updateUiFromConfig(config: UserConfig, inputs: JQuery, body: JQuery, ruler: JQuery): void {
  debug('Updating popup UI with config:', config);

  // update all form input states
  inputs.each(function (this: HTMLInputElement) {
    const value = config[this.name as keyof UserConfig];
    switch (this.type) {
      case 'radio':
        this.checked = value === this.value;
        break;
      case 'checkbox':
        this.checked = !!value;
        break;
      default:
        this.value = String(value);
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
      updateUiFromConfig(formToConfig(configForm), inputs, body, ruler);

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
      if (
        this.name === 'rulerSize' ||
        this.name === 'rulerOpacity' ||
        this.name === 'rulerColor'
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
      saveFormStateToStore($(this), (config) => {
        updateUiFromConfig(config, inputs, body, ruler);
      });
      e.preventDefault();
    });

    // bind ruler to mouse
    body.mousemove(() => {
      ruler.css('top', event.pageY);
    });

    // On popup open, load config from store and update ui,
    chrome.runtime.sendMessage({ message: 'getConfig' }, (config) => {
      updateUiFromConfig(config, inputs, body, ruler);
    });
  });
};

const updateRulerSize = function (ruler: JQuery, value: number): void {
  ruler.css('height', value);
  ruler.css('marginTop', -value / 2);
};

const updateRulerOpacity = function (ruler: JQuery, value: number): void {
  ruler.css('opacity', value);
};

const updateRulerColor = function (ruler: JQuery, value: string): void {
  ruler.css('background-color', value);
};
