/**
 * @llm-ocr/o3 - OpenAI o3 OCR Provider
 */

// Main provider export
export { O3Provider, createO3Provider } from './o3-provider.js';

// Legacy exports for backward compatibility
export { analyzeImage } from './vision.js';

// Type exports
export type {
  ImageInput,
  AnalyzeImageOptions,
  AnalyzeImageResult,
  VisionApiError,
} from './types.js';

// Error class exports
export { VisionServiceError } from './types.js';

// Utility function exports
export {
  toBase64,
  isValidBase64Image,
  toDataUri,
  estimateImageSize,
} from './utils.js';