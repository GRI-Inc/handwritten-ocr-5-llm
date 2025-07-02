# LLM-OCR

画像からテキストを抽出するマルチプロバイダー対応のOCRツールです。モノレポ構造により、必要なプロバイダーのみを選択して使用できます。

## 機能

- 🎯 複数のLLMプロバイダーをサポート（OpenAI o3、Google Gemini）
- 📦 モジュラー設計（必要なプロバイダーのみインストール可能）
- 🖼️ 画像ファイルのバッチ処理
- 🔍 高精度なテキスト抽出
- 📁 シンプルな入出力ディレクトリ管理
- 📊 処理ログの自動記録

## パッケージ構成

- **@llm-ocr/core** - 共通インターフェースと型定義
- **@llm-ocr/o3** - OpenAI o3モデルプロバイダー（推論特化、高精度）
- **@llm-ocr/gemini** - Google Geminiプロバイダー（マルチモーダル、高速）
- **@llm-ocr/cli** - コマンドラインインターフェース

## セットアップ

### 1. 依存関係のインストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/llm-ocr.git
cd llm-ocr

# 依存関係をインストール
pnpm install

# 全パッケージをビルド
pnpm run build
```

### 2. APIキーの設定

`.env`ファイルを作成し、使用するプロバイダーのAPIキーを設定：

```bash
# OpenAI o3プロバイダー用
OPENAI_API_KEY=your-openai-api-key

# Geminiプロバイダー用
GEMINI_API_KEY=your-gemini-api-key
# またはサービスアカウントファイルを使用
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## CLI使用方法

### 1. 初期化

```bash
pnpm init
```

これにより以下のディレクトリが作成されます：
- `handwritten-input/` - 画像ファイルを配置するディレクトリ
- `handwritten-output/` - 解析結果が出力されるディレクトリ

### 2. 画像の配置

`handwritten-input/` ディレクトリに解析したい画像ファイルを配置します。

サポートされている形式: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`

### 3. バッチ処理の実行

```bash
# o3プロバイダーを使用（デフォルト）
pnpm process

# Geminiプロバイダーを使用
pnpm process -- --provider gemini

# カスタムプロンプトを指定
pnpm process -- --prompt "手書きテキストをすべて抽出してリスト形式でまとめてください"

# トークン数を指定
pnpm process -- --max-tokens 5000

# Geminiで特定のモデルを使用
pnpm process -- --provider gemini --model gemini-1.5-pro
```

### 4. 結果の確認

- 各画像の解析結果は `handwritten-output/` ディレクトリに `.txt` ファイルとして保存されます
- 処理ログは `handwritten-output/process-log-[timestamp].json` として保存されます

## プログラマティック使用

### npmパッケージとしての使用

各プロバイダーは独立してインストール・使用できます：

```bash
# 特定のプロバイダーをインストール
npm install @llm-ocr/core @llm-ocr/o3
# または
npm install @llm-ocr/core @llm-ocr/gemini
```

### 例: o3プロバイダーの使用

```typescript
import { createO3Provider } from '@llm-ocr/o3';

const provider = createO3Provider({
  apiKey: process.env.OPENAI_API_KEY
});

// 画像ファイルを解析
const result = await provider.analyzeImage('/path/to/image.png', {
  prompt: 'この画像からすべてのテキストを抽出してください',
  maxTokens: 10000 // o3は高いトークン数が必要
});

console.log(result.text);
```

### 例: Geminiプロバイダーの使用

```typescript
import { createGeminiProvider } from '@llm-ocr/gemini';

const provider = createGeminiProvider({
  apiKey: process.env.GEMINI_API_KEY
});

// 画像を解析
const result = await provider.analyzeImage('/path/to/image.png', {
  model: 'gemini-1.5-flash', // または 'gemini-1.5-pro'
  prompt: 'この画像からすべてのテキストを抽出してください'
});

console.log(result.text);
```

### 例: プロバイダー非依存のコード

```typescript
import type { OCRProvider } from '@llm-ocr/core';
import { createO3Provider } from '@llm-ocr/o3';
import { createGeminiProvider } from '@llm-ocr/gemini';

// ファクトリー関数
function createProvider(type: string): OCRProvider {
  switch (type) {
    case 'o3':
      return createO3Provider();
    case 'gemini':
      return createGeminiProvider();
    default:
      throw new Error(`Unknown provider: ${type}`);
  }
}

// 同じインターフェースで任意のプロバイダーを使用
const provider = createProvider(process.env.OCR_PROVIDER || 'o3');
const result = await provider.analyzeImage('/path/to/image.png');
```

## プロバイダー比較

| 機能 | o3 | Gemini |
|------|-----|---------|
| 最適な用途 | 複雑な推論、手書きテキスト | 一般的なOCR、高速処理 |
| デフォルトモデル | o3 | gemini-1.5-flash |
| トークン使用量 | 高（10000以上推奨） | 中程度 |
| マルチモーダル | 画像のみ | 画像＋他のモダリティ |
| ファイルサイズ制限 | 20MB | 20MB |

## ディレクトリ構造

```
llm-ocr/
├── packages/
│   ├── core/        # 共通インターフェースと型定義
│   ├── o3/          # OpenAI o3プロバイダー
│   ├── gemini/      # Google Geminiプロバイダー
│   └── cli/         # コマンドラインインターフェース
├── handwritten-input/      # 画像入力ディレクトリ（.gitignore）
├── handwritten-output/     # 結果出力ディレクトリ（.gitignore）
├── pnpm-workspace.yaml     # pnpmワークスペース設定
└── package.json
```

## スクリプト

| コマンド | 説明 |
|---------|-----|
| `pnpm init` | 入出力ディレクトリを初期化 |
| `pnpm process` | 画像を一括処理 |
| `pnpm build` | 全パッケージをビルド |
| `pnpm typecheck` | TypeScriptの型チェック |
| `pnpm dev` | CLIツールを直接実行 |

## 開発

### ビルド

```bash
# 全パッケージをビルド
pnpm run build

# 特定のパッケージをビルド
pnpm --filter @llm-ocr/core run build

# 型チェック
pnpm run typecheck
```

### 新しいプロバイダーの追加

1. `packages/your-provider/` に新しいパッケージを作成
2. `@llm-ocr/core` の `OCRProvider` インターフェースを実装
3. CLIのプロバイダーファクトリーにパッケージを追加
4. ドキュメントを更新

## 注意事項

- o3モデルは推論に多くのトークンを使用するため、`--max-tokens` は最低10,000を推奨
- 大量の画像を処理する場合は、API利用料金にご注意ください
- 処理結果は自動的に保存されますが、`handwritten-output/` ディレクトリは定期的にクリーンアップしてください

## ライセンス

MIT