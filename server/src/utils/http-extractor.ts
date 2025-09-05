import { URL } from 'url';
import { ExtractionResult, PricePattern } from '../types';
import { IExtractor, IHttpClient } from '../interfaces';
import { LoggerFactory } from '../logger/logger';

export class HttpExtractor implements IExtractor {
  private readonly logger = LoggerFactory.create('HttpExtractor');
  private static readonly PRICE_PATTERNS: PricePattern[] = [
    { pattern: /Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i, currency: 'INR' },
    { pattern: /₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i, currency: 'INR' },
    { pattern: /\$(\d+(?:\.\d{2})?)/i, currency: 'USD' },
    { pattern: /€(\d+(?:\.\d{2})?)/i, currency: 'EUR' },
    { pattern: /£(\d+(?:\.\d{2})?)/i, currency: 'GBP' },
    { pattern: /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rupees?|rs\.?)/i, currency: 'INR' }
  ];

  constructor(private readonly httpClient: IHttpClient) {}

  async extract(url: string): Promise<ExtractionResult> {
    try {
      this.logger.debug('Starting HTTP extraction', { url });
      
      const response = await this.httpClient.get(url);
      const result = this.extractFromHTML(response.data, new URL(url));
      
      this.logger.debug('HTTP extraction completed', { 
        url, 
        fieldsExtracted: Object.keys(result).length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('HTTP extraction failed', error as Error, { url });
      throw error;
    }
  }

  canExtract(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  getPriority(): number {
    return 1; // High priority for fast extraction
  }

  private extractFromHTML(html: string, urlObj: URL): ExtractionResult {
    const result: ExtractionResult = {};

    try {
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        result.title = titleMatch[1].trim();
      }

      // Extract Open Graph title
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      if (ogTitleMatch) {
        result.title = ogTitleMatch[1].trim();
      }

      // Extract Open Graph image
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImageMatch) {
        result.image = ogImageMatch[1].trim();
      }

      // Extract Open Graph description
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      if (ogDescMatch) {
        result.description = ogDescMatch[1].trim();
      }

      // Extract site name
      const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
      if (ogSiteMatch) {
        result.siteName = ogSiteMatch[1].trim();
      } else {
        result.siteName = urlObj.hostname;
      }

      // Extract price information
      this.extractPriceInfo(result, html);

    } catch (error) {
      this.logger.error('HTML parsing failed', error as Error);
    }

    return result;
  }

  private extractPriceInfo(result: ExtractionResult, _html: string): void {
    const priceText = (result.title || '') + ' ' + (result.description || '');
    
    for (const { pattern, currency } of HttpExtractor.PRICE_PATTERNS) {
      const priceMatch = priceText.match(pattern);
      if (priceMatch) {
        result.price = priceMatch[1].replace(/,/g, ''); // Remove commas
        result.currency = currency;
        break;
      }
    }
  }

  static hasGoodData(extractionResult: ExtractionResult): boolean {
    return !!(extractionResult.title && 
              extractionResult.title.length > 20 && 
              !extractionResult.title.toLowerCase().includes('online shopping') &&
              !extractionResult.title.toLowerCase().includes('welcome to') &&
              !extractionResult.title.toLowerCase().includes('home page'));
  }
}

