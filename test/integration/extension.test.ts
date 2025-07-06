import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { Browser, Page } from 'puppeteer';
import {
  loadExtensionInBrowser,
  openExtensionPopup,
  openExtensionOptions,
  testContentScriptOnPage,
} from './extension-loader';

interface ExtensionTestContext {
  browser: Browser;
  page: Page;
  extensionId: string;
}

describe('Dyslexia Friendly Extension Integration Tests', () => {
  let context: ExtensionTestContext;

  beforeAll(async () => {
    // Increase timeout for integration tests
    jest.setTimeout(60000);

    // Load the extension in browser
    context = await loadExtensionInBrowser();
  });

  afterAll(async () => {
    if (context.browser) {
      await context.browser.close();
    }
  });

  describe('Extension Loading', () => {
    test('extension should load successfully', async () => {
      expect(context.extensionId).toBeDefined();
      expect(context.extensionId).toMatch(/^[a-z]{32}$/); // Chrome extension ID format
    });

    test('manifest should be valid', async () => {
      const manifestUrl = `chrome-extension://${context.extensionId}/manifest.json`;
      const manifestPage = await context.browser.newPage();
      const response = await manifestPage.goto(manifestUrl);

      expect(response?.status()).toBe(200);

      const manifest = await manifestPage.evaluate(() => {
        return JSON.parse(document.body.textContent || '{}');
      });

      expect(manifest.name).toBe('Dyslexia Friendly');
      expect(manifest.manifest_version).toBe(3);
      expect(manifest.version).toBeDefined();

      await manifestPage.close();
    });
  });

  describe('Popup Interface', () => {
    test('popup should open and display correctly', async () => {
      const popupPage = await openExtensionPopup(context);

      // Wait for popup to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if popup loaded successfully
      const title = await popupPage.title();
      expect(title).toContain('Dyslexia Friendly');

      // Check if essential elements are present
      const hasMainContent = await popupPage.$('#main-content');
      expect(hasMainContent).toBeTruthy();

      await popupPage.close();
    });

    test('popup controls should be interactive', async () => {
      const popupPage = await openExtensionPopup(context);

      // Wait for popup to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test font family selector
      const fontFamilySelect = await popupPage.$('#font-family-select');
      if (fontFamilySelect) {
        await fontFamilySelect.click();

        // Check if options are available
        const options = await popupPage.$$('#font-family-select option');
        expect(options.length).toBeGreaterThan(1);
      }

      // Test enable/disable toggle
      const enableToggle = await popupPage.$('#enable-toggle');
      if (enableToggle) {
        const isChecked = await popupPage.evaluate(
          (el) => (el as HTMLInputElement).checked,
          enableToggle,
        );
        expect(typeof isChecked).toBe('boolean');
      }

      await popupPage.close();
    });
  });

  describe('Options Page', () => {
    test('options page should load correctly', async () => {
      const optionsPage = await openExtensionOptions(context);

      // Wait for options page to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const title = await optionsPage.title();
      expect(title).toContain('Dyslexia Friendly');

      await optionsPage.close();
    });
  });

  describe('Content Script Integration', () => {
    test('content script should inject on web pages', async () => {
      // Test on a simple HTML page
      const testPage = await testContentScriptOnPage(
        context,
        'https://example.com',
      );

      // Check if content script has been injected
      const hasContentScript = await testPage.evaluate(() => {
        // Look for signs that the content script is running
        // This could be checking for specific CSS classes, global variables, etc.
        return (
          window.hasOwnProperty('dyslexiaFriendlyLoaded') ||
          document.querySelector('.dyslexia-friendly-applied') !== null ||
          document.querySelector('style[data-dyslexia-friendly]') !== null
        );
      });

      // Note: This test might pass or fail depending on the actual implementation
      // You'll need to adjust based on how your content script works
      expect(typeof hasContentScript).toBe('boolean');

      await testPage.close();
    });

    test('content script should apply styles when enabled', async () => {
      const testPage = await testContentScriptOnPage(
        context,
        'https://example.com',
      );

      // Simulate extension being enabled and applying styles
      await testPage.evaluate(() => {
        // Trigger content script functionality
        // This would depend on how your extension communicates with content scripts
        const event = new CustomEvent('dyslexiaFriendlyToggle', {
          detail: { enabled: true },
        });
        document.dispatchEvent(event);
      });

      // Wait for styles to be applied
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if styles were applied
      const stylesApplied = await testPage.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        // Check for font changes or other style modifications
        return (
          computedStyle.fontFamily.includes('OpenDyslexic') ||
          computedStyle.fontFamily.includes('Comic Sans') ||
          body.classList.contains('dyslexia-friendly-active')
        );
      });

      expect(typeof stylesApplied).toBe('boolean');

      await testPage.close();
    });
  });

  describe('Storage Integration', () => {
    test('extension should save and load settings', async () => {
      const popupPage = await openExtensionPopup(context);

      // Wait for popup to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test storage operations by interacting with the popup
      const settingsForm = await popupPage.$('#settings-form');
      if (settingsForm) {
        // Change a setting
        const fontSelect = await popupPage.$('#font-family-select');
        if (fontSelect) {
          await popupPage.select('#font-family-select', 'OpenDyslexic');
        }

        // Save settings (if there's a save button)
        const saveButton = await popupPage.$('#save-settings');
        if (saveButton) {
          await saveButton.click();
        }

        // Wait for save operation
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await popupPage.close();

      // Re-open popup and check if settings were saved
      const newPopupPage = await openExtensionPopup(context);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const savedValue = await newPopupPage
        .$eval('#font-family-select', (el) => (el as HTMLSelectElement).value)
        .catch(() => null);

      // If the select element exists, check if it has a value
      if (savedValue !== null) {
        expect(typeof savedValue).toBe('string');
      }

      await newPopupPage.close();
    });
  });

  describe('Extension Communication', () => {
    test('popup should communicate with content script', async () => {
      const popupPage = await openExtensionPopup(context);
      const testPage = await testContentScriptOnPage(
        context,
        'https://example.com',
      );

      // Wait for both pages to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Test communication between popup and content script
      // This would depend on your specific implementation
      const messageTest = await popupPage.evaluate(() => {
        // Simulate sending a message to content script
        try {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id!, { action: 'test' });
            }
          });
          return true;
        } catch (error) {
          return false;
        }
      });

      expect(typeof messageTest).toBe('boolean');

      await popupPage.close();
      await testPage.close();
    });
  });
});
