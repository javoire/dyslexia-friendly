import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExtensionTestContext {
  browser: Browser;
  page: Page;
  extensionId: string;
}

export async function loadExtensionInBrowser(): Promise<ExtensionTestContext> {
  const extensionPath = path.join(__dirname, '../../build/extension');

  const browser = await puppeteer.launch({
    headless: false, // Extensions require non-headless mode
    args: [
      `--load-extension=${extensionPath}`,
      '--disable-extensions-except=' + extensionPath,
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ],
  });

  const page = await browser.newPage();

  // Get extension ID from chrome://extensions page
  const extensionId = await getExtensionId(page);

  return { browser, page, extensionId };
}

async function getExtensionId(page: Page): Promise<string> {
  await page.goto('chrome://extensions');

  // Wait for extensions to load
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Extract extension ID from the DOM
  const extensionId = await page.evaluate(() => {
    const extensions = document.querySelectorAll('extensions-item');
    for (const extension of extensions) {
      const nameElement = extension.shadowRoot?.querySelector('#name');
      if (nameElement?.textContent?.includes('Dyslexia Friendly')) {
        return extension.getAttribute('id');
      }
    }
    return null;
  });

  if (!extensionId) {
    throw new Error('Extension not found or not loaded properly');
  }

  return extensionId;
}

export async function openExtensionPopup(
  context: ExtensionTestContext,
): Promise<Page> {
  const { browser, extensionId } = context;

  // Open extension popup
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;
  const popupPage = await browser.newPage();
  await popupPage.goto(popupUrl);

  return popupPage;
}

export async function openExtensionOptions(
  context: ExtensionTestContext,
): Promise<Page> {
  const { browser, extensionId } = context;

  // Open extension options
  const optionsUrl = `chrome-extension://${extensionId}/options.html`;
  const optionsPage = await browser.newPage();
  await optionsPage.goto(optionsUrl);

  return optionsPage;
}

export async function testContentScriptOnPage(
  context: ExtensionTestContext,
  url: string,
): Promise<Page> {
  const { browser } = context;

  const testPage = await browser.newPage();
  await testPage.goto(url);

  // Wait for content script to load
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return testPage;
}
