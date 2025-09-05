import OpenAI from 'openai';
import { IAIService } from '../interfaces';
import { ConfigManager } from '../config/app-config';
import { LoggerFactory } from '../logger/logger';

export class AIService implements IAIService {
  private readonly logger = LoggerFactory.create('AIService');
  private readonly config = ConfigManager.getOpenAIConfig();
  private readonly openai: OpenAI | null = null;

  constructor() {
    if (this.config.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey
      });
      this.logger.debug('OpenAI client initialized');
    } else {
      this.logger.warn('OpenAI API key not configured');
    }
  }

  async analyzeImage(imageBuffer: Buffer, prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      this.logger.debug('Analyzing image with AI', { 
        imageSize: imageBuffer.length,
        promptLength: prompt.length 
      });

      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
                  detail: "low"
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      this.logger.debug('AI analysis completed', { 
        responseLength: content.length 
      });

      return content;

    } catch (error) {
      this.logger.error('AI analysis failed', error as Error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}
