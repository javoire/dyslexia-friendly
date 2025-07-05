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
      rulerSize: '30',
      fontChoice: 'opendyslexic',
    };
    expect(formToConfig(form)).toEqual(configMap);
  });
});
