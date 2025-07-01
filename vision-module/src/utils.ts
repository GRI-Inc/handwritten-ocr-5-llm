/**
 * Vision Module Utilities
 * 画像処理などの補助的な機能を提供
 */

import { type ImageInput } from './types.ts';

/**
 * 画像データをBase64文字列に変換する
 * @param image - 変換する画像データ（BufferまたはBase64文字列）
 * @returns Base64エンコードされた文字列
 */
export function toBase64(image: ImageInput): string {
  if (typeof image === 'string') {
    // すでにBase64文字列の場合はそのまま返す
    // データURIプレフィックスを除去
    return image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  }
  
  // Bufferの場合はBase64に変換
  return image.toString('base64');
}

/**
 * Base64文字列が有効な画像データかどうかを検証する
 * @param base64 - 検証するBase64文字列
 * @returns 有効な場合はtrue
 */
export function isValidBase64Image(base64: string): boolean {
  try {
    // Base64文字列の基本的な検証
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    
    if (!base64Regex.test(cleanBase64)) {
      return false;
    }
    
    // デコードしてサイズを確認（最小限のサイズチェック）
    const buffer = Buffer.from(cleanBase64, 'base64');
    return buffer.length > 0;
  } catch {
    return false;
  }
}

/**
 * データURIスキームを追加する
 * @param base64 - Base64エンコードされた画像データ
 * @param mimeType - MIMEタイプ（デフォルト: image/png）
 * @returns データURIスキーム付きの文字列
 */
export function toDataUri(base64: string, mimeType: string = 'image/png'): string {
  const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  return `data:${mimeType};base64,${cleanBase64}`;
}

/**
 * 画像サイズを推定する（デバッグ用）
 * @param base64 - Base64エンコードされた画像データ
 * @returns バイト数
 */
export function estimateImageSize(base64: string): number {
  const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  const padding = (cleanBase64.match(/=/g) || []).length;
  return Math.floor((cleanBase64.length * 3) / 4) - padding;
}