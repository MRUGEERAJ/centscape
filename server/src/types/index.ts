export interface PreviewRequest {
  url: string;
  raw_html?: string;
}

export interface PreviewResponse {
  success: boolean;
  data: ProductData;
  metadata: ExtractionMetadata;
}

export interface ProductData {
  title: string | null;
  image: string | null;
  images: string[];
  price: string | null;
  currency: string | null;
  originalPrice: string | null;
  discount: string | null;
  siteName: string | null;
  description: string | null;
  category: string | null;
  brand: string | null;
  rating: string | null;
  reviewCount: string | null;
  availability: string | null;
  features: string[] | null;
  offers: string[] | null;
  contentType: string | null;
  sourceUrl: string;
}

export interface ExtractionMetadata {
  extractionMethod: ExtractionMethod;
  confidence: number;
  processingTime: number;
  aiUsed: boolean;
  fieldsExtracted: number;
  url: string;
  timestamp: string;
}

export enum ExtractionMethod {
  HTTP_EXTRACTION = 'http_extraction',
  FAST_AI = 'fast_ai',
  FALLBACK = 'fallback'
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
  uptime: number;
  features: {
    openai: boolean;
    puppeteer: boolean;
    extractionMethods: string[];
    capabilities: string[];
  };
}

export interface ApiInfoResponse {
  success: boolean;
  message: string;
  version: string;
  endpoints: {
    preview: string;
    health: string;
  };
  features: {
    fastExtraction: string;
    quickResponse: string;
    smartDetection: string;
    reliableFallback: string;
  };
}

export interface ErrorResponse {
  error: boolean;
  message: string;
  statusCode: number;
}

export interface PricePattern {
  pattern: RegExp;
  currency: string;
}

export interface ExtractionResult {
  title?: string | null;
  image?: string | null;
  images?: string[];
  price?: string | null;
  currency?: string | null;
  originalPrice?: string | null;
  discount?: string | null;
  siteName?: string | null;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  rating?: string | null;
  reviewCount?: string | null;
  availability?: string | null;
  features?: string[] | null;
  offers?: string[] | null;
  contentType?: string | null;
}
