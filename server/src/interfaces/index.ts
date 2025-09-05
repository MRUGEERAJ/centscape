import { ExtractionResult, ExtractionMethod } from '../types';

export interface IExtractor {
  extract(url: string): Promise<ExtractionResult>;
  canExtract(url: string): boolean;
  getPriority(): number;
}

export interface IHttpClient {
  get(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
}

export interface HttpRequestOptions {
  readonly timeout?: number;
  readonly maxRedirects?: number;
  readonly headers?: Record<string, string>;
}

export interface HttpResponse {
  readonly data: string;
  readonly status: number;
  readonly headers: Record<string, string>;
}

export interface IBrowserService {
  takeScreenshot(url: string): Promise<Buffer>;
  close(): Promise<void>;
}

export interface IAIService {
  analyzeImage(imageBuffer: Buffer, prompt: string): Promise<string>;
  isConfigured(): boolean;
}

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export interface IValidator<T> {
  validate(data: T): ValidationResult;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface IExtractionService {
  extract(url: string, options?: ExtractionOptions): Promise<{
    result: ExtractionResult;
    method: ExtractionMethod;
    confidence: number;
  }>;
}

export interface ExtractionOptions {
  readonly forceMethod?: 'http' | 'ai' | 'fallback';
  readonly timeout?: number;
  readonly rawHtml?: string;
}
