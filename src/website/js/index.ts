import 'tw-elements';
import $ from 'jquery';

import '../../shared/css/tailwind.css';
import '../../shared/css/fonts.css';
import '../css/typography.css';
import '../css/privacy-policy.css';
import '../css/index.css';
// Popup chrome (wrapper, sections, switches) reused for the floating demo form.
import '../../extension/css/popup.css';
// Extension content styles, re-scoped to #site-root at build time (see
// utils/postcss-scope-site.js) so the whole marketing page reacts to the popup,
// while the popup (a sibling of #site-root) stays untouched. Single source of
// truth — no synced copy of contentscript.css.
import '../../extension/css/contentscript.css?site';

import { formToConfig, debug } from '../../extension/js/lib/util';
import { DEFAULT_CONFIG, UserConfig } from '../../extension/js/lib/store';
import { updateUiFromConfig } from '../../extension/js/lib/popupForm';
import { applyConfigToRoot } from '../../extension/js/lib/applyConfig';

const FONT_COLOR_STYLE_ID = 'dyslexia-friendly-site-font-color-style';

/**
 * Attractive first-impression defaults (RAN-176): extension ON with Open
 * Dyslexic so a visitor immediately sees the site rendered in the flagship
 * dyslexia-friendly style. Background/font-color start off (clean look); the
 * ruler is on so its purpose is discoverable. Everything else inherits the
 * shared DEFAULT_CONFIG.
 */
const SITE_DEFAULT_CONFIG: UserConfig = {
  ...DEFAULT_CONFIG,
  extensionEnabled: true,
  fontEnabled: true,
  fontChoice: 'opendyslexic',
};

/**
 * Wire the floating popup form to the whole marketing page so every control
 * change restyles the entire site (#site-root) live (RAN-176). No-ops when the
 * markup is absent (e.g. the privacy-policy page reuses this entry).
 */
function setupLiveDemo(): void {
  const configForm = $('#configForm');
  const siteRoot = $('#site-root');
  if (!configForm.length || !siteRoot.length) {
    return;
  }

  const inputs = $('#configForm input');
  // A detached element absorbs updateUiFromConfig's preview styling so it never
  // lands on the popup chrome — the popup must stay clean and readable.
  const previewSink = $('<div></div>');
  const ruler = $('#dyslexia-friendly-ruler-site');
  const siteRootEl = siteRoot.get(0) as HTMLElement;

  function currentConfig(): UserConfig {
    return { ...SITE_DEFAULT_CONFIG, ...formToConfig(configForm) } as UserConfig;
  }

  function render(config: UserConfig): void {
    // reflect onto form inputs + section visibility (preview styling sinks into
    // the detached element, keeping the popup unstyled)
    updateUiFromConfig(config, inputs, previewSink, ruler);
    // apply to the whole page (no hostname check — site has no blacklist)
    applyConfigToRoot(config, {
      root: siteRoot,
      ruler,
      scaleRoot: siteRootEl,
      fontColorStyleId: FONT_COLOR_STYLE_ID,
      hostname: null,
    });
  }

  // initial paint from the flagship defaults
  render(SITE_DEFAULT_CONFIG);

  inputs.on('input change', function () {
    const config = currentConfig();
    debug('live demo: applying config', config);
    render(config);
  });

  // The ruler follows the cursor across the whole page.
  siteRoot.on('mousemove', function (event: JQuery.MouseMoveEvent) {
    ruler.css('top', event.clientY);
  });
}

$(document).ready(function () {
  $('.copyright-year', document).text(new Date().getFullYear());
  setupLiveDemo();
});
