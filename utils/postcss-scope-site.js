import selectorParser from 'postcss-selector-parser';

/**
 * PostCSS plugin (RAN-176) that re-scopes the extension's content-script CSS so
 * it applies to the marketing site's content wrapper (`#site-root`) instead of
 * the global `body`/`html`. The whole page (header, hero, footer, article)
 * lives inside `#site-root`; the popup form is a SIBLING of `#site-root`, so it
 * is automatically exempt from these rules — no `!important` specificity fight.
 * This lets the website reuse `contentscript.css` verbatim as the single source
 * of truth — no hand-maintained copy to keep in sync.
 *
 * Substitutions:
 *  - `body`                      -> `#site-root`
 *  - `html`                      -> `#site-root`   (the font-scale root rule)
 *  - `#dyslexia-friendly-ruler`  -> `#dyslexia-friendly-ruler-site`
 *
 * The ruler keeps `position: fixed` (as in the extension) so it follows the
 * cursor across the whole viewport — but the popup sits above it via z-index
 * (see index.css) so the ruler never covers the controls.
 */
const RULER_ID = 'dyslexia-friendly-ruler';
const SITE_RULER_ID = 'dyslexia-friendly-ruler-site';
const SITE_ROOT_ID = 'site-root';

const transformSelector = (selector) =>
  selectorParser((selectors) => {
    selectors.walk((node) => {
      if (
        node.type === 'tag' &&
        (node.value === 'body' || node.value === 'html')
      ) {
        node.replaceWith(selectorParser.id({ value: SITE_ROOT_ID }));
      } else if (node.type === 'id' && node.value === RULER_ID) {
        node.replaceWith(selectorParser.id({ value: SITE_RULER_ID }));
      }
    });
  }).processSync(selector);

const plugin = () => ({
  postcssPlugin: 'postcss-scope-site',
  Rule(rule) {
    rule.selector = transformSelector(rule.selector);
  },
});
plugin.postcss = true;

export default plugin;
