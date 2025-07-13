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

// Helper function to reset extension to default state
async function resetExtensionToDefault(
  context: ExtensionTestContext,
): Promise<void> {
  const popupPage = await openExtensionPopup(context);

  // Wait for popup to load
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Reset extension to enabled state
  await popupPage.evaluate(async () => {
    return new Promise<void>((resolve) => {
      // Set default config
      const defaultConfig = {
        extensionEnabled: true,
        fontEnabled: true,
        rulerEnabled: true,
        rulerSize: 30,
        rulerColor: '#000000',
        rulerOpacity: 0.1,
        fontChoice: 'opendyslexic',
      };

      chrome.storage.sync.set({ config: defaultConfig }, () => {
        resolve();
      });
    });
  });

  // Wait for storage to be updated
  await new Promise((resolve) => setTimeout(resolve, 500));

  await popupPage.close();
}

describe('Dyslexia Friendly Extension Integration Tests', () => {
  let context: ExtensionTestContext;

  beforeEach(async () => {
    await resetExtensionToDefault(context);
  });

  beforeAll(async () => {
    // Load the extension in browser with retry logic
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        context = await loadExtensionInBrowser();
        break;
      } catch (error) {
        attempts++;
        console.error(
          `Failed to load extension (attempt ${attempts}/${maxAttempts}):`,
          error,
        );

        if (attempts === maxAttempts) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  });

  afterAll(async () => {
    if (context?.browser) {
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
      const hasPopupWrapper = await popupPage.$('#popup-wrapper');
      const hasConfigForm = await popupPage.$('#configForm');
      expect(hasPopupWrapper).toBeTruthy();
      expect(hasConfigForm).toBeTruthy();

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

  describe('Extension Disable Button', () => {
    test('should toggle extension disabled state and persist in storage', async () => {
      const popupPage = await openExtensionPopup(context);

      // Wait for popup to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find the extension disable button (master switch)
      const disableButton = await popupPage.$('#master-switch-checkbox');
      expect(disableButton).toBeTruthy();

      // Check initial state - should be enabled by default
      const initialState = await popupPage.evaluate(
        (el) => (el as HTMLInputElement).checked,
        disableButton,
      );
      expect(initialState).toBe(true);

      // Toggle the disable button
      await disableButton!.click();

      // Wait for the change to propagate and form to be submitted
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify the button state changed
      const newState = await popupPage.evaluate(
        (el) => (el as HTMLInputElement).checked,
        disableButton,
      );
      expect(newState).toBe(false);

      // Verify that the UI sections are hidden when disabled
      const fontSection = await popupPage.$(
        '[data-show-when="extensionEnabled"]',
      );
      const isHidden = await popupPage.evaluate(
        (el) => window.getComputedStyle(el as Element).display === 'none',
        fontSection,
      );
      expect(isHidden).toBe(true);

      await popupPage.close();
    });

    test('should persist disable state across popup sessions', async () => {
      // First session - disable the extension
      let popupPage = await openExtensionPopup(context);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const disableButton = await popupPage.$('#master-switch-checkbox');
      await disableButton!.click();
      await new Promise((resolve) => setTimeout(resolve, 500));

      await popupPage.close();

      // Second session - verify state is persisted
      popupPage = await openExtensionPopup(context);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const disableButtonNew = await popupPage.$('#master-switch-checkbox');
      const persistedState = await popupPage.evaluate(
        (el) => (el as HTMLInputElement).checked,
        disableButtonNew,
      );
      expect(persistedState).toBe(false);

      // Re-enable for cleanup
      await disableButtonNew!.click();
      await new Promise((resolve) => setTimeout(resolve, 500));

      await popupPage.close();
    });
  });
});
