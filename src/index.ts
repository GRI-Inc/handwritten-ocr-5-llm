/**
 * Handwritten Text Analyzer
 * Main entry point for the module
 */

export { initializeDirectories, processImages } from './handwritten-analyzer.ts';
export { analyzeImage } from '../vision-module/src/index.js';
export type { ImageInput, AnalyzeImageOptions, AnalyzeImageResult } from '../vision-module/src/types.js';