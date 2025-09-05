// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { 
  PreviewRequest, 
  PreviewResponse, 
  ProductData, 
  ExtractionMetadata, 
  ExtractionMethod,
  HealthResponse,
  ApiInfoResponse,
  ErrorResponse
} from './types';
import { Container } from './services/container';
import { ConfigManager } from './config/app-config';
import { PreviewRequestValidator } from './validators';

const app = express();
const container = Container.getInstance();
const logger = container.getLogger();
const config = ConfigManager.getConfig();

// Middleware
app.use(express.json({ limit: config.server.maxRequestSize }));
app.use(express.urlencoded({ extended: true, limit: config.server.maxRequestSize }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const healthResponse: HealthResponse = {
    success: true,
    message: 'Production-Grade AI-Powered URL Extraction Service',
    timestamp: new Date().toISOString(),
    version: '4.0.0',
    uptime: process.uptime(),
    features: {
      openai: ConfigManager.isOpenAIConfigured(),
      puppeteer: true,
      extractionMethods: ['fast_ai', 'http_extraction', 'fallback'],
      capabilities: [
        'Production-grade architecture',
        'Dependency injection',
        'Comprehensive logging',
        'Input validation',
        'Error handling',
        'Type safety'
      ]
    }
  };
  res.json(healthResponse);
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  const apiInfo: ApiInfoResponse = {
    success: true,
    message: 'Production-Grade AI-Powered URL Extraction Service',
    version: '4.0.0',
    endpoints: {
      preview: 'POST /api/preview',
      health: 'GET /api/health'
    },
    features: {
      fastExtraction: 'Optimized AI extraction with smart fallbacks',
      quickResponse: 'Sub-15 second response times',
      smartDetection: 'Automatic content type detection',
      reliableFallback: 'Multiple extraction methods'
    }
  };
  res.json(apiInfo);
});

// Main preview endpoint
app.post('/api/preview', async (req: Request, res: Response): Promise<void> => {
  let responseSent = false;
  
  // Set timeout for the entire request
  const timeout = setTimeout(() => {
    if (!responseSent && !res.headersSent) {
      responseSent = true;
      const errorResponse: ErrorResponse = {
        error: true,
        message: 'Request timeout - processing took too long',
        statusCode: 408
      };
      res.status(408).json(errorResponse);
    }
  }, config.server.timeout);

  try {
    const requestData: PreviewRequest = req.body;

    // Validate input
    const validator = new PreviewRequestValidator();
    const validation = validator.validate(requestData);
    
    if (!validation.isValid) {
      clearTimeout(timeout);
      if (!responseSent && !res.headersSent) {
        responseSent = true;
        const errorResponse: ErrorResponse = {
          error: true,
          message: validation.errors.join(', '),
          statusCode: 400
        };
        res.status(400).json(errorResponse);
      }
      return;
    }

    const { url, raw_html } = requestData;

    // Extract data using the extraction service
    const extractionService = container.getExtractionService();
    const options = raw_html ? { rawHtml: raw_html } : {};
    const { result, method, confidence } = await extractionService.extract(url, options);

    // Build response
    const productData: ProductData = {
      title: result.title || null,
      image: result.image || null,
      images: result.images || [],
      price: result.price || null,
      currency: result.currency || null,
      originalPrice: result.originalPrice || null,
      discount: result.discount || null,
      siteName: result.siteName || null,
      description: result.description || null,
      category: result.category || null,
      brand: result.brand || null,
      rating: result.rating || null,
      reviewCount: result.reviewCount || null,
      availability: result.availability || null,
      features: result.features || null,
      offers: result.offers || null,
      contentType: result.contentType || null,
      sourceUrl: url
    };

    const metadata: ExtractionMetadata = {
      extractionMethod: method,
      confidence,
      processingTime: Date.now(),
      aiUsed: method === ExtractionMethod.FAST_AI,
      fieldsExtracted: Object.keys(result).length,
      url: url,
      timestamp: new Date().toISOString()
    };

    const response: PreviewResponse = {
      success: true,
      data: productData,
      metadata
    };

    // Clear timeout and send response
    clearTimeout(timeout);
    if (!responseSent && !res.headersSent) {
      responseSent = true;
      res.json(response);
    }

  } catch (error) {
    logger.error('Preview extraction error', error as Error, { 
      url: req.body?.url,
      ip: req.ip 
    });
    
    clearTimeout(timeout);
    if (!responseSent && !res.headersSent) {
      responseSent = true;
      const errorResponse: ErrorResponse = {
        error: true,
        message: 'Internal server error',
        statusCode: 500
      };
      res.status(500).json(errorResponse);
    }
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    error: true,
    message: `Route ${req.method} ${req.url} not found`,
    statusCode: 404
  };
  res.status(404).json(errorResponse);
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', err);
  const errorResponse: ErrorResponse = {
    error: true,
    message: 'Internal server error',
    statusCode: 500
  };
  res.status(500).json(errorResponse);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await container.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await container.cleanup();
  process.exit(0);
});

// Start server
app.listen(config.server.port, () => {
  logger.info('Server started', {
    port: config.server.port,
    version: '4.0.0',
    environment: process.env['NODE_ENV'] || 'development',
    openaiConfigured: ConfigManager.isOpenAIConfigured()
  });
  
  console.log(`🚀 Production-Grade AI-Powered URL Extraction Service running on http://localhost:${config.server.port}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/preview - AI extraction`);
  console.log(`   GET  / - API information`);
  console.log(`\n🏗️ Architecture Features:`);
  console.log(`   ✅ Dependency injection`);
  console.log(`   ✅ Production-grade logging`);
  console.log(`   ✅ Input validation`);
  console.log(`   ✅ Error handling`);
  console.log(`   ✅ Type safety`);
  console.log(`   ✅ Clean separation of concerns`);
  console.log(`🎯 OpenAI API Key: ${ConfigManager.isOpenAIConfigured() ? 'Configured ✅' : 'Not configured ❌'}`);
  console.log(`🧠 Production AI is ready!`);
});
