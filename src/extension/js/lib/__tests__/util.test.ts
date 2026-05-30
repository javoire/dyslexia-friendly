import $ from 'jquery';
import { formToConfig } from '../util';
import { describe, expect, test } from '@jest/globals';

describe('util', () => {
  test('formToConfig() creates config obj from form element', () => {
    const form = $(
      '<form><input type="checkbox" name="rulerEnabled" checked><input type="number" name="rulerSize" value="30"><input type="radio" name="fontChoice" value="opendyslexic" checked></form>',
    );
    const configMap = {
      rulerEnabled: true,
      rulerSize: 30,
      fontChoice: 'opendyslexic',
    };
    expect(formToConfig(form)).toEqual(configMap);
  });

  // RAN-21: a nameless checkbox (e.g. the "Disable on this site" toggle) must
  // never end up in the config — previously it wrote a stray '' key.
  test('formToConfig() skips nameless inputs', () => {
    const form = $(
      '<form><input type="checkbox" name="rulerEnabled" checked><input type="checkbox" id="disable-site-checkbox"></form>',
    );
    const result = formToConfig(form);
    expect(result).toEqual({ rulerEnabled: true });
    expect(Object.prototype.hasOwnProperty.call(result, '')).toBe(false);
  });
});
