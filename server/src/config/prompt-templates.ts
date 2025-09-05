export interface PromptTemplate {
  readonly systemMessage: string;
  readonly userMessage: string;
  readonly maxTokens: number;
  readonly temperature: number;
}

export interface ExtractionPromptTemplate extends PromptTemplate {
  readonly imageDetail: 'low' | 'high';
  readonly timeout: number;
}

export class PromptTemplates {
  static readonly PRODUCT_EXTRACTION: ExtractionPromptTemplate = {
    systemMessage: `You are an expert e-commerce data extraction AI. Your task is to analyze product pages and extract structured information with high accuracy.`,
    
    userMessage: `Analyze this webpage screenshot and extract product information. Return ONLY valid JSON in this exact format:

{
  "title": "Product title",
  "image": "Primary product image URL",
  "images": ["Array of all product image URLs"],
  "price": "Current price number only (e.g., 210, 3999)",
  "currency": "Currency code (INR, USD, EUR, GBP)",
  "originalPrice": "Original price if discounted",
  "discount": "Discount percentage or amount",
  "siteName": "Website/brand name",
  "description": "Product description",
  "category": "Product category",
  "brand": "Brand name",
  "rating": "Average rating number",
  "reviewCount": "Number of reviews",
  "availability": "Stock status",
  "features": ["Key product features"],
  "offers": ["Available offers"],
  "contentType": "Content type"
}

CRITICAL EXTRACTION RULES:
1. PRICE EXTRACTION: Look for prices in INR (Rs., ₹), USD ($), EUR (€), GBP (£)
2. Extract ONLY the number (e.g., "Rs. 210" → price: "210", currency: "INR")
3. Look for original prices and discounts
4. Check price displays, product cards, and descriptions
5. IMAGE EXTRACTION: Extract complete, functional image URLs
6. Look in galleries, thumbnails, and product images
7. Avoid placeholder or broken image URLs

Extract only visible information. Use null for missing data. Be accurate and fast.

URL: {{url}}`,

    maxTokens: 1000,
    temperature: 0.1,
    imageDetail: 'low',
    timeout: 10000
  };

  static readonly CONTENT_EXTRACTION: ExtractionPromptTemplate = {
    systemMessage: `You are an expert content analysis AI. Extract comprehensive information from web pages.`,
    
    userMessage: `Analyze this webpage and extract all relevant information. Return ONLY valid JSON:

{
  "title": "Page title",
  "image": "Primary image URL",
  "images": ["Image URLs"],
  "description": "Content description",
  "siteName": "Website name",
  "contentType": "Content type",
  "category": "Content category",
  "brand": "Brand if applicable"
}

Extract visible information only. Use null for missing data.

URL: {{url}}`,

    maxTokens: 800,
    temperature: 0.1,
    imageDetail: 'low',
    timeout: 8000
  };

  static readonly FALLBACK_EXTRACTION: ExtractionPromptTemplate = {
    systemMessage: `You are a basic content extraction AI. Extract minimal information from web pages.`,
    
    userMessage: `Extract basic information from this webpage. Return ONLY valid JSON:

{
  "title": "Page title",
  "description": "Basic description",
  "siteName": "Website name",
  "contentType": "webpage"
}

URL: {{url}}`,

    maxTokens: 500,
    temperature: 0.1,
    imageDetail: 'low',
    timeout: 5000
  };
}

export class PromptRenderer {
  static render(template: PromptTemplate, variables: Record<string, string>): string {
    let message = template.userMessage;
    
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return message;
  }
}
