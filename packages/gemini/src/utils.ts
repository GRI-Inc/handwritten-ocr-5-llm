/**
 * Utility functions for Gemini provider
 */

import { readFileSync } from 'fs';
import { OCRError } from '@llm-ocr/core';

/**
 * Supported image formats and their MIME types
 */
export const SUPPORTED_FORMATS: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp'
};

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext && SUPPORTED_FORMATS[ext] ? SUPPORTED_FORMATS[ext] : 'image/png';
}

/**
 * Check if file extension is supported
 */
export function isSupportedFormat(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? ext in SUPPORTED_FORMATS : false;
}

/**
 * Load Google Application Credentials from file
 */
export function loadServiceAccountKey(path?: string): any {
  const keyPath = path || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!keyPath) {
    throw new OCRError(
      'Service account key path not provided',
      'MISSING_CREDENTIALS'
    );
  }
  
  try {
    const keyContent = readFileSync(keyPath, 'utf-8');
    return JSON.parse(keyContent);
  } catch (error) {
    throw new OCRError(
      `Failed to load service account key: ${error}`,
      'INVALID_CREDENTIALS',
      undefined,
      error
    );
  }
}

/**
 * Estimate token count for an image (rough approximation)
 * Gemini counts approximately 258 tokens per 512x512 tile
 */
export function estimateImageTokens(imageSize: number): number {
  // Rough estimate based on file size
  // This is very approximate and should be refined based on actual usage
  const estimatedPixels = imageSize * 2; // Rough estimate
  const tilesCount = Math.ceil(estimatedPixels / (512 * 512));
  return tilesCount * 258;
}