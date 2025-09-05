import { ExtractionResult } from '../types';
import { IExtractor, IBrowserService, IAIService } from '../interfaces';
import { PromptTemplates, PromptRenderer } from '../config/prompt-templates';
import { LoggerFactory } from '../logger/logger';

export class AIExtractor implements IExtractor {
  private readonly logger = LoggerFactory.create('AIExtractor');

  constructor(
    private readonly browserService: IBrowserService,
    private readonly aiService: IAIService
  ) {}

  async extract(url: string): Promise<ExtractionResult> {
    if (!this.aiService.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      this.logger.debug('Starting AI extraction', { url });

      // Take screenshot
      const screenshot = await this.browserService.takeScreenshot(url);
      
      // Prepare prompt
      const prompt = PromptRenderer.render(
        PromptTemplates.PRODUCT_EXTRACTION,
        { url }
      );

      // Analyze with AI
      const aiResponse = await this.aiService.analyzeImage(screenshot, prompt);
      
      // Parse response
      const result = this.parseAIResponse(aiResponse);
      
      this.logger.debug('AI extraction completed', { 
        url, 
        fieldsExtracted: Object.keys(result).length 
      });
      
      return result;

    } catch (error) {
      this.logger.error('AI extraction failed', error as Error, { url });
      throw error;
    }
  }

  canExtract(_url: string): boolean {
    return this.aiService.isConfigured();
  }

  getPriority(): number {
    return 2; // Medium priority - use when HTTP fails
  }

  private parseAIResponse(response: string): ExtractionResult {
    try {
      // Remove markdown code blocks if present
      const cleanContent = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedData = JSON.parse(cleanContent);

      return {
        title: parsedData.title?.trim() || null,
        image: parsedData.image?.trim() || null,
        images: parsedData.images || [],
        price: parsedData.price?.trim() || null,
        currency: parsedData.currency?.trim()?.toUpperCase() || null,
        originalPrice: parsedData.originalPrice?.trim() || null,
        discount: parsedData.discount?.trim() || null,
        siteName: parsedData.siteName?.trim() || null,
        description: parsedData.description?.trim() || null,
        category: parsedData.category?.trim() || null,
        brand: parsedData.brand?.trim() || null,
        rating: parsedData.rating?.trim() || null,
        reviewCount: parsedData.reviewCount?.trim() || null,
        availability: parsedData.availability?.trim() || null,
        features: parsedData.features || null,
        offers: parsedData.offers || null,
        contentType: parsedData.contentType?.trim() || null
      };

    } catch (error) {
      this.logger.error('Failed to parse AI response', error as Error);
      throw new Error('Invalid JSON response from OpenAI');
    }
  }
}
