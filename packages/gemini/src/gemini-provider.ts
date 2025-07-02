/**
 * Google Gemini OCR Provider implementation
 */

import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { 
  OCRProvider, 
  ImageInput, 
  AnalyzeOptions, 
  AnalyzeResult, 
  ProviderInfo 
} from '@llm-ocr/core';
import { OCRError } from '@llm-ocr/core';
import { readFileSync } from 'fs';

export class GeminiProvider implements OCRProvider {
  private client: GoogleGenerativeAI;
  private apiKey: string;
  
  constructor(config?: { apiKey?: string }) {
    this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new OCRError(
        'Gemini API key is required. Set GEMINI_API_KEY environment variable or pass apiKey in config.',
        'MISSING_API_KEY'
      );
    }
    this.client = new GoogleGenerativeAI(this.apiKey);
  }
  
  async analyzeImage(image: ImageInput, options?: AnalyzeOptions): Promise<AnalyzeResult> {
    try {
      // Select model
      const modelName = options?.model || 'gemini-1.5-flash';
      const model = this.client.getGenerativeModel({ model: modelName });
      
      // Convert image to base64 if needed
      const imageData = await this.prepareImageData(image);
      
      // Prepare prompt
      const prompt = options?.prompt || 
        'Extract all text from this image. Return only the text content, preserving the original formatting and layout as much as possible.';
      
      // Create content parts
      const imagePart: Part = {
        inlineData: {
          data: imageData.base64,
          mimeType: imageData.mimeType
        }
      };
      
      // Generate content
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();
      
      // Get usage metadata if available
      const usage = response.usageMetadata;
      
      return {
        text,
        tokensUsed: usage?.totalTokenCount,
        usage: usage ? {
          promptTokens: usage.promptTokenCount,
          completionTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount
        } : undefined,
        rawResponse: response
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new OCRError(
          `Gemini API error: ${error.message}`,
          'API_ERROR',
          undefined,
          error
        );
      }
      throw error;
    }
  }
  
  async validateConfig(): Promise<boolean> {
    if (!this.apiKey) {
      throw new OCRError(
        'Gemini API key is required',
        'MISSING_API_KEY'
      );
    }
    
    // Test API key by making a simple request
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      await model.generateContent('Test');
      return true;
    } catch (error) {
      throw new OCRError(
        'Invalid Gemini API key',
        'INVALID_API_KEY',
        undefined,
        error
      );
    }
  }
  
  getProviderInfo(): ProviderInfo {
    return {
      name: 'Google Gemini',
      version: '1.0.0',
      models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
      maxFileSize: 20 * 1024 * 1024, // 20MB for inline data
      supportedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp']
    };
  }
  
  isModelAvailable(model: string): boolean {
    const availableModels = ['gemini-1.5-flash', 'gemini-1.5-pro'];
    return availableModels.includes(model);
  }
  
  getDefaultModel(): string {
    return 'gemini-1.5-flash';
  }
  
  /**
   * Prepare image data for Gemini API
   */
  private async prepareImageData(image: ImageInput): Promise<{ base64: string; mimeType: string }> {
    let base64: string;
    let mimeType: string = 'image/png'; // default
    
    if (typeof image === 'string') {
      // File path or URL
      if (image.startsWith('http://') || image.startsWith('https://')) {
        // URL - fetch the image
        const response = await fetch(image);
        if (!response.ok) {
          throw new OCRError(
            `Failed to fetch image from URL: ${response.statusText}`,
            'FETCH_ERROR',
            response.status
          );
        }
        const buffer = await response.arrayBuffer();
        base64 = Buffer.from(buffer).toString('base64');
        
        // Try to get mime type from response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          mimeType = contentType;
        }
      } else {
        // File path
        const buffer = readFileSync(image);
        base64 = buffer.toString('base64');
        
        // Guess mime type from extension
        const ext = image.split('.').pop()?.toLowerCase();
        if (ext) {
          const mimeTypes: Record<string, string> = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp'
          };
          mimeType = mimeTypes[ext] || 'image/png';
        }
      }
    } else {
      // Buffer
      base64 = image.toString('base64');
    }
    
    return { base64, mimeType };
  }
}

/**
 * Factory function to create GeminiProvider instances
 */
export function createGeminiProvider(config?: { apiKey?: string }): OCRProvider {
  return new GeminiProvider(config);
}