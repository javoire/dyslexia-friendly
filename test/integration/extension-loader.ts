import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_ID = 'miepjgfkkommhllbbjaedffcpkncboeo';
const EXTENSION_PATH = path.join(__dirname, '../../build/extension');

interface ExtensionTestContext {
  browser: Browser;
  page: Page;
  extensionId: string;
}

// Check if we're running in CI
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

export async function loadExtensionInBrowser(): Promise<ExtensionTestContext> {
  const extensionPath = EXTENSION_PATH;

  // Check if extension build directory exists
  if (!existsSync(extensionPath)) {
    throw new Error(`Extension build directory not found at: ${extensionPath}. Please run 'yarn build' first.`);
  }

  // Base Chrome arguments for extension testing
  const chromeArgs = [
    `--load-extension=${extensionPath}`,
    `--disable-extensions-except=${extensionPath}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-blink-features=AutomationControlled',
    '--disable-component-extensions-with-background-pages',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-field-trial-config',
    '--disable-ipc-flooding-protection',
  ];

  // Add CI-specific arguments
  if (isCI) {
    chromeArgs.push(
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-accelerated-2d-canvas',
      '--disable-accelerated-jpeg-decoding',
      '--disable-accelerated-mjpeg-decode',
      '--disable-accelerated-video-decode',
      '--disable-accelerated-video-encode',
      '--disable-background-media-suspend',
      '--disable-extensions-file-access-check',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-domain-reliability',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-plugins-discovery',
      '--disable-plugins',
      '--mute-audio',
      '--single-process',
      '--remote-debugging-port=9222'
    );
  }

  try {
    const browser = await puppeteer.launch({
      headless: isCI ? true : false, // Use headless mode for CI
      args: chromeArgs,
      timeout: 30000,
      protocolTimeout: 30000,
    });

    const page = await browser.newPage();
    await page.setDefaultTimeout(30000);
    await page.setDefaultNavigationTimeout(30000);

    // Get extension ID from chrome://extensions page
    const extensionId = EXTENSION_ID;

    return { browser, page, extensionId };
  } catch (error) {
    console.error('Failed to launch browser:', error);
    throw error;
  }
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
