# Vision Module

OpenAI Vision API (o3モデル) を使用して画像を分析する、再利用可能なTypeScriptモジュールです。

## 特徴

- 🎯 **シンプルなAPI**: 画像を渡すだけで内容を分析
- 🔄 **柔軟な入力**: Base64文字列とBufferの両方に対応
- 🛡️ **型安全**: TypeScriptによる完全な型定義
- ⚡ **エラーハンドリング**: 詳細なエラー情報を提供
- 🔧 **カスタマイズ可能**: プロンプトやパラメータを調整可能

## インストール

```bash
# 依存関係のインストール
cd vision-module
pnpm install
```

## 使い方

### 基本的な使用方法

```typescript
import { analyzeImage } from './src/index.ts';
import { readFileSync } from 'fs';

// 画像ファイルを読み込んで分析
const imageBuffer = readFileSync('image.png');
const result = await analyzeImage(imageBuffer);

console.log(result.text); // 画像の内容説明
```

### Base64文字列で使用

```typescript
const base64Image = 'iVBORw0KGgoAAAANS...'; // Base64エンコードされた画像
const result = await analyzeImage(base64Image);
```

### カスタムプロンプトを使用

```typescript
const result = await analyzeImage(imageBuffer, {
  prompt: '手書きの文字だけを読み取ってください',
  maxTokens: 300
});
```

### エラーハンドリング

```typescript
import { VisionServiceError } from './src/index.ts';

try {
  const result = await analyzeImage(imageBuffer);
  console.log(result.text);
} catch (error) {
  if (error instanceof VisionServiceError) {
    console.error('Vision APIエラー:', error.message);
    console.error('エラーコード:', error.code);
  }
}
```

## API リファレンス

### `analyzeImage(image, options?)`

画像を分析してテキストを返します。

#### パラメータ

- `image`: `string | Buffer` - 分析する画像（Base64文字列またはBuffer）
- `options`: `AnalyzeImageOptions` (オプション)
  - `prompt`: `string` - カスタムプロンプト（デフォルト: 画像の詳細な説明を要求）
  - `model`: `'o3'` - 使用するモデル（現在はo3のみ）
  - `maxTokens`: `number` - 最大トークン数（デフォルト: 2000、推奨: 10000）
    - o3モデルは推論に多くのトークンを使用するため、大きな値を推奨
  - `apiKey`: `string` - OpenAI APIキー（環境変数より優先）

#### 戻り値

```typescript
interface AnalyzeImageResult {
  text: string;        // 画像の内容説明
  tokensUsed?: number; // 使用したトークン数
}
```

### エラー型

```typescript
class VisionServiceError extends Error {
  code?: string;    // エラーコード
  details?: unknown; // 詳細情報
}
```

## 環境設定

### 環境変数

```bash
# .env ファイルを作成
cp .env.example .env

# APIキーを設定
OPENAI_API_KEY=sk-xxx...
```

### TypeScript設定

モジュールはESMとして構成されています。使用する際は、プロジェクトの`tsconfig.json`で以下の設定を確認してください：

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true
  }
}
```

## サンプルの実行

```bash
# 環境変数を設定後
cd example
tsx run.ts
```

## ビルド

```bash
# TypeScriptをJavaScriptにコンパイル
pnpm build

# 型チェックのみ
pnpm typecheck
```

## 制限事項

- o3モデルを使用するには、OpenAIの組織認証が必要です
- 画像形式はJPEG、PNG、GIF、WebPをサポート
- 最大画像サイズは20MBまで
- PDFファイルは直接サポートされていません（事前に画像に変換が必要）

### o3モデル特有の制限事項

- **トークン使用量**: o3モデルは推論に多くのトークンを使用します（通常2,000〜10,000トークン）
- **temperature設定**: o3モデルでは`temperature=1.0`固定（変更不可）
- **処理時間**: 推論トークンの使用により、処理時間が長くなる場合があります（約30秒〜1分）
- **パラメータ名**: `max_tokens`ではなく`max_completion_tokens`を内部で使用

## ライセンス

MIT