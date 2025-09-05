import { URL } from 'url';
import { ExtractionResult } from '../types';
import { IExtractor } from '../interfaces';
import { LoggerFactory } from '../logger/logger';

export class FallbackExtractor implements IExtractor {
  private readonly logger = LoggerFactory.create('FallbackExtractor');

  async extract(url: string): Promise<ExtractionResult> {
    try {
      this.logger.debug('Starting fallback extraction', { url });
      
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      const result: ExtractionResult = {
        title: `Page from ${hostname}`,
        description: `Content from ${hostname}`,
        siteName: hostname,
        contentType: 'webpage'
      };
      
      this.logger.debug('Fallback extraction completed', { 
        url, 
        fieldsExtracted: Object.keys(result).length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Fallback extraction failed', error as Error, { url });
      throw error;
    }
  }

  canExtract(_url: string): boolean {
    return true; // Fallback can always extract basic info
  }

  getPriority(): number {
    return 3; // Lowest priority - use as last resort
  }
}
