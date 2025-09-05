import { ILogger } from '../interfaces';

export class Logger implements ILogger {
  private readonly context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('INFO', message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    const errorMeta = error ? { 
      error: error.message, 
      stack: error.stack,
      ...meta 
    } : meta;
    this.log('ERROR', message, errorMeta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('WARN', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env['NODE_ENV'] === 'development') {
      this.log('DEBUG', message, meta);
    }
  }

  private log(level: string, message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...meta
    };

    console.log(JSON.stringify(logEntry));
  }
}

export class LoggerFactory {
  static create(context: string): ILogger {
    return new Logger(context);
  }
}
