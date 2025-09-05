/**
 * URL normalization and validation utilities
 * Handles UTM parameter stripping, host normalization, and fragment removal
 */

import URLParse from 'url-parse';
import { AppError, ErrorType } from '../types';

export class UrlNormalizationService {
  private static readonly UTM_PARAMS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    'utm_source_platform',
    'utm_creative_format',
    'utm_marketing_tactic',
  ];

  /**
   * Normalizes a URL by:
   * - Stripping UTM parameters
   * - Lowercasing the host
   * - Removing fragments (#...)
   * - Handling www vs non-www
   */
  static normalizeUrl(url: string): string {
    try {
      // First validate the URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL format');
      }

      const parsed = new URLParse(url, true);
      
      // Ensure protocol is present and normalize to https
      if (!parsed.protocol) {
        parsed.set('protocol', 'https');
      } else {
        parsed.set('protocol', 'https');
      }

      // Normalize host (lowercase and handle www)
      let normalizedHost = parsed.hostname.toLowerCase();
      if (normalizedHost.startsWith('www.')) {
        normalizedHost = normalizedHost.substring(4);
      }
      parsed.set('hostname', normalizedHost);

      // Remove fragments
      parsed.set('hash', '');

      // Remove UTM parameters
      const query = parsed.query;
      this.UTM_PARAMS.forEach(param => {
        delete query[param];
      });

      // Rebuild URL
      const cleanUrl = parsed.toString();
      
      // Remove trailing slash for consistency
      return cleanUrl.replace(/\/$/, '');
    } catch (error) {
      throw {
        type: ErrorType.VALIDATION,
        message: 'Invalid URL format',
        retryable: false,
      } as AppError;
    }
  }

  /**
   * Validates if a string is a valid URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extracts domain from URL
   */
  static extractDomain(url: string): string {
    try {
      const parsed = new URLParse(url);
      let domain = parsed.hostname.toLowerCase();
      
      // Remove www prefix
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }
      
      return domain;
    } catch {
      return '';
    }
  }

  /**
   * Sanitizes URL for safe processing
   */
  static sanitizeUrl(url: string): string {
    // Remove any whitespace
    let sanitized = url.trim();
    
    // Ensure URL has protocol
    if (!sanitized.match(/^https?:\/\//)) {
      sanitized = `https://${sanitized}`;
    }
    
    return sanitized;
  }

  /**
   * Compares two URLs for equality after normalization
   */
  static areUrlsEqual(url1: string, url2: string): boolean {
    try {
      const normalized1 = this.normalizeUrl(url1);
      const normalized2 = this.normalizeUrl(url2);
      return normalized1 === normalized2;
    } catch {
      return false;
    }
  }
}
