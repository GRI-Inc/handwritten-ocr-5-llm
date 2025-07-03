/**
 * Core types for LLM OCR providers
 */

/**
 * Input image data - can be a file path, URL, or raw buffer
 */
export type ImageInput = string | Buffer;

/**
 * Common options for analyzing images
 */
export interface AnalyzeOptions {
  /**
   * Custom prompt to guide the OCR extraction
   */
  prompt?: string;
  
  /**
   * Model-specific identifier (e.g., 'o3', 'gemini-2.5-flash')
   */
  model?: string;
  
  /**
   * Maximum tokens for the response
   */
  maxTokens?: number;
  
  /**
   * API key override (if not using environment variable)
   */
  apiKey?: string;
  
  /**
   * Additional provider-specific options
   */
  providerOptions?: Record<string, any>;
}

/**
 * Result from OCR analysis
 */
export interface AnalyzeResult {
  /**
   * Extracted text from the image
   */
  text: string;
  
  /**
   * Confidence score (0-1) if available
   */
  confidence?: number;
  
  /**
   * Number of tokens used in the request/response
   */
  tokensUsed?: number;
  
  /**
   * Token usage breakdown if available
   */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    reasoningTokens?: number;
  };
  
  /**
   * Raw response from the provider for debugging
   */
  rawResponse?: any;
}

/**
 * Information about the OCR provider
 */
export interface ProviderInfo {
  /**
   * Provider name (e.g., 'OpenAI o3', 'Google Gemini')
   */
  name: string;
  
  /**
   * Provider version
   */
  version: string;
  
  /**
   * Available models
   */
  models: string[];
  
  /**
   * Maximum file size supported (in bytes)
   */
  maxFileSize?: number;
  
  /**
   * Supported image formats
   */
  supportedFormats: string[];
}

/**
 * Common error class for OCR providers
 */
export class OCRError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'OCRError';
  }
}