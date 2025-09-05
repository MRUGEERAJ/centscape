/**
 * Product API Service - Integrates with Node.js server for real product data
 */

export interface ProductAPIResponse {
  success: boolean;
  data: {
    title: string;
    image: string;
    images: string[];
    price: string;
    currency: string;
    originalPrice?: string;
    discount?: string;
    siteName: string;
    sourceUrl: string;
    description: string;
    category: string;
    brand: string;
    rating: string;
    reviewCount: string;
    availability: string;
    features: string[];
    offers: string[];
    contentType: string;
  };
  metadata: {
    extractionMethod: string;
    confidence: number;
    processingTime: number;
    aiUsed: boolean;
    fieldsExtracted: number;
    url: string;
    timestamp: string;
  };
}

export interface ProductData {
  title: string;
  description: string;
  price: string;
  brand: string;
  category: string;
  imageUrl: string;
  availability: string;
  rating?: string;
  reviews?: string;
  currency?: string;
  originalPrice?: string;
  discount?: string;
  features?: string[];
  offers?: string[];
  sourceDomain: string;
  originalUrl: string;
  normalizedUrl: string;
}

export class ProductAPIService {
  private static readonly API_BASE_URL = 'http://localhost:3000';
  private static readonly API_ENDPOINT = '/api/preview';
  private static readonly TIMEOUT = 20000; // 20 seconds (shorter than server timeout)

  /**
   * Extract product data from URL using the Node.js server
   */
  static async extractProductData(url: string): Promise<ProductData | null> {
    try {
      console.log('🚀 ProductAPI: Starting extraction for:', url);

      // Create a timeout promise for React Native compatibility
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Client timeout after 20 seconds')), this.TIMEOUT);
      });

      const fetchPromise = fetch(`${this.API_BASE_URL}${this.API_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      console.log('📡 ProductAPI: Response status:', response.status);

      if (!response.ok) {
        const errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        console.error('❌ ProductAPI:', errorMessage);
        throw new Error(errorMessage);
      }

      const apiResponse: ProductAPIResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        console.error('❌ ProductAPI: Invalid response structure:', apiResponse);
        throw new Error('API returned unsuccessful response');
      }

      console.log('✅ ProductAPI: Successfully extracted data:', apiResponse.data.title);

      // Transform API response to our format
      const productData: ProductData = {
        title: apiResponse.data.title,
        description: apiResponse.data.description,
        price: apiResponse.data.price && apiResponse.data.currency 
          ? `${apiResponse.data.currency} ${apiResponse.data.price}` 
          : apiResponse.data.price || 'Price not available',
        brand: apiResponse.data.brand,
        category: apiResponse.data.category,
        imageUrl: apiResponse.data.image,
        availability: apiResponse.data.availability,
        rating: apiResponse.data.rating,
        reviews: apiResponse.data.reviewCount,
        currency: apiResponse.data.currency,
        originalPrice: apiResponse.data.originalPrice && apiResponse.data.currency 
          ? `${apiResponse.data.currency} ${apiResponse.data.originalPrice}` 
          : undefined,
        discount: apiResponse.data.discount,
        features: apiResponse.data.features,
        offers: apiResponse.data.offers,
        sourceDomain: this.extractDomain(apiResponse.data.sourceUrl),
        originalUrl: apiResponse.data.sourceUrl,
        normalizedUrl: this.normalizeUrl(apiResponse.data.sourceUrl),
      };

      return productData;

    } catch (error) {
      console.error('❌ ProductAPI: Error extracting product data:', error);
      
      // Provide more specific error information
      if (error instanceof Error) {
        if (error.message.includes('408')) {
          console.log('⏰ Server timeout - your server took too long to respond');
        } else if (error.message.includes('Client timeout')) {
          console.log('⏰ Client timeout - request took longer than 20 seconds');
        } else if (error.message.includes('fetch')) {
          console.log('🌐 Network error - check if server is running on localhost:3000');
        }
      }
      
      // Return null to trigger fallback
      return null;
    }
  }

  /**
   * Extract domain from URL
   */
  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      let domain = urlObj.hostname.toLowerCase();
      
      // Remove www prefix
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }
      
      return domain;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Normalize URL (basic implementation)
   */
  private static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove common UTM parameters
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      utmParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      // Remove fragment
      urlObj.hash = '';
      
      // Ensure https
      urlObj.protocol = 'https';
      
      return urlObj.toString().replace(/\/$/, '');
    } catch {
      return url;
    }
  }

  /**
   * Check if the API server is available
   */
  static async isServerAvailable(): Promise<boolean> {
    try {
      // Create a timeout promise for React Native compatibility
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), 5000);
      });

      const fetchPromise = fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return response.ok;
    } catch {
      return false;
    }
  }
}
