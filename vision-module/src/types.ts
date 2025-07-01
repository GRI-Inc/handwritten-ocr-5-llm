/**
 * Vision Module Types
 * 画像分析モジュールで使用する型定義
 */

/**
 * 画像入力の型
 * Base64文字列またはBufferのいずれかを受け入れる
 */
export type ImageInput = string | Buffer;

/**
 * analyzeImage関数のオプション
 */
export interface AnalyzeImageOptions {
  /**
   * 画像分析時の追加指示（オプション）
   * デフォルトは「画像に何が書かれているか教えてください」
   */
  prompt?: string;
  
  /**
   * 使用するモデル（現在はo3のみサポート）
   */
  model?: 'o3';
  
  /**
   * 返却される最大トークン数
   * デフォルトは500
   */
  maxTokens?: number;
  
  /**
   * APIキー（オプション）
   * 指定しない場合は環境変数OPENAI_API_KEYを使用
   */
  apiKey?: string;
}

/**
 * 分析結果の型
 */
export interface AnalyzeImageResult {
  /**
   * 画像に書かれている内容のテキスト
   */
  text: string;
  
  /**
   * 使用したトークン数（デバッグ用）
   */
  tokensUsed?: number;
}

/**
 * Vision APIのエラー情報
 */
export interface VisionApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * カスタムエラークラス
 * Vision APIとの通信でエラーが発生した場合にスローされる
 */
export class VisionServiceError extends Error {
  public code?: string;
  public details?: unknown;
  
  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'VisionServiceError';
    this.code = code;
    this.details = details;
    
    // TypeScriptのError継承時の対策
    Object.setPrototypeOf(this, VisionServiceError.prototype);
  }
}