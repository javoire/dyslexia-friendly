import { beforeAll, afterAll } from '@jest/globals';
import puppeteer, { Browser } from 'puppeteer';

let browser: Browser;

beforeAll(async () => {
  // Browser setup for integration tests
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ],
  });
});

afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

// Browser will be available to tests through the loadExtensionInBrowser function
// No need to set global browser variable for integration tests
