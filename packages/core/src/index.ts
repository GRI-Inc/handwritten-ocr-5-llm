/**
 * @llm-ocr/core - Core interfaces and types for LLM OCR providers
 */

// Export all types
export type {
  ImageInput,
  AnalyzeOptions,
  AnalyzeResult,
  ProviderInfo
} from './types.js';

// Export error class
export { OCRError } from './types.js';

// Export interfaces
export type {
  OCRProvider,
  OCRProviderFactory
} from './interfaces.js';