/**
 * Core interface for OCR providers
 */

import type { ImageInput, AnalyzeOptions, AnalyzeResult, ProviderInfo } from './types.js';

/**
 * Main interface that all OCR providers must implement
 */
export interface OCRProvider {
  /**
   * Analyze an image and extract text
   * @param image - The image to analyze (path, URL, or buffer)
   * @param options - Analysis options
   * @returns Promise with the extracted text and metadata
   */
  analyzeImage(image: ImageInput, options?: AnalyzeOptions): Promise<AnalyzeResult>;
  
  /**
   * Validate the provider configuration
   * @returns Promise<true> if valid, throws error if invalid
   */
  validateConfig(): Promise<boolean>;
  
  /**
   * Get information about the provider
   * @returns Provider metadata
   */
  getProviderInfo(): ProviderInfo;
  
  /**
   * Check if a specific model is available
   * @param model - Model identifier
   * @returns true if model is available
   */
  isModelAvailable(model: string): boolean;
  
  /**
   * Get the default model for this provider
   * @returns Default model identifier
   */
  getDefaultModel(): string;
}

/**
 * Factory function signature for creating OCR providers
 */
export interface OCRProviderFactory {
  /**
   * Create a new instance of the OCR provider
   * @param config - Provider-specific configuration
   * @returns OCR provider instance
   */
  create(config?: Record<string, any>): OCRProvider;
}