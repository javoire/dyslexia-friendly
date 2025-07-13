import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_ID = 'miepjgfkkommhllbbjaedffcpkncboeo';
const EXTENSION_PATH = path.join(__dirname, '../../build/extension');

interface ExtensionTestContext {
  browser: Browser;
  page: Page;
  extensionId: string;
}

export async function loadExtensionInBrowser(): Promise<ExtensionTestContext> {
  const extensionPath = EXTENSION_PATH;

  const browser = await puppeteer.launch({
    headless: false, // Extensions require non-headless mode
    pipe: true, // Recommended for better performance
    enableExtensions: [extensionPath], // Modern way to load extensions
    args: [
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
  const extensionId = EXTENSION_ID;

  return { browser, page, extensionId };
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
