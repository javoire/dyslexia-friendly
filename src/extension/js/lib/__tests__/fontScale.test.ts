import { describe, expect, test } from '@jest/globals';
import { applyFontScale, __TEST_ONLY__ } from '../fontScale';
import { FONT_SIZE_CLASS } from '../consts';

describe('fontScale', () => {
  test('enables class and sets css variable when scaling', () => {
    const root = document.createElement('html');

    applyFontScale(root, true, 1.2);

    expect(root.classList.contains(FONT_SIZE_CLASS)).toBe(true);
    expect(root.style.getPropertyValue('--dyslexia-font-scale')).toBe('1.2');
  });

  test('clamps and normalizes invalid values', () => {
    const root = document.createElement('html');

    applyFontScale(root, true, Number.NaN);

    expect(root.style.getPropertyValue('--dyslexia-font-scale')).toBe('1');

    applyFontScale(root, true, 50);
    expect(root.style.getPropertyValue('--dyslexia-font-scale')).toBe('2');

    applyFontScale(root, true, 0.1);
    expect(root.style.getPropertyValue('--dyslexia-font-scale')).toBe('0.5');
  });

  test('removes class and variable when disabled', () => {
    const root = document.createElement('html');
    root.classList.add(FONT_SIZE_CLASS);
    root.style.setProperty('--dyslexia-font-scale', '1.1');

    applyFontScale(root, false, 1.1);

    expect(root.classList.contains(FONT_SIZE_CLASS)).toBe(false);
    expect(root.style.getPropertyValue('--dyslexia-font-scale')).toBe('');
  });

  test('clamp helper rounds to two decimals', () => {
    const { clampScale } = __TEST_ONLY__;
    expect(clampScale(1.234)).toBe(1.23);
  });
});
