import { IHttpClient, IBrowserService, IAIService, IExtractionService, ILogger } from '../interfaces';
import { HttpClient } from './http-client';
import { BrowserService } from './browser-service';
import { AIService } from './ai-service';
import { HttpExtractor } from '../utils/http-extractor';
import { AIExtractor } from './ai-extractor';
import { FallbackExtractor } from './fallback-extractor';
import { ExtractionService } from './extraction-service';
import { LoggerFactory } from '../logger/logger';

export class Container {
  private static instance: Container;
  private readonly services = new Map<string, any>();

  static getInstance(): Container {
    if (!this.instance) {
      this.instance = new Container();
    }
    return this.instance;
  }

  private constructor() {
    this.registerServices();
  }

  private registerServices(): void {
    // Core services
    this.register<IHttpClient>('httpClient', () => new HttpClient());
    this.register<IBrowserService>('browserService', () => new BrowserService());
    this.register<IAIService>('aiService', () => new AIService());
    this.register<ILogger>('logger', () => LoggerFactory.create('App'));

    // Extractors
    this.register<HttpExtractor>('httpExtractor', () => 
      new HttpExtractor(this.get<IHttpClient>('httpClient'))
    );
    
    this.register<AIExtractor>('aiExtractor', () => 
      new AIExtractor(
        this.get<IBrowserService>('browserService'),
        this.get<IAIService>('aiService')
      )
    );
    
    this.register<FallbackExtractor>('fallbackExtractor', () => 
      new FallbackExtractor()
    );

    // Main extraction service
    this.register<IExtractionService>('extractionService', () => 
      new ExtractionService([
        this.get<HttpExtractor>('httpExtractor'),
        this.get<AIExtractor>('aiExtractor'),
        this.get<FallbackExtractor>('fallbackExtractor')
      ])
    );
  }

  private register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }

  get<T>(name: string): T {
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service '${name}' not found`);
    }
    return factory();
  }

  // Convenience methods
  getExtractionService(): IExtractionService {
    return this.get<IExtractionService>('extractionService');
  }

  getLogger(): ILogger {
    return this.get<ILogger>('logger');
  }

  async cleanup(): Promise<void> {
    try {
      const browserService = this.get<IBrowserService>('browserService');
      await browserService.close();
    } catch (error) {
      this.getLogger().error('Cleanup failed', error as Error);
    }
  }
}
