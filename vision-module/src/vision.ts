/**
 * Vision Module Core
 * OpenAI Vision APIを使用して画像を分析する
 */

import OpenAI from 'openai';
import { 
  type ImageInput, 
  type AnalyzeImageOptions, 
  type AnalyzeImageResult,
  VisionServiceError 
} from './types.ts';
import { toBase64, isValidBase64Image, toDataUri } from './utils.ts';

// デフォルトのプロンプト
const DEFAULT_PROMPT = 'この画像に何が書かれているか、詳しく教えてください。手書きの文字がある場合は、その内容を正確に読み取ってください。';

/**
 * 画像を分析し、内容をテキストで説明する
 * 
 * @param image - 分析する画像データ（Base64文字列またはBuffer）
 * @param options - 分析オプション
 * @returns 画像の内容説明
 * @throws {VisionServiceError} API呼び出しエラーや無効な入力の場合
 * 
 * @example
 * ```typescript
 * // Base64文字列で使用
 * const result = await analyzeImage(base64String);
 * console.log(result.text);
 * 
 * // Bufferで使用
 * const buffer = fs.readFileSync('image.png');
 * const result = await analyzeImage(buffer, {
 *   prompt: '手書きの数字を読み取ってください'
 * });
 * ```
 */
export async function analyzeImage(
  image: ImageInput,
  options?: AnalyzeImageOptions
): Promise<AnalyzeImageResult> {
  // オプションのデフォルト値を設定
  const {
    prompt = DEFAULT_PROMPT,
    model = 'o3',
    maxTokens = 2000, // o3モデルは推論に多くのトークンを使うため増加
    apiKey = process.env.OPENAI_API_KEY
  } = options || {};

  // APIキーの検証
  if (!apiKey) {
    throw new VisionServiceError(
      'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey option.',
      'MISSING_API_KEY'
    );
  }

  // 画像データをBase64に変換
  let base64Image: string;
  try {
    base64Image = toBase64(image);
  } catch (error) {
    throw new VisionServiceError(
      'Failed to convert image to Base64',
      'INVALID_IMAGE_FORMAT',
      error
    );
  }

  // Base64画像データの検証
  if (!isValidBase64Image(base64Image)) {
    throw new VisionServiceError(
      'Invalid Base64 image data',
      'INVALID_BASE64'
    );
  }

  // OpenAIクライアントの初期化
  const openai = new OpenAI({ apiKey });

  try {
    // Vision APIを呼び出し
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: toDataUri(base64Image),
                detail: 'high', // 高解像度で分析
              },
            },
          ],
        },
      ],
      max_completion_tokens: maxTokens, // o3モデルはmax_completion_tokensを使用
      temperature: 1.0, // o3モデルはデフォルト値のみサポート
    });

    // レスポンスの検証
    const content = response.choices[0]?.message?.content;
    if (!content) {
      // o3モデルは推論トークンを多く使うため、max_completion_tokensが不足している可能性
      const reasoningTokens = response.usage?.completion_tokens_details?.reasoning_tokens;
      if (reasoningTokens && reasoningTokens >= maxTokens) {
        throw new VisionServiceError(
          `Content truncated: reasoning used ${reasoningTokens} tokens. Increase maxTokens option.`,
          'CONTENT_TRUNCATED',
          response
        );
      }
      throw new VisionServiceError(
        'No content in API response',
        'EMPTY_RESPONSE',
        response
      );
    }

    // 結果を返す
    return {
      text: content,
      tokensUsed: response.usage?.total_tokens,
    };
  } catch (error) {
    // OpenAIのエラーをラップ
    if (error instanceof OpenAI.APIError) {
      throw new VisionServiceError(
        `OpenAI API error: ${error.message}`,
        error.code || 'API_ERROR',
        {
          status: error.status,
          headers: error.headers,
          error: error.error,
        }
      );
    }
    
    // その他のエラー
    if (error instanceof VisionServiceError) {
      throw error;
    }
    
    throw new VisionServiceError(
      'Unexpected error during image analysis',
      'UNKNOWN_ERROR',
      error
    );
  }
}