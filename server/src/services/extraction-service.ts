import { ExtractionResult, ExtractionMethod } from '../types';
import { IExtractionService, IExtractor, ExtractionOptions } from '../interfaces';
import { LoggerFactory } from '../logger/logger';

export class ExtractionService implements IExtractionService {
  private readonly logger = LoggerFactory.create('ExtractionService');

  constructor(private readonly extractors: readonly IExtractor[]) {}

  async extract(url: string, options: ExtractionOptions = {}): Promise<{
    result: ExtractionResult;
    method: ExtractionMethod;
    confidence: number;
  }> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Starting extraction', { url, options });

      // Sort extractors by priority
      const sortedExtractors = [...this.extractors].sort((a, b) => a.getPriority() - b.getPriority());
      
      let lastError: Error | null = null;

      for (const extractor of sortedExtractors) {
        // Skip extractors that can't handle this URL
        if (!extractor.canExtract(url)) {
          this.logger.debug('Skipping extractor', { 
            extractor: extractor.constructor.name, 
            reason: 'Cannot extract URL' 
          });
          continue;
        }

        // Force specific method if requested
        if (options.forceMethod) {
          const methodName = extractor.constructor.name.toLowerCase();
          if (!methodName.includes(options.forceMethod)) {
            continue;
          }
        }

        try {
          this.logger.debug('Trying extractor', { 
            extractor: extractor.constructor.name 
          });

          const result = await extractor.extract(url);
          
          // Check if we got meaningful data
          if (this.hasGoodData(result)) {
            const method = this.getExtractionMethod(extractor);
            const confidence = this.calculateConfidence(result, method);
            
            this.logger.info('Extraction successful', {
              url,
              method,
              confidence,
              fieldsExtracted: Object.keys(result).length,
              processingTime: Date.now() - startTime
            });

            return { result, method, confidence };
          } else {
            this.logger.debug('Extractor returned poor data', { 
              extractor: extractor.constructor.name 
            });
          }

        } catch (error) {
          lastError = error as Error;
          this.logger.debug('Extractor failed', { 
            extractor: extractor.constructor.name,
            error: lastError.message 
          });
        }
      }

      // If all extractors failed, throw the last error
      if (lastError) {
        throw lastError;
      }

      throw new Error('No extractors available');

    } catch (error) {
      this.logger.error('Extraction failed', error as Error, { url });
      throw error;
    }
  }

  private hasGoodData(result: ExtractionResult): boolean {
    return !!(result.title && 
              result.title.length > 20 && 
              !result.title.toLowerCase().includes('online shopping') &&
              !result.title.toLowerCase().includes('welcome to') &&
              !result.title.toLowerCase().includes('home page'));
  }

  private getExtractionMethod(extractor: IExtractor): ExtractionMethod {
    const className = extractor.constructor.name.toLowerCase();
    
    if (className.includes('http')) {
      return ExtractionMethod.HTTP_EXTRACTION;
    } else if (className.includes('ai')) {
      return ExtractionMethod.FAST_AI;
    } else {
      return ExtractionMethod.FALLBACK;
    }
  }

  private calculateConfidence(result: ExtractionResult, method: ExtractionMethod): number {
    let confidence = 0.5; // Base confidence

    // Method-based confidence
    switch (method) {
      case ExtractionMethod.FAST_AI:
        confidence = 0.9;
        break;
      case ExtractionMethod.HTTP_EXTRACTION:
        confidence = 0.8;
        break;
      case ExtractionMethod.FALLBACK:
        confidence = 0.5;
        break;
    }

    // Data quality adjustments
    const fieldsCount = Object.keys(result).filter(key => result[key as keyof ExtractionResult] !== null).length;
    const qualityBonus = Math.min(fieldsCount * 0.05, 0.1);
    
    return Math.min(confidence + qualityBonus, 1.0);
  }
}
