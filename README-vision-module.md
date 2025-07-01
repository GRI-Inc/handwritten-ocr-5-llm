# Vision Module - 外部プロジェクトからの使用方法

画像を分析してテキストを抽出する再利用可能なモジュールです。

## モジュールの場所

```
/home/oomae/projects/handwritten-ocr-5-o3/vision-module/
```

## 外部プロジェクトから使用する方法

### 方法1: ローカルパッケージとしてリンク（推奨）

```bash
# 1. vision-moduleディレクトリに移動
cd /home/oomae/projects/handwritten-ocr-5-o3/vision-module
pnpm install
pnpm build  # TypeScriptをコンパイル

# 2. グローバルにリンク
pnpm link

# 3. 使用したいプロジェクトで
cd /path/to/your/project
pnpm link @handwritten-ocr/vision-module
```

### 方法2: 直接パスを指定してインストール

```bash
# 使用したいプロジェクトで
cd /path/to/your/project
pnpm add file:/home/oomae/projects/handwritten-ocr-5-o3/vision-module
```

### 方法3: package.jsonに直接記述

```json
{
  "dependencies": {
    "@handwritten-ocr/vision-module": "file:../path/to/vision-module"
  }
}
```

## 使用例

### 基本的な使い方

```typescript
import { analyzeImage, VisionServiceError } from '@handwritten-ocr/vision-module';
import { readFileSync } from 'fs';

async function main() {
  try {
    // 画像ファイルを読み込む
    const imageBuffer = readFileSync('handwritten-note.png');
    
    // 画像を分析
    const result = await analyzeImage(imageBuffer);
    
    console.log('画像の内容:', result.text);
    console.log('使用トークン数:', result.tokensUsed);
  } catch (error) {
    if (error instanceof VisionServiceError) {
      console.error('Vision APIエラー:', error.message);
      console.error('エラーコード:', error.code);
    }
  }
}

main();
```

### Express.jsでの使用例

```typescript
import express from 'express';
import multer from 'multer';
import { analyzeImage } from '@handwritten-ocr/vision-module';

const app = express();
const upload = multer({ memory: true });

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    const result = await analyzeImage(req.file.buffer);
    res.json({ text: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### Next.js API Routeでの使用例

```typescript
// pages/api/analyze.ts または app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@handwritten-ocr/vision-module';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await analyzeImage(buffer);
    
    return NextResponse.json({ text: result.text });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### バッチ処理の例

```typescript
import { analyzeImage } from '@handwritten-ocr/vision-module';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function batchAnalyze(dirPath: string) {
  const files = await readdir(dirPath);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  const results = await Promise.all(
    imageFiles.map(async (file) => {
      const buffer = await readFile(join(dirPath, file));
      const result = await analyzeImage(buffer, {
        prompt: '手書きメモの内容を箇条書きで抽出してください'
      });
      return { file, ...result };
    })
  );
  
  return results;
}
```

## 環境設定

### 1. 環境変数の設定

```bash
# .envファイル
OPENAI_API_KEY=sk-xxx...
```

### 2. TypeScript設定

プロジェクトの`tsconfig.json`に以下を追加：

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "paths": {
      "@handwritten-ocr/vision-module": [
        "./node_modules/@handwritten-ocr/vision-module/src/index.ts"
      ]
    }
  }
}
```

### 3. ESLint設定（必要な場合）

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off', // モジュールの型に合わせて調整
  }
};
```

## トラブルシューティング

### "Cannot find module" エラー

```bash
# モジュールを再リンク
cd /home/oomae/projects/handwritten-ocr-5-o3/vision-module
pnpm unlink
pnpm link

# プロジェクト側で再インストール
cd /your/project
pnpm unlink @handwritten-ocr/vision-module
pnpm link @handwritten-ocr/vision-module
```

### TypeScriptエラー

```bash
# vision-moduleをビルド
cd /home/oomae/projects/handwritten-ocr-5-o3/vision-module
pnpm build
```

### APIキーエラー

```typescript
// APIキーを直接指定する場合
const result = await analyzeImage(image, {
  apiKey: 'sk-xxx...'
});
```

## API仕様

### `analyzeImage(image, options?)`

#### パラメータ

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| image | `string \| Buffer` | ✓ | 分析する画像データ |
| options.prompt | `string` | - | カスタムプロンプト |
| options.model | `'o3'` | - | 使用するモデル |
| options.maxTokens | `number` | - | 最大トークン数（デフォルト: 2000、推奨: 10000） |
| options.apiKey | `string` | - | OpenAI APIキー |

#### 戻り値

```typescript
interface AnalyzeImageResult {
  text: string;        // 画像の内容説明
  tokensUsed?: number; // 使用したトークン数
}
```

#### エラー

```typescript
class VisionServiceError extends Error {
  code?: string;    // エラーコード
  details?: unknown; // 詳細情報
}
```

## 実装例：PDFページ分析への統合

```typescript
import { pdf } from 'pdf-to-img';
import { analyzeImage } from '@handwritten-ocr/vision-module';

async function analyzePDFPage(pdfPath: string, pageNumber: number) {
  const document = await pdf(pdfPath, { scale: 3 });
  let currentPage = 0;
  
  for await (const image of document) {
    currentPage++;
    if (currentPage === pageNumber) {
      const base64 = image.toString('base64');
      const result = await analyzeImage(base64, {
        prompt: '建築図面の手書きコメントを抽出してください'
      });
      return result;
    }
  }
  
  throw new Error(`Page ${pageNumber} not found`);
}
```

## パフォーマンス考慮事項

- 画像サイズは20MB以下に制限
- 高解像度画像は処理時間が長くなる
- バッチ処理時は並列数を制限（推奨: 3-5並列）
- APIレート制限に注意

## o3モデル固有の注意事項

- **トークン使用量**: o3モデルは推論に多くのトークンを使用（通常2,000〜10,000トークン）
- **処理時間**: 推論トークンの使用により、処理時間が長くなる場合があります（約30秒〜1分）
- **コスト**: トークン使用量が多いため、APIコストに注意
- **設定制限**: temperatureは1.0固定（変更不可）

### 使用例（適切なトークン数を指定）

```typescript
// o3モデルに最適化した設定
const result = await analyzeImage(image, {
  maxTokens: 10000, // o3モデル用に大きな値を指定
  prompt: '手書き文字を詳細に読み取ってください'
});
```

## ライセンス

MIT