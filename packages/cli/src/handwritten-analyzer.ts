import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';
import type { OCRProvider } from '@llm-ocr/core';
import { createO3Provider } from '@llm-ocr/o3';
import { createGeminiProvider } from '@llm-ocr/gemini';

// 定数定義
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../../');
const INPUT_DIR = resolve(PROJECT_ROOT, 'handwritten-input');
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'handwritten-output');
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

/**
 * 入出力ディレクトリを初期化
 */
export async function initializeDirectories(): Promise<void> {
  console.log('📁 ディレクトリを初期化中...');
  
  // inputディレクトリ作成
  if (!existsSync(INPUT_DIR)) {
    mkdirSync(INPUT_DIR, { recursive: true });
    console.log(`✅ ${INPUT_DIR}/ ディレクトリを作成しました`);
  } else {
    console.log(`ℹ️  ${INPUT_DIR}/ ディレクトリは既に存在します`);
  }
  
  // outputディレクトリ作成
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ ${OUTPUT_DIR}/ ディレクトリを作成しました`);
  } else {
    console.log(`ℹ️  ${OUTPUT_DIR}/ ディレクトリは既に存在します`);
  }
  
  console.log('\n📝 使い方:');
  console.log(`1. ${INPUT_DIR}/ ディレクトリに画像ファイルを配置してください`);
  console.log('2. pnpm process を実行してください（または --provider gemini でGeminiを使用）');
  console.log(`3. 結果は ${OUTPUT_DIR}/ ディレクトリに出力されます`);
  console.log('   出力形式: {画像名}_{プロバイダー}_{モデル}.txt');
}

/**
 * プロバイダーを作成
 */
function createProvider(providerName: string, model?: string): OCRProvider {
  switch (providerName.toLowerCase()) {
    case 'o3':
      // o3 provider doesn't accept model parameter (only supports 'o3' model)
      return createO3Provider();
    case 'gemini':
      return createGeminiProvider();
    default:
      throw new Error(`サポートされていないプロバイダー: ${providerName}`);
  }
}

/**
 * 画像ファイルを処理
 */
export async function processImages(options: { 
  provider?: string;
  model?: string;
  maxTokens?: number;
  prompt?: string;
} = {}): Promise<void> {
  console.log('🔍 画像ファイルを検索中...');
  
  // プロバイダーを作成
  const providerName = options.provider || 'o3';
  console.log(`🔧 プロバイダー: ${providerName}`);
  
  let provider: OCRProvider;
  try {
    provider = createProvider(providerName, options.model);
    // プロバイダーの設定を検証
    await provider.validateConfig();
  } catch (error) {
    console.error(`❌ プロバイダーの初期化に失敗しました: ${error}`);
    process.exit(1);
  }
  
  // プロバイダー情報を表示
  const providerInfo = provider.getProviderInfo();
  console.log(`📚 使用モデル: ${options.model || provider.getDefaultModel()}`);
  
  // inputディレクトリの存在確認
  if (!existsSync(INPUT_DIR)) {
    console.error(`❌ ${INPUT_DIR}/ ディレクトリが見つかりません`);
    console.error('先に init コマンドを実行してください');
    process.exit(1);
  }
  
  // 画像ファイルを取得
  const files = readdirSync(INPUT_DIR).filter(file => {
    const ext = extname(file).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
  });
  
  if (files.length === 0) {
    console.log(`ℹ️  ${INPUT_DIR}/ ディレクトリに画像ファイルが見つかりません`);
    console.log(`サポートされている形式: ${SUPPORTED_EXTENSIONS.join(', ')}`);
    return;
  }
  
  console.log(`📷 ${files.length}個の画像ファイルを発見しました`);
  
  // outputディレクトリの確認・作成
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // 処理結果サマリー
  const results: Array<{ 
    file: string; 
    status: 'success' | 'error'; 
    message?: string;
    outputFile?: string;
    provider?: string;
    model?: string;
  }> = [];
  
  // 並行処理用の関数
  async function processImage(file: string): Promise<typeof results[0]> {
    const imagePath = join(INPUT_DIR, file);
    
    try {
      console.log(`🔄 処理開始: ${file}`);
      const startTime = Date.now();
      
      // 画像を解析
      const result = await provider.analyzeImage(imagePath, {
        model: options.model,
        maxTokens: options.maxTokens || 10000,
        prompt: options.prompt || `You are an expert architectural drawing checker.
Extract ALL handwritten review comments and minimal context.

Keep EXACTLY the following headings and order.
Do NOT add any other headings, numbers, bullets, or explanations.
List ALL handwritten comments found in the drawing using the format shown below.
Continue adding comments in the same format until all are documented.
Begin after <START> and finish at <END>.

<START>
========== 図面情報 ==========
図面名称：
図面番号：
図面種別：
建物種別：

========== 指摘事項 ==========
■指摘1
手書き内容：
指摘対象：
文脈情報：

■指摘2
手書き内容：
指摘対象：
文脈情報：

■指摘3
手書き内容：
指摘対象：
文脈情報：

[Continue with ■指摘4, ■指摘5, etc. for all remaining handwritten comments]
<END>`
      });
      
      // 使用されたモデル名を取得（ファイル名用に正規化）
      const modelName = (options.model || provider.getDefaultModel()).replace(/[.:]/g, '-');
      
      // 結果をファイルに保存（詳細型命名規則）
      const outputFile = join(OUTPUT_DIR, `${basename(file, extname(file))}_${providerName}_${modelName}.txt`);
      writeFileSync(outputFile, result.text, 'utf-8');
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ 完了: ${file} (${duration}秒)`);
      if (result.tokensUsed) {
        console.log(`   📊 トークン: ${result.tokensUsed}`);
      }
      
      return { 
        file, 
        status: 'success',
        outputFile: basename(outputFile),
        provider: providerName,
        model: options.model || provider.getDefaultModel()
      };
      
    } catch (error) {
      console.error(`❌ 失敗: ${file}`);
      console.error(`   ${error instanceof Error ? error.message : String(error)}`);
      return { 
        file, 
        status: 'error', 
        message: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  // 同時実行数制限付き並行処理
  const CONCURRENCY_LIMIT = 3;
  console.log(`\n🚀 並行処理開始（同時実行数: ${CONCURRENCY_LIMIT}）`);
  
  // ファイルをチャンクに分割
  for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
    const chunk = files.slice(i, i + CONCURRENCY_LIMIT);
    console.log(`\n📊 バッチ ${Math.floor(i / CONCURRENCY_LIMIT) + 1}/${Math.ceil(files.length / CONCURRENCY_LIMIT)}: ${chunk.join(', ')}`);
    
    // チャンク内で並行処理
    const chunkPromises = chunk.map(file => processImage(file));
    const chunkResults = await Promise.allSettled(chunkPromises);
    
    // 結果を収集
    chunkResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });
  }
  
  // 処理結果のサマリー
  console.log('\n📊 処理結果サマリー:');
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ 成功: ${successCount}個`);
  console.log(`❌ エラー: ${errorCount}個`);
  
  if (errorCount > 0) {
    console.log('\nエラーの詳細:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`- ${r.file}: ${r.message}`);
    });
  }
  
  // 処理ログをJSONで保存
  const logFile = join(OUTPUT_DIR, `process-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(logFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    provider: providerName,
    model: options.model || provider.getDefaultModel(),
    totalFiles: files.length,
    successCount,
    errorCount,
    results
  }, null, 2));
  
  console.log(`\n📝 処理ログ: ${logFile}`);
  console.log(`💾 結果ファイル: ${OUTPUT_DIR}/ ディレクトリを確認してください`);
}