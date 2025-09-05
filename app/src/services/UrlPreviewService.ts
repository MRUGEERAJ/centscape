/**
 * URL preview service for fetching metadata from web pages
 * Handles Open Graph, meta tags, and structured data extraction
 */

import axios, { AxiosResponse } from 'axios';
import { AppError, ErrorType, UrlPreview } from '../types';
import { UrlNormalizationService } from './UrlNormalizationService';

export class UrlPreviewService {
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Fetches preview data from a URL with retry logic
   */
  static async fetchPreview(url: string): Promise<UrlPreview> {
    const sanitizedUrl = UrlNormalizationService.sanitizeUrl(url);
    
    if (!UrlNormalizationService.isValidUrl(sanitizedUrl)) {
      throw {
        type: ErrorType.VALIDATION,
        message: 'Invalid URL provided',
        retryable: false,
      } as AppError;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeRequest(sanitizedUrl);
        return this.parsePreviewData(response.data, sanitizedUrl);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
    }

    throw {
      type: ErrorType.NETWORK,
      message: `Failed to fetch preview after ${this.MAX_RETRIES} attempts: ${lastError?.message}`,
      retryable: true,
    } as AppError;
  }

  /**
   * Makes HTTP request to fetch page content
   */
  private static async makeRequest(url: string): Promise<AxiosResponse<string>> {
    return axios.get(url, {
      timeout: this.TIMEOUT,
      headers: {
        'User-Agent': 'Centscape/1.0 (Preview Bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });
  }

  /**
   * Parses HTML content to extract preview data
   */
  private static parsePreviewData(html: string, originalUrl: string): UrlPreview {
    const normalizedUrl = UrlNormalizationService.normalizeUrl(originalUrl);
    const sourceDomain = UrlNormalizationService.extractDomain(originalUrl);

    // Extract meta tags
    const title = this.extractTitle(html);
    const description = this.extractDescription(html);
    const imageUrl = this.extractImageUrl(html, originalUrl);
    const price = this.extractPrice(html);

    return {
      title: title || 'Untitled',
      description,
      imageUrl,
      price,
      sourceDomain,
      originalUrl,
      normalizedUrl,
    };
  }

  /**
   * Extracts title from HTML
   */
  private static extractTitle(html: string): string | null {
    // Try Open Graph title first
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogTitleMatch) return ogTitleMatch[1];

    // Try regular title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1];

    return null;
  }

  /**
   * Extracts description from HTML
   */
  private static extractDescription(html: string): string | null {
    // Try Open Graph description first
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogDescMatch) return ogDescMatch[1];

    // Try meta description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (metaDescMatch) return metaDescMatch[1];

    return null;
  }

  /**
   * Extracts image URL from HTML
   */
  private static extractImageUrl(html: string, baseUrl: string): string | null {
    // Try Open Graph image first
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogImageMatch) {
      const imageUrl = ogImageMatch[1];
      return this.resolveRelativeUrl(imageUrl, baseUrl);
    }

    // Try Twitter card image
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (twitterImageMatch) {
      const imageUrl = twitterImageMatch[1];
      return this.resolveRelativeUrl(imageUrl, baseUrl);
    }

    return null;
  }

  /**
   * Extracts price from HTML (supports various formats)
   */
  private static extractPrice(html: string): string | null {
    // Try structured data (JSON-LD)
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const content = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          const data = JSON.parse(content);
          
          if (data.price) {
            return this.formatPrice(data.price);
          }
          
          if (data.offers && data.offers.price) {
            return this.formatPrice(data.offers.price);
          }
        } catch {
          // Continue to next match
        }
      }
    }

    // Try meta tags for price
    const priceMatch = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (priceMatch) {
      return this.formatPrice(priceMatch[1]);
    }

    return null;
  }

  /**
   * Resolves relative URLs to absolute URLs
   */
  private static resolveRelativeUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    
    if (url.startsWith('/')) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${url}`;
    }
    
    return `${baseUrl}/${url}`;
  }

  /**
   * Formats price string consistently
   */
  private static formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  }

  /**
   * Utility for delay between retries
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
