export interface AppConfig {
  readonly server: ServerConfig;
  readonly openai: OpenAIConfig;
  readonly puppeteer: PuppeteerConfig;
  readonly extraction: ExtractionConfig;
  readonly security: SecurityConfig;
}

export interface ServerConfig {
  readonly port: number;
  readonly timeout: number;
  readonly maxRequestSize: string;
}

export interface OpenAIConfig {
  readonly apiKey: string | null;
  readonly model: string;
  readonly maxRetries: number;
}

export interface PuppeteerConfig {
  readonly headless: boolean;
  readonly timeout: number;
  readonly viewport: ViewportConfig;
  readonly args: readonly string[];
}

export interface ViewportConfig {
  readonly width: number;
  readonly height: number;
}

export interface ExtractionConfig {
  readonly httpTimeout: number;
  readonly aiTimeout: number;
  readonly maxRedirects: number;
  readonly userAgents: readonly string[];
}

export interface SecurityConfig {
  readonly blockedPatterns: readonly string[];
  readonly maxHtmlSize: number;
}

export class ConfigManager {
  private static instance: AppConfig;

  static getConfig(): AppConfig {
    if (!this.instance) {
      this.instance = this.createConfig();
    }
    return this.instance;
  }

  private static createConfig(): AppConfig {
    return {
      server: {
        port: parseInt(process.env['PORT'] || '3000', 10),
        timeout: parseInt(process.env['REQUEST_TIMEOUT'] || '20000', 10),
        maxRequestSize: process.env['MAX_REQUEST_SIZE'] || '1mb'
      },
      openai: {
        apiKey: process.env['OPENAI_API_KEY'] || null,
        model: process.env['OPENAI_MODEL'] || 'gpt-4o',
        maxRetries: parseInt(process.env['OPENAI_MAX_RETRIES'] || '3', 10)
      },
      puppeteer: {
        headless: process.env['PUPPETEER_HEADLESS'] !== 'false',
        timeout: parseInt(process.env['PUPPETEER_TIMEOUT'] || '10000', 10),
        viewport: {
          width: parseInt(process.env['PUPPETEER_WIDTH'] || '1200', 10),
          height: parseInt(process.env['PUPPETEER_HEIGHT'] || '800', 10)
        },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security'
        ]
      },
      extraction: {
        httpTimeout: parseInt(process.env['HTTP_TIMEOUT'] || '5000', 10),
        aiTimeout: parseInt(process.env['AI_TIMEOUT'] || '10000', 10),
        maxRedirects: parseInt(process.env['MAX_REDIRECTS'] || '3', 10),
        userAgents: [
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      },
      security: {
        blockedPatterns: [
          'localhost',
          '127.0.0.1',
          '0.0.0.0',
          '10.0.0.0/8',
          '172.16.0.0/12',
          '192.168.0.0/16',
          '169.254.0.0/16',
          '::1',
          'fc00::/7',
          'fe80::/10'
        ],
        maxHtmlSize: parseInt(process.env['MAX_HTML_SIZE'] || '524288', 10) // 512KB
      }
    };
  }

  static isOpenAIConfigured(): boolean {
    return !!this.getConfig().openai.apiKey;
  }

  static getOpenAIConfig(): OpenAIConfig {
    return this.getConfig().openai;
  }

  static getServerConfig(): ServerConfig {
    return this.getConfig().server;
  }

  static getPuppeteerConfig(): PuppeteerConfig {
    return this.getConfig().puppeteer;
  }

  static getExtractionConfig(): ExtractionConfig {
    return this.getConfig().extraction;
  }

  static getSecurityConfig(): SecurityConfig {
    return this.getConfig().security;
  }
}
