# Chrome Extension Integration Tests

This directory contains integration tests for the Dyslexia Friendly Chrome extension using Puppeteer and Jest.

## Overview

The integration tests cover:

- **Extension Loading**: Verifies the extension loads correctly and manifest is valid
- **Popup Interface**: Tests the popup UI and user interactions
- **Options Page**: Tests the options page functionality
- **Content Script Integration**: Tests content script injection and styling
- **Storage Integration**: Tests settings persistence
- **Extension Communication**: Tests message passing between components

## Prerequisites

1. **Build the extension first**:

   ```bash
   yarn build
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   yarn install
   ```

## Running Tests

### Run All Integration Tests

```bash
yarn test:integration
```

### Run Only Unit Tests

```bash
yarn test:unit
```

### Run All Tests (Unit + Integration)

```bash
yarn test
```

### Run Tests with Verification

```bash
yarn verify
```

## Test Structure

### Extension Loader (`extension-loader.ts`)

Utility functions for:

- Loading the extension in a Puppeteer browser instance
- Opening popup and options pages
- Testing content scripts on web pages
- Managing browser contexts

### Integration Tests (`extension.test.ts`)

Comprehensive test suites covering:

- Extension loading and manifest validation
- Popup interface functionality
- Options page behavior
- Content script injection and styling
- Settings persistence
- Inter-component communication

## Configuration

### Jest Configuration

The integration tests use a separate Jest configuration:

- **Environment**: Node.js (for Puppeteer)
- **Test Pattern**: `**/integration/**/*.test.ts`
- **Setup**: `test/integration/setup.ts`

### Browser Configuration

Puppeteer launches Chrome with:

- Non-headless mode (required for extensions)
- Extension loading enabled
- Security features disabled for testing

## Customizing Tests

### Adapting to Your Extension

You may need to modify the tests based on your specific implementation:

1. **Element Selectors**: Update CSS selectors to match your HTML structure
2. **Content Script Detection**: Modify how tests detect content script presence
3. **Storage Operations**: Adjust storage testing to match your data structure
4. **Communication Patterns**: Update message passing tests for your specific implementation

### Example Customizations

```typescript
// Update selectors in tests
const fontSelect = await popupPage.$('#your-font-selector');

// Modify content script detection
const hasContentScript = await testPage.evaluate(() => {
  return window.yourExtensionGlobal !== undefined;
});

// Adjust storage testing
const savedSettings = await popupPage.evaluate(() => {
  return chrome.storage.local.get(['yourSettingsKey']);
});
```

## Troubleshooting

### Common Issues

1. **Extension Not Loading**

   - Ensure extension is built (`yarn build`)
   - Check build output in `build/extension/`
   - Verify manifest.json is valid

2. **Tests Timing Out**

   - Increase test timeout in Jest configuration
   - Add more wait time for slow operations
   - Check for infinite loops in extension code

3. **Element Not Found**

   - Verify CSS selectors match your HTML
   - Add debug screenshots: `await page.screenshot({path: 'debug.png'})`
   - Check if elements are in shadow DOM

4. **Chrome API Errors**
   - Ensure extension has proper permissions
   - Check for manifest v3 compatibility
   - Verify service worker registration

### Debug Mode

To debug tests with visible browser:

```typescript
// In extension-loader.ts
const browser = await puppeteer.launch({
  headless: false,
  devtools: true, // Open DevTools
  slowMo: 100, // Slow down actions
  // ... other options
});
```

## Best Practices

1. **Test Independence**: Each test should be independent and not rely on state from other tests
2. **Cleanup**: Always close pages and browsers in `afterAll` hooks
3. **Error Handling**: Use try/catch blocks for operations that might fail
4. **Realistic Testing**: Test with real websites when possible
5. **Performance**: Use appropriate timeouts and avoid excessive waiting

## Contributing

When adding new integration tests:

1. Follow the existing test structure
2. Add appropriate error handling
3. Include clear test descriptions
4. Test both success and failure cases
5. Update this README if adding new test categories
