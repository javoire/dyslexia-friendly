import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { Browser, Page } from 'puppeteer';
import {
  loadExtensionInBrowser,
  openExtensionPopup,
  testContentScriptOnPage,
} from './extension-loader';

interface ExtensionTestContext {
  browser: Browser;
  page: Page;
  extensionId: string;
}

describe('Background Colors Integration Tests', () => {
  let context: ExtensionTestContext;

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
  }, 60000); // 60 second timeout for beforeAll

  afterAll(async () => {
    if (context?.browser) {
      await context.browser.close();
    }
  });

  // Helper function to clear extension storage before each test
  const clearExtensionStorage = async (page: Page) => {
    await page.evaluate(() => {
      if (
        window.chrome &&
        window.chrome.storage &&
        window.chrome.storage.sync
      ) {
        return new Promise((resolve) => {
          chrome.storage.sync.clear(() => {
            resolve(undefined);
          });
        });
      }
      return Promise.resolve();
    });
  };

  describe('Background Color Controls', () => {
    test('should enable and select cream background option', async () => {
      const popupPage = await openExtensionPopup(context);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear extension storage to start with clean state
      await clearExtensionStorage(popupPage);

      // First, check if elements exist at all
      const masterSwitch = await popupPage.$('#master-switch-checkbox');
      expect(masterSwitch).not.toBeNull();

      // Enable extension first
      await popupPage.click('#master-switch-checkbox');

      // Trigger input event to update UI visibility and ensure form is processed
      await popupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#master-switch-checkbox',
        ) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true; // Ensure it's checked
          checkbox.dispatchEvent(new Event('input', { bubbles: true }));
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Debug: Check what's visible and what's in the DOM
      const debugInfo = await popupPage.evaluate(() => {
        const backgroundSection = document.querySelector(
          '[data-show-when="extensionEnabled"]',
        );
        const backgroundSwitch = document.querySelector(
          '#background-switch-checkbox',
        );
        const masterSwitch = document.querySelector(
          '#master-switch-checkbox',
        ) as HTMLInputElement;

        return {
          backgroundSectionExists: !!backgroundSection,
          backgroundSectionVisible: backgroundSection
            ? getComputedStyle(backgroundSection).display !== 'none'
            : false,
          backgroundSwitchExists: !!backgroundSwitch,
          masterSwitchChecked: masterSwitch ? masterSwitch.checked : false,
          allDataShowWhen: Array.from(
            document.querySelectorAll('[data-show-when]'),
          ).map((el) => ({
            showWhen: el.getAttribute('data-show-when'),
            visible: getComputedStyle(el).display !== 'none',
          })),
        };
      });

      // Wait for background section to become visible
      await popupPage.waitForSelector('#background-switch-checkbox', {
        visible: true,
        timeout: 10000,
      });

      // Enable background feature
      await popupPage.click('#background-switch-checkbox');

      // Trigger input event to update UI visibility and ensure form is processed
      await popupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#background-switch-checkbox',
        ) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true; // Ensure it's checked
          checkbox.dispatchEvent(new Event('input', { bubbles: true }));
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Wait for background options to be visible
      await popupPage.waitForSelector('#background-cream-radio', {
        visible: true,
        timeout: 10000,
      });

      // Select cream background
      await popupPage.click('#background-cream-radio');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify cream option is selected
      const isChecked = await popupPage.evaluate(() => {
        const radio = document.querySelector(
          '#background-cream-radio',
        ) as HTMLInputElement;
        return radio?.checked || false;
      });
      expect(isChecked).toBe(true);

      // Submit form to save configuration
      await popupPage.evaluate(() => {
        const form = document.querySelector('#configForm') as HTMLFormElement;
        if (form) {
          form.dispatchEvent(new Event('submit'));
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await popupPage.close();
    }, 30000); // 30 second timeout

    test('should save cream background configuration', async () => {
      // Make sure the configuration from previous test is saved and propagated
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify the configuration was saved by opening a new popup and checking the state
      const verifyPopupPage = await openExtensionPopup(context);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if the master switch is enabled
      const masterSwitchChecked = await verifyPopupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#master-switch-checkbox',
        ) as HTMLInputElement;
        return checkbox?.checked || false;
      });
      expect(masterSwitchChecked).toBe(true);

      // Check if the background switch is enabled
      const backgroundSwitchChecked = await verifyPopupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#background-switch-checkbox',
        ) as HTMLInputElement;
        return checkbox?.checked || false;
      });
      expect(backgroundSwitchChecked).toBe(true);

      // Check if cream background is selected
      const creamRadioChecked = await verifyPopupPage.evaluate(() => {
        const radio = document.querySelector(
          '#background-cream-radio',
        ) as HTMLInputElement;
        return radio?.checked || false;
      });
      expect(creamRadioChecked).toBe(true);

      await verifyPopupPage.close();
    }, 30000); // 30 second timeout
  });

  describe('Background Feature Toggle', () => {
    test('should disable background when background switch is turned off', async () => {
      const popupPage = await openExtensionPopup(context);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear extension storage to start with clean state
      await clearExtensionStorage(popupPage);

      // Enable extension
      await popupPage.click('#master-switch-checkbox');

      // Trigger input event to update UI visibility
      await popupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#master-switch-checkbox',
        ) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('input', { bubbles: true }));
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Wait for background section to become visible
      await popupPage.waitForSelector('#background-switch-checkbox', {
        visible: true,
        timeout: 10000,
      });

      // First enable background feature
      await popupPage.click('#background-switch-checkbox');

      // Trigger input event to update UI visibility
      await popupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#background-switch-checkbox',
        ) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('input', { bubbles: true }));
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Now turn off background to test the toggle
      await popupPage.click('#background-switch-checkbox');

      // Trigger input event to update UI
      await popupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#background-switch-checkbox',
        ) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = false;
          checkbox.dispatchEvent(new Event('input', { bubbles: true }));
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Submit form to save
      await popupPage.evaluate(() => {
        const form = document.querySelector('#configForm') as HTMLFormElement;
        if (form) {
          form.dispatchEvent(new Event('submit'));
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await popupPage.close();

      // Verify the configuration was saved by opening a new popup and checking the state
      const verifyPopupPage = await openExtensionPopup(context);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if the master switch is still enabled
      const masterSwitchChecked = await verifyPopupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#master-switch-checkbox',
        ) as HTMLInputElement;
        return checkbox?.checked || false;
      });
      expect(masterSwitchChecked).toBe(true);

      // Check if the background switch is disabled
      const backgroundSwitchChecked = await verifyPopupPage.evaluate(() => {
        const checkbox = document.querySelector(
          '#background-switch-checkbox',
        ) as HTMLInputElement;
        return checkbox?.checked || false;
      });
      expect(backgroundSwitchChecked).toBe(false);

      // Check that background options are hidden when background is disabled
      const backgroundOptionsVisible = await verifyPopupPage.evaluate(() => {
        const section = document.querySelector(
          '[data-show-when="backgroundEnabled"]',
        );
        return section ? getComputedStyle(section).display !== 'none' : false;
      });
      expect(backgroundOptionsVisible).toBe(false);

      await verifyPopupPage.close();
    }, 30000); // 30 second timeout
  });
});
