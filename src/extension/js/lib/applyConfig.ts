import 'jquery';

import { debug, removeClassStartsWith } from './util';
import {
  CSS_NAMESPACE,
  FONT_CLASS_PREFIX,
  BACKGROUND_CLASS_PREFIX,
} from './consts';
import { applyFontScale } from './fontScale';
import { UserConfig } from './store';

/**
 * Options for {@link applyConfigToRoot}.
 *
 * - `root`: the element the styling classes/inline styles are applied to. In
 *   the extension this is `<body>`; on the marketing site it is the demo panel.
 * - `ruler`: the ruler element to size/position/show/hide.
 * - `scaleRoot`: the element the font-scale class/CSS var goes on. The
 *   extension scales the whole page (`<html>`); the site scales only the panel.
 * - `fontColorStyleId`: id of the injected <style> tag carrying the font-color
 *   override, so multiple instances on one page don't collide.
 * - `hostname`: current hostname for the per-site blacklist check, or null to
 *   skip the check entirely (the website has no concept of disabled sites).
 */
export interface ApplyConfigOptions {
  root: JQuery<HTMLElement>;
  ruler: JQuery<HTMLElement>;
  scaleRoot: HTMLElement;
  fontColorStyleId: string;
  hostname: string | null;
}

/**
 * Apply (or clear) the user's chosen text color, scoped to `rootSelector`.
 *
 * Background presets and the namespace CSS set `color` with `!important` on the
 * root and its descendants, so a plain inline style can't win. Among
 * `!important` rules the winner is decided by specificity: the preset container
 * rules reach up to (0,3,2). We therefore repeat the namespace class four times
 * so our selector beats every preset rule regardless of its element/attribute
 * parts. The style is removed entirely when disabled so no leftover state
 * remains.
 */
function applyFontColor(
  styleId: string,
  rootSelector: string,
  enabled: boolean,
  color: string,
): void {
  const existing = document.getElementById(styleId);
  if (!enabled) {
    if (existing) {
      existing.remove();
    }
    return;
  }
  const ns = `.${CSS_NAMESPACE}`.repeat(4);
  const css = `${rootSelector}${ns},${rootSelector}${ns} *{color:${color} !important;}`;
  if (existing) {
    existing.textContent = css;
  } else {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }
}

/**
 * Build the CSS selector for the font-color override targeting a root element.
 * Uses the element's id when present (extension `body` has none, so we fall
 * back to its tag name).
 */
function selectorForRoot(root: JQuery<HTMLElement>): string {
  const el = root.get(0);
  if (el && el.id) {
    return `#${el.id}`;
  }
  return (el ? el.tagName.toLowerCase() : 'body') || 'body';
}

/**
 * Apply the user's config to a target root element. Shared by the extension
 * content script (root = body, scaleRoot = documentElement, hostname = the
 * current page) and the marketing site live demo (root = demo panel,
 * scaleRoot = panel, hostname = null).
 */
export function applyConfigToRoot(
  config: UserConfig,
  options: ApplyConfigOptions,
): void {
  const { root, ruler, scaleRoot, fontColorStyleId, hostname } = options;
  debug('applying user settings', config);

  const rootSelector = selectorForRoot(root);

  // per-site blacklist (RAN-21): if this host is disabled, treat the extension
  // as fully disabled. hostname === null disables the check (website demo).
  const siteDisabled =
    hostname !== null && (config.disabledSites || []).includes(hostname);

  const fontScaleEnabled =
    config.extensionEnabled &&
    !siteDisabled &&
    config.fontEnabled &&
    config.fontSizeEnabled;

  if (config.extensionEnabled && !siteDisabled) {
    debug('extension enabled');
    root.addClass(CSS_NAMESPACE);

    removeClassStartsWith(root, FONT_CLASS_PREFIX);
    if (config.fontEnabled) {
      root.addClass(FONT_CLASS_PREFIX + config.fontChoice);
    }

    // Apply font scaling AFTER the font-class manipulation above. The scale
    // class (FONT_SIZE_CLASS) itself starts with FONT_CLASS_PREFIX, so when the
    // scale root and the styling root are the same element (the website demo
    // panel), removeClassStartsWith would otherwise strip the just-set scale
    // class. The extension uses distinct elements (body vs html) so order is
    // immaterial there.
    applyFontScale(scaleRoot, fontScaleEnabled, config.fontSize);

    removeClassStartsWith(root, BACKGROUND_CLASS_PREFIX);
    root.css('background-color', '');
    if (config.backgroundEnabled && config.backgroundChoice === 'custom') {
      root.css('background-color', config.customBackgroundColor);
    } else if (config.backgroundEnabled && config.backgroundChoice !== 'none') {
      root.addClass(BACKGROUND_CLASS_PREFIX + config.backgroundChoice);
    }

    // text color: the user's explicit choice wins over background presets
    applyFontColor(
      fontColorStyleId,
      rootSelector,
      config.fontColorEnabled,
      config.fontColor,
    );

    ruler.css('background-color', config.rulerColor);
    ruler.css('opacity', config.rulerOpacity);
    ruler.css('marginTop', -config.rulerSize / 2);
    ruler.css('height', config.rulerSize);
    if (config.rulerEnabled) {
      ruler.show();
    } else {
      ruler.hide();
    }
  } else {
    debug('extension disabled');
    root.removeClass(CSS_NAMESPACE);
    removeClassStartsWith(root, FONT_CLASS_PREFIX);
    removeClassStartsWith(root, BACKGROUND_CLASS_PREFIX);
    root.css('background-color', '');
    applyFontColor(fontColorStyleId, rootSelector, false, config.fontColor);
    applyFontScale(scaleRoot, false, config.fontSize);
    ruler.hide();
  }
}
