import { FONT_SIZE_CLASS } from './consts';

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;

const clampScale = (scale: number): number => {
  if (!Number.isFinite(scale) || Number.isNaN(scale)) {
    return 1;
  }

  if (scale < MIN_SCALE) {
    return MIN_SCALE;
  }

  if (scale > MAX_SCALE) {
    return MAX_SCALE;
  }

  return parseFloat(scale.toFixed(2));
};

export const applyFontScale = (
  root: HTMLElement,
  enabled: boolean,
  rawScale: number,
): void => {
  if (!root) {
    return;
  }

  if (!enabled) {
    root.classList.remove(FONT_SIZE_CLASS);
    root.style.removeProperty('--dyslexia-font-scale');
    return;
  }

  const scale = clampScale(rawScale);
  root.classList.add(FONT_SIZE_CLASS);
  root.style.setProperty('--dyslexia-font-scale', String(scale));
};

export const __TEST_ONLY__ = { clampScale };
