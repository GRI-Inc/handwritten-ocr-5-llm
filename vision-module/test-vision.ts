/**
 * Vision Module 動作テスト
 * 実際の画像を使ってモジュールの動作を確認
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { analyzeImage, VisionServiceError } from './src/index.ts';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config({ path: resolve('../.env') });

/**
 * テスト実行
 */
async function testVisionModule() {
  console.log('🧪 Vision Module テスト開始\n');
  
  // APIキーの確認
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY が設定されていません');
    process.exit(1);
  }
  
  // テスト画像のパス
  const testImagePath = '/home/oomae/download.png';
  const outputDir = './test-results';
  
  try {
    console.log(`📸 テスト画像: ${testImagePath}`);
    console.log('⏳ 画像を分析中...\n');
    
    // 画像を読み込む
    const imageBuffer = readFileSync(testImagePath);
    console.log(`📊 画像サイズ: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    
    // タイムスタンプ付きファイル名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 画像をテスト結果フォルダにコピー
    const imageCopyPath = `${outputDir}/test-image-${timestamp}.png`;
    writeFileSync(imageCopyPath, imageBuffer);
    console.log(`💾 画像をコピー: ${imageCopyPath}`);
    
    // 画像を分析（o3モデル用に大きなトークン数を設定）
    const startTime = Date.now();
    const result = await analyzeImage(imageBuffer, {
      maxTokens: 10000 // o3モデルは推論に多くのトークンを使うため
    });
    const elapsedTime = Date.now() - startTime;
    
    console.log('\n✅ 分析完了！');
    console.log(`⏱️  処理時間: ${(elapsedTime / 1000).toFixed(2)}秒`);
    if (result.tokensUsed) {
      console.log(`💰 使用トークン: ${result.tokensUsed}`);
    }
    
    // 結果をコンソールに表示
    console.log('\n📝 分析結果:');
    console.log('='.repeat(80));
    console.log(result.text);
    console.log('='.repeat(80));
    
    // 結果をファイルに保存
    const resultPath = `${outputDir}/result-${timestamp}.txt`;
    const resultData = {
      timestamp: new Date().toISOString(),
      imagePath: testImagePath,
      imageSize: `${(imageBuffer.length / 1024).toFixed(2)} KB`,
      processingTime: `${(elapsedTime / 1000).toFixed(2)}秒`,
      tokensUsed: result.tokensUsed || 'N/A',
      analysisResult: result.text
    };
    
    writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
    console.log(`\n💾 結果を保存: ${resultPath}`);
    
    // カスタムプロンプトでも試す
    console.log('\n🔍 カスタムプロンプトで再分析...');
    const customResult = await analyzeImage(imageBuffer, {
      prompt: '建築図面の手書きメモやコメントがあれば、その内容を詳しく教えてください。特に青色のペンで書かれた文字に注目してください。',
      maxTokens: 10000
    });
    
    console.log('\n📝 カスタムプロンプトの結果:');
    console.log('-'.repeat(80));
    console.log(customResult.text);
    console.log('-'.repeat(80));
    
    // カスタムプロンプトの結果も保存
    const customResultPath = `${outputDir}/result-custom-${timestamp}.txt`;
    const customResultData = {
      ...resultData,
      prompt: '建築図面の手書きメモやコメントを詳しく抽出',
      analysisResult: customResult.text,
      tokensUsed: customResult.tokensUsed || 'N/A'
    };
    
    writeFileSync(customResultPath, JSON.stringify(customResultData, null, 2));
    console.log(`💾 カスタム結果を保存: ${customResultPath}`);
    
    // サマリー
    console.log('\n📊 テストサマリー:');
    console.log(`- 入力画像: ${basename(testImagePath)}`);
    console.log(`- 画像サイズ: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`- 処理時間: ${(elapsedTime / 1000).toFixed(2)}秒`);
    console.log(`- 保存場所: ${outputDir}/`);
    console.log(`  - ${basename(imageCopyPath)}`);
    console.log(`  - ${basename(resultPath)}`);
    console.log(`  - ${basename(customResultPath)}`);
    
  } catch (error) {
    if (error instanceof VisionServiceError) {
      console.error('\n❌ Vision APIエラー:');
      console.error('メッセージ:', error.message);
      console.error('コード:', error.code);
      console.error('詳細:', error.details);
    } else {
      console.error('\n❌ 予期しないエラー:', error);
    }
    process.exit(1);
  }
  
  console.log('\n✨ テスト完了！');
}

// テスト実行
testVisionModule().catch(console.error);