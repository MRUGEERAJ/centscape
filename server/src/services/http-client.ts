import axios, { AxiosResponse } from 'axios';
import { IHttpClient, HttpRequestOptions, HttpResponse } from '../interfaces';
import { ConfigManager } from '../config/app-config';
import { LoggerFactory } from '../logger/logger';

export class HttpClient implements IHttpClient {
  private readonly logger = LoggerFactory.create('HttpClient');
  private readonly config = ConfigManager.getExtractionConfig();

  async get(url: string, options: HttpRequestOptions = {}): Promise<HttpResponse> {
    const timeout = options.timeout || this.config.httpTimeout;
    const maxRedirects = options.maxRedirects || this.config.maxRedirects;
    
    const headers = {
      'User-Agent': this.config.userAgents[0],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...options.headers
    };

    try {
      this.logger.debug('Making HTTP request', { url, timeout, maxRedirects });

      const response: AxiosResponse<string> = await axios.get(url, {
        headers,
        timeout,
        maxRedirects,
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });

      this.logger.debug('HTTP request completed', { 
        url, 
        status: response.status,
        contentLength: response.data.length 
      });

      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>
      };

    } catch (error) {
      this.logger.error('HTTP request failed', error as Error, { url, timeout });
      throw new Error(`HTTP request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
