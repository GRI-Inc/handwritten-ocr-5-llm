/**
 * Vision Module 使用例
 * 画像ファイルを分析してテキストを抽出する
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { analyzeImage, VisionServiceError } from '../src/index.ts';

// 環境変数の読み込み（必要に応じて）
import dotenv from 'dotenv';
dotenv.config();

/**
 * 画像ファイルを分析する例
 */
async function analyzeImageFile(imagePath: string): Promise<void> {
  console.log(`\n📸 画像を分析中: ${imagePath}\n`);
  
  try {
    // 画像ファイルを読み込む
    const imageBuffer = readFileSync(imagePath);
    
    // 画像を分析（シンプルな使い方）
    const result = await analyzeImage(imageBuffer);
    
    console.log('📝 分析結果:');
    console.log('-'.repeat(60));
    console.log(result.text);
    console.log('-'.repeat(60));
    
    if (result.tokensUsed) {
      console.log(`\n💡 使用トークン数: ${result.tokensUsed}`);
    }
  } catch (error) {
    if (error instanceof VisionServiceError) {
      console.error('❌ エラーが発生しました:', error.message);
      if (error.code) {
        console.error('   エラーコード:', error.code);
      }
      if (error.details) {
        console.error('   詳細:', error.details);
      }
    } else {
      console.error('❌ 予期しないエラー:', error);
    }
  }
}

/**
 * カスタムプロンプトを使用する例
 */
async function analyzeWithCustomPrompt(imagePath: string): Promise<void> {
  console.log(`\n🔍 カスタムプロンプトで分析: ${imagePath}\n`);
  
  try {
    const imageBuffer = readFileSync(imagePath);
    
    // カスタムプロンプトで分析
    const result = await analyzeImage(imageBuffer, {
      prompt: '画像内の手書き文字だけを読み取って、箇条書きで教えてください。',
      maxTokens: 300,
    });
    
    console.log('📝 手書き文字の内容:');
    console.log('-'.repeat(60));
    console.log(result.text);
    console.log('-'.repeat(60));
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

/**
 * Base64文字列で使用する例
 */
async function analyzeBase64Image(): Promise<void> {
  console.log('\n🖼️  Base64画像の分析例\n');
  
  // サンプルのBase64画像（実際の使用時は適切な画像データに置き換えてください）
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  try {
    const result = await analyzeImage(base64Image, {
      prompt: 'この画像の色を教えてください。',
    });
    
    console.log('📝 結果:', result.text);
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  console.log('🚀 Vision Module サンプル実行\n');
  
  // APIキーの確認
  if (!process.env.OPENAI_API_KEY) {
    console.error('⚠️  環境変数 OPENAI_API_KEY が設定されていません。');
    console.error('   .envファイルを作成するか、環境変数を設定してください。');
    process.exit(1);
  }
  
  // サンプル画像のパス（実際の画像ファイルに置き換えてください）
  const sampleImagePath = resolve('../samples/石黒メモ.pdf');
  
  // 各種の使用例を実行
  // 注意: PDFファイルは直接読み込めないため、実際の使用時はPNGやJPEGなどの画像ファイルを使用してください
  
  // Base64画像の分析例
  await analyzeBase64Image();
  
  console.log('\n✅ サンプル実行完了\n');
}

// 実行
main().catch(console.error);