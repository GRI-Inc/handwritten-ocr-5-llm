/**
 * OpenAI o3 OCR Provider implementation
 */

import type { 
  OCRProvider, 
  ImageInput, 
  AnalyzeOptions, 
  AnalyzeResult, 
  ProviderInfo 
} from '@llm-ocr/core';
import { analyzeImage as analyzeImageCore } from './vision.js';
import type { AnalyzeImageOptions } from './types.js';

export class O3Provider implements OCRProvider {
  private apiKey?: string;
  
  constructor(config?: { apiKey?: string }) {
    this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
  }
  
  async analyzeImage(image: ImageInput, options?: AnalyzeOptions): Promise<AnalyzeResult> {
    // Convert core options to o3-specific options
    const o3Options: AnalyzeImageOptions = {
      prompt: options?.prompt,
      model: 'o3', // Always use o3 model
      maxTokens: options?.maxTokens || 10000, // o3 needs more tokens
      apiKey: options?.apiKey || this.apiKey
    };
    
    // Call the existing implementation
    const result = await analyzeImageCore(image, o3Options);
    
    // Convert to core result format
    return {
      text: result.text,
      tokensUsed: result.tokensUsed,
      rawResponse: result
    };
  }
  
  async validateConfig(): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey in config.');
    }
    
    // TODO: Optionally make a test API call to validate the key
    return true;
  }
  
  getProviderInfo(): ProviderInfo {
    return {
      name: 'OpenAI o3',
      version: '1.0.0',
      models: ['o3'],
      maxFileSize: 20 * 1024 * 1024, // 20MB
      supportedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp']
    };
  }
  
  isModelAvailable(model: string): boolean {
    return model === 'o3';
  }
  
  getDefaultModel(): string {
    return 'o3';
  }
}

/**
 * Factory function to create O3Provider instances
 */
export function createO3Provider(config?: { apiKey?: string }): OCRProvider {
  return new O3Provider(config);
}