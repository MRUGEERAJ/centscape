/**
 * Test file for URL normalization service
 */

import { UrlNormalizationService } from '../UrlNormalizationService';

describe('UrlNormalizationService', () => {
  describe('normalizeUrl', () => {
    it('should normalize URLs correctly', () => {
      const testCases = [
        {
          input: 'https://www.amazon.com/product?utm_source=google&ref=123#section',
          expected: 'https://amazon.com/product?ref=123',
        },
        {
          input: 'http://WWW.EXAMPLE.COM/path?utm_medium=email',
          expected: 'https://example.com/path',
        },
        {
          input: 'https://example.com',
          expected: 'https://example.com',
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = UrlNormalizationService.normalizeUrl(input);
        expect(result).toBe(expected);
      });
    });

    it('should throw error for invalid URLs', () => {
      expect(() => {
        UrlNormalizationService.normalizeUrl('not-a-url');
      }).toThrow('Invalid URL format');
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs correctly', () => {
      expect(UrlNormalizationService.isValidUrl('https://example.com')).toBe(true);
      expect(UrlNormalizationService.isValidUrl('http://example.com')).toBe(true);
      expect(UrlNormalizationService.isValidUrl('not-a-url')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('should extract domain correctly', () => {
      expect(UrlNormalizationService.extractDomain('https://www.amazon.com/product')).toBe('amazon.com');
      expect(UrlNormalizationService.extractDomain('https://example.com')).toBe('example.com');
    });
  });
});
