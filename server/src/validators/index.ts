import { URL } from 'url';
import { IValidator, ValidationResult } from '../interfaces';
import { PreviewRequest } from '../types';
import { ConfigManager } from '../config/app-config';

export class URLValidator implements IValidator<string> {
  validate(url: string): ValidationResult {
    const errors: string[] = [];

    if (!url || typeof url !== 'string') {
      errors.push('URL is required and must be a string');
      return { isValid: false, errors };
    }

    if (url.trim().length === 0) {
      errors.push('URL cannot be empty');
      return { isValid: false, errors };
    }

    try {
      const urlObj = new URL(url);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }

      if (!urlObj.hostname) {
        errors.push('URL must have a valid hostname');
      }

      // Check for blocked patterns
      const blockedPatterns = ConfigManager.getSecurityConfig().blockedPatterns;
      const hostname = urlObj.hostname.toLowerCase();
      
      for (const pattern of blockedPatterns) {
        if (hostname.includes(pattern)) {
          errors.push('Access to private/loopback IP addresses is not allowed');
          break;
        }
      }

    } catch (error) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export class PreviewRequestValidator implements IValidator<PreviewRequest> {
  private readonly urlValidator = new URLValidator();

  validate(request: PreviewRequest): ValidationResult {
    const errors: string[] = [];

    if (!request) {
      errors.push('Request body is required');
      return { isValid: false, errors };
    }

    // Validate URL
    const urlValidation = this.urlValidator.validate(request.url);
    if (!urlValidation.isValid) {
      errors.push(...urlValidation.errors);
    }

    // Validate raw_html if provided
    if (request.raw_html !== undefined) {
      if (typeof request.raw_html !== 'string') {
        errors.push('raw_html must be a string');
      } else {
        const maxSize = ConfigManager.getSecurityConfig().maxHtmlSize;
        if (request.raw_html.length > maxSize) {
          errors.push(`raw_html exceeds maximum size of ${maxSize} bytes`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
