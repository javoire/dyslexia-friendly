# Background Color CSS Refinement

## What Changed

The original implementation used an aggressive CSS selector that forced ALL child elements to inherit the background color:

```css
/* OLD - Too aggressive */
body.dyslexia-friendly.dyslexia-friendly-bg-cream
  *:not([style*='background']):not([style*='color']) {
  background-color: inherit !important;
  color: inherit !important;
}
```

### Problems with the Old Approach:

1. **Broke UI Components**: Forced inheritance on buttons, modals, dropdowns, cards, alerts, etc.
2. **Weak Selector**: Only excluded elements with inline styles, not CSS classes
3. **No Exceptions**: Couldn't differentiate between content containers and interactive elements
4. **Website Breaking**: Would cause visual bugs on complex sites like Gmail, Reddit, GitHub

## New Approach

The refined implementation uses a targeted selector strategy:

```css
/* NEW - Targeted approach */
body.dyslexia-friendly.dyslexia-friendly-bg-cream article,
body.dyslexia-friendly.dyslexia-friendly-bg-cream main,
body.dyslexia-friendly.dyslexia-friendly-bg-cream
  section:not([role='navigation']):not([role='banner']):not(
    [role='complementary']
  ),
body.dyslexia-friendly.dyslexia-friendly-bg-cream
  div:not([class*='button']):not([class*='btn']):not([role='button']):not(
    [class*='modal']
  ):not([class*='dialog']):not([class*='menu']):not([class*='dropdown']):not(
    [class*='popup']
  ):not([class*='tooltip']):not([class*='card']):not([class*='alert']):not(
    [class*='badge']
  ):not([class*='toast']) {
  background-color: #fdf6e3 !important;
  color: #5c4317 !important;
}
```

### Benefits:

1. **Targets Content Containers**: Only applies to `article`, `main`, `section`, and `div` elements
2. **Excludes UI Components**: Explicitly excludes buttons, modals, menus, cards, alerts, badges, etc.
3. **Preserves ARIA Roles**: Excludes navigation, banner, and complementary sections
4. **Less Breaking**: Should work better on complex websites with styled components

### Element Exclusions:

- `button`, `btn` - Buttons and button-like elements
- `modal`, `dialog` - Modal dialogs and pop-ups
- `menu`, `dropdown` - Navigation menus and dropdowns
- `popup`, `tooltip` - Pop-ups and tooltips
- `card` - Card components
- `alert`, `badge`, `toast` - Notification components
- `image`, `img`, `picture`, `photo`, `thumbnail`, `avatar`, `icon` - Image containers
- Elements with inline `background-image` styles
- ARIA roles: `navigation`, `banner`, `complementary`

### Image Preservation (Critical Fix):

**Problem**: Images often disappeared when background colors were applied because:

1. Many sites use `div` elements with CSS `background-image` instead of `<img>` tags
2. Our CSS was overriding these background colors, making background-images invisible
3. Transparent images in colored divs looked broken
4. Icons and avatars were being affected

**Solution**: We now exclude divs with common image-related patterns:

1. Class name exclusions: `:not([class*="image"])`, `:not([class*="img"])`, `:not([class*="picture"])`, `:not([class*="photo"])`, `:not([class*="thumbnail"])`, `:not([class*="avatar"])`, `:not([class*="icon"])`
2. Inline style exclusion: `:not([style*="background-image"])`

**Key insight**: We don't need to style `<img>` elements directly - they're replaced elements that don't have meaningful background colors or text colors. By excluding their *containers* (divs with image-related classes or background-images), we prevent our background colors from affecting background-images while letting actual `<img>` tags work naturally.

This simpler approach ensures images, photos, avatars, icons, and media elements remain fully visible.

## Color Documentation Added

Added comprehensive documentation about color choices:

- **Cream (#fdf6e3)**: Solarized Light base, reduces screen glare, WCAG AAA compliant
- **Soft Blue (#f0f8ff)**: AliceBlue, calming color that reduces eye strain
- **Pale Yellow (#fffacd)**: LemonChiffon, high contrast option often recommended for dyslexia
- **Classic (snow)**: Original light background for traditional appearance

## Testing Recommendations

### Manual Testing Required

Test on these websites to ensure backgrounds work without breaking UI:

1. **Gmail** - Complex, heavily styled email client
   - Check: Compose button, sidebar, message cards, dropdowns

2. **GitHub** - Developer site with code blocks
   - Check: Navigation, file tree, code syntax highlighting, buttons

3. **Reddit** - Social media with cards/posts
   - Check: Post cards, voting buttons, comment threads, modals

4. **Wikipedia** - Simple content site
   - Check: Article text, infoboxes, navigation

5. **News Site with Ads** - Complex layout with third-party content
   - Check: Ad units, navigation, article content, comment sections

### What to Look For:

- ✅ Main content area changes background color
- ✅ Text remains readable with proper color contrast
- ✅ Buttons keep their original styling
- ✅ Modals/dialogs remain visible and usable
- ✅ Navigation menus work correctly
- ✅ Cards/alerts maintain their distinctive appearance
- ✅ Images, photos, and avatars remain visible
- ✅ Icons (both img and background-image) display correctly
- ✅ SVG graphics and logos stay intact
- ❌ No broken layouts
- ❌ No invisible text or images
- ❌ No broken hover states

## Integration Tests

The existing integration tests in `test/integration/background-colors.test.ts` should still pass. Run:

```bash
yarn test:integration
```

## Known Limitations

1. **Heuristic Approach**: Uses class name patterns (`class*="button"`) which may not catch all cases
2. **Site-Specific**: Some sites with unconventional class names might still have issues
3. **Trade-off**: More conservative than the original, may miss some content containers
4. **Background-image detection**: Only catches inline `style="background-image"`, not CSS class-based backgrounds
5. **Complex layouts**: Sites with deeply nested divs may still have edge cases

## Future Improvements

Consider adding:

1. **Per-Site Rules**: Allow users to add custom CSS rules for specific domains
2. **Whitelist/Blacklist**: Let users exclude certain elements or sites
3. **Intensity Slider**: Adjust how aggressively the background is applied
4. **Smart Detection**: Use heuristics to detect content vs UI elements more accurately

## Rollback Instructions

If this causes issues, revert to the original approach by replacing the background rules with:

```css
body.dyslexia-friendly.dyslexia-friendly-bg-cream
  *:not([style*='background']):not([style*='color']) {
  background-color: inherit !important;
  color: inherit !important;
}
```

However, this will bring back the original UI-breaking issues.
