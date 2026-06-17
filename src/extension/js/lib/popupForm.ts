import 'jquery';
import $ from 'jquery';

import { removeClassStartsWith, debug } from './util';
import { FONT_CLASS_PREFIX, BACKGROUND_CLASS_PREFIX } from './consts';
import { UserConfig } from './store';

/**
 * Shared popup-form helpers used by both the extension popup (live preview on
 * its own body) and the marketing-site live demo (RAN-176). These touch only
 * the form inputs and a "preview body" element — no chrome APIs — so they run
 * unchanged in the browser website context.
 */

const updateRulerSize = (ruler: JQuery<HTMLElement>, value: number): void => {
  ruler.css('height', value);
  ruler.css('marginTop', -value / 2);
};

const updateRulerOpacity = (
  ruler: JQuery<HTMLElement>,
  value: number,
): void => {
  ruler.css('opacity', value);
};

const updateRulerColor = (
  ruler: JQuery<HTMLElement>,
  value: string,
): void => {
  ruler.css('background-color', value);
};

/**
 * Reflect a config onto the form inputs and the popup's own preview body
 * (the small swatch of styling shown inside the popup). Does not touch any
 * external page — that is the caller's responsibility.
 */
export function updateUiFromConfig(
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
  $('#font-size-range').prop('disabled', !fontSizeEnabled);

  // toggle background
  removeClassStartsWith(body, BACKGROUND_CLASS_PREFIX);
  body.css('background-color', '');
  if (config.backgroundEnabled && config.backgroundChoice === 'custom') {
    body.css('background-color', config.customBackgroundColor);
  } else if (config.backgroundEnabled && config.backgroundChoice !== 'none') {
    body.addClass(BACKGROUND_CLASS_PREFIX + config.backgroundChoice);
  }

  // toggle font (text) color live preview
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
  $('[data-show-when]').each(function (this: HTMLElement) {
    const elem = $(this);
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
