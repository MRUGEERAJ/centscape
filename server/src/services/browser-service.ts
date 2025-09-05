import puppeteer, { Browser, Page } from 'puppeteer';
import { IBrowserService } from '../interfaces';
import { ConfigManager } from '../config/app-config';
import { LoggerFactory } from '../logger/logger';

export class BrowserService implements IBrowserService {
  private readonly logger = LoggerFactory.create('BrowserService');
  private readonly config = ConfigManager.getPuppeteerConfig();
  private browser: Browser | null = null;

  async takeScreenshot(url: string): Promise<Buffer> {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const page = await this.browser!.newPage();
    
    try {
      this.logger.debug('Taking screenshot', { url });

      // Set viewport
      await page.setViewport({
        width: this.config.viewport.width,
        height: this.config.viewport.height
      });

      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.timeout
      });

      // Wait for dynamic content
      await this.waitForDynamicContent(page);

      // Take screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        type: 'png'
      });

      this.logger.debug('Screenshot captured', { 
        url, 
        size: screenshot.length 
      });

      return screenshot as Buffer;

    } catch (error) {
      this.logger.error('Screenshot failed', error as Error, { url });
      throw new Error(`Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.debug('Browser closed');
    }
  }

  private async initializeBrowser(): Promise<void> {
    try {
      this.logger.debug('Initializing browser');
      
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: [...this.config.args]
      });

      this.logger.debug('Browser initialized');
    } catch (error) {
      this.logger.error('Failed to initialize browser', error as Error);
      throw new Error('Failed to initialize browser');
    }
  }

  private async waitForDynamicContent(page: Page): Promise<void> {
    // Wait for initial content load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Scroll to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait for lazy loaded content
    await new Promise(resolve => setTimeout(resolve, 1000));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
