# Handwritten-OCR-5-LLM

建築図面の手書き指摘事項を自動抽出するOCRシステムです。OpenAI o3とGoogle Geminiの2つのプロバイダーに対応しています。

## 🚀 クイックスタート

### 1. セットアップ（初回のみ）

```bash
# リポジトリのクローン
git clone https://github.com/OhmaeToshiaki/handwritten-ocr-5-llm.git
cd handwritten-ocr-5-llm

# 依存関係のインストール
pnpm install

# 入出力ディレクトリの初期化
pnpm init
```

### 2. 環境設定（.envファイル）

プロジェクトルートに`.env`ファイルを作成：

```bash
# OpenAI（o3プロバイダー用）
OPENAI_API_KEY=your-openai-api-key

# Google Cloud（Geminiプロバイダー用）
GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/your-service-account.json
```

### 3. 使い方

```bash
# 画像をinputディレクトリに配置
cp your-drawing.png handwritten-input/

# 処理実行（デフォルト: o3プロバイダー）
pnpm process

# Geminiプロバイダーを使用
pnpm process -- --provider gemini

# 結果確認
cat handwritten-output/your-drawing_o3_o3.txt
```

## 📋 前提条件

- **Node.js**: v20以上
- **pnpm**: v10以上（`npm install -g pnpm`でインストール）
- **APIキー**: 
  - OpenAI API Key: [取得はこちら](https://platform.openai.com/api-keys)
  - Google Cloud Service Account: [設定ガイド](https://cloud.google.com/iam/docs/keys-create-delete)

> ⚠️ **API利用料金について**  
> 本システムの利用には、OpenAIまたはGoogle CloudのAPI利用料金が発生します。

## 📁 入出力仕様

**入力**
- 📂 `handwritten-input/` ディレクトリ
- 🖼️ 対応形式: PNG, JPEG, GIF, WEBP
- 📐 建築図面の手書き指摘画像

**出力**
- 📂 `handwritten-output/` ディレクトリ  
- 📄 形式: `{画像名}_{プロバイダー}_{モデル}.txt`
- 📊 構造化された指摘事項

出力例：
```
========== 図面情報 ==========
図面名称：空調設備 1・2階平面図
図面番号：M-04
図面種別：設備図
縮尺：A1=1:200 / A3=1:400

========== 指摘事項 ==========
■指摘1
手書き内容：
側溝が横断しているが問題ないか？
指摘対象：
トラックヤード出入口と喫煙室の間の側溝
文脈情報：
車両通行時の強度について確認を求めている
```

## 🎮 コマンドリファレンス

### 基本コマンド

| コマンド | 説明 | 例 |
|---------|------|-----|
| `pnpm init` | 入出力ディレクトリを初期化 | `pnpm init` |
| `pnpm process` | 画像を処理（デフォルト: o3） | `pnpm process` |

### オプション

| オプション | 説明 | デフォルト | 例 |
|-----------|------|-----------|-----|
| `-p, --provider` | OCRプロバイダー | `o3` | `--provider gemini` |
| `--model` | 使用モデル | プロバイダー依存 | `--model gemini-2.5-flash` |
| `--max-tokens` | 最大トークン数 | `10000` | `--max-tokens 15000` |
| `--prompt` | カスタムプロンプト | 組み込みプロンプト | `--prompt "詳細に抽出"` |

## 💡 使用例

### 複数画像の一括処理

```bash
# 複数の画像をinputディレクトリに配置
cp drawings/*.png handwritten-input/

# 全画像を処理（3並列で実行）
pnpm process

# 結果確認
ls -la handwritten-output/
```

### プロバイダー比較

```bash
# o3で処理
pnpm process

# 続けてGeminiで処理
pnpm process -- --provider gemini

# 結果を比較
diff handwritten-output/drawing_o3_o3.txt \
     handwritten-output/drawing_gemini_gemini-2.5-pro.txt
```

### 高速処理（Gemini Flash）

```bash
pnpm process -- --provider gemini --model gemini-2.5-flash
```

## 📦 パッケージ構成

モノレポ構造で以下のパッケージから構成されています：

- **@llm-ocr/core** - 共通インターフェースと型定義
- **@llm-ocr/o3** - OpenAI o3プロバイダー（推論特化、高精度）
- **@llm-ocr/gemini** - Google Geminiプロバイダー（マルチモーダル対応）
- **@llm-ocr/cli** - コマンドラインインターフェース

## 🔧 プログラマティック使用

### インストール

```bash
# 特定のプロバイダーをインストール
npm install @llm-ocr/core @llm-ocr/o3
# または
npm install @llm-ocr/core @llm-ocr/gemini
```

### TypeScriptでの使用例

```typescript
import { createO3Provider } from '@llm-ocr/o3';

const provider = createO3Provider({
  apiKey: process.env.OPENAI_API_KEY
});

const result = await provider.analyzeImage('/path/to/image.png', {
  prompt: '建築図面の手書き指摘事項を抽出してください',
  maxTokens: 10000
});

console.log(result.text);
```

## 📊 プロバイダー比較

| 機能 | o3 | Gemini |
|------|-----|---------|
| 最適な用途 | 複雑な推論、手書きテキスト | 高速処理、一般的なOCR |
| デフォルトモデル | o3 | gemini-2.5-pro |
| 高速モデル | - | gemini-2.5-flash |
| トークン使用量 | 高（10000以上推奨） | 中程度 |
| 処理速度 | 遅い | 速い（Flashは超高速） |

## 🔧 トラブルシューティング

1. **`pnpm: command not found`**
   ```bash
   npm install -g pnpm
   ```

2. **APIキーエラー**
   - `.env`ファイルが正しく設定されているか確認
   - パスは絶対パスで指定

3. **画像が処理されない**
   - 対応形式: PNG, JPG, JPEG, GIF, WEBP
   - `handwritten-input/`ディレクトリに正しく配置されているか確認

4. **Geminiのタイムアウト**
   ```bash
   pnpm process -- --provider gemini --max-tokens 20000
   ```