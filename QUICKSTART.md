# LLM-OCR クイックスタートガイド

建築図面の手書き指摘事項を自動抽出するOCRシステムです。OpenAI o3とGoogle Geminiの2つのプロバイダーに対応しています。

## 📋 前提条件

本システムを利用するには、以下が必要です：

- **Node.js**: v20以上
- **pnpm**: v10以上（`npm install -g pnpm`でインストール）
- **APIキー**: 
  - **OpenAI API Key**（o3用）: [OpenAI Platform](https://platform.openai.com/api-keys)から取得
  - **Google Cloud Service Account**（Gemini用）: [設定ガイド](https://cloud.google.com/iam/docs/keys-create-delete)参照

> ⚠️ **API利用料金について**  
> 本システムの利用には、OpenAIまたはGoogle CloudのAPI利用料金が発生します。各サービスの料金体系を事前にご確認ください。

## 🚀 5分でスタート

### 1. システムのクローンと初期設定

```bash
# リポジトリのクローン
git clone https://github.com/OhmaeToshiaki/handwritten-ocr-5-o3.git
cd handwritten-ocr-5-o3

# 依存関係のインストール（pnpm必須）
pnpm install

# 入出力ディレクトリの初期化
# (handwritten-input と handwritten-output ディレクトリを作成します)
pnpm init
```

### 2. 環境設定（.envファイル）

プロジェクトルートに`.env`ファイルを作成：

```bash
# OpenAI（o3プロバイダー用）
OPENAI_API_KEY=your-openai-api-key

# Google Cloud（Geminiプロバイダー用）
# サービスアカウントキーのJSONファイルへの「絶対パス」を指定
GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/your-service-account.json
```

### 3. 画像を処理する

対応フォーマット: PNG, JPEG, GIF, WEBP

```bash
# 1. 画像をinputディレクトリに配置
cp your-drawing.png handwritten-input/

# または既存のサンプル画像で試す場合（すでに配置済み）:
# - 石黒チェック図_page_1.png
# - 220111_松風厚生棟_設計検証検図QA【塩見】チェック図_page_11.png

# 2. 処理実行（デフォルト: o3プロバイダー）
pnpm process

# 3. 結果を確認
cat handwritten-output/石黒チェック図_page_1_o3_o3.txt

# または Geminiプロバイダーを使用
# (-- はpnpmから内部スクリプトに引数を渡すための区切り)
pnpm process -- --provider gemini

# Geminiの結果を確認
cat handwritten-output/石黒チェック図_page_1_gemini_gemini-2.5-pro.txt
```

## 📁 ディレクトリ構造

```
llm-ocr/
├── handwritten-input/      # 🖼️ 処理する画像をここに配置
├── handwritten-output/     # 📄 処理結果が出力される
│   ├── {画像名}_{プロバイダー}_{モデル}.txt
│   └── process.log
├── packages/               # モノレポ構成
│   ├── cli/               # CLIツール
│   ├── core/              # 共通インターフェース
│   ├── o3/                # OpenAI o3プロバイダー
│   └── gemini/            # Google Geminiプロバイダー
└── .env                   # 環境変数（要作成）
```

### 出力ファイル名の規則
- `{画像名}_{プロバイダー}_{モデル}.txt`
- 例: `drawing_o3_o3.txt`, `drawing_gemini_gemini-2.5-pro.txt`

## 🎮 コマンドリファレンス

### 基本コマンド

```bash
# ディレクトリ初期化
pnpm init

# 画像処理（デフォルト設定）
pnpm process

# プロバイダーを指定
pnpm process -- --provider gemini

# モデルを指定（Gemini用）
pnpm process -- --provider gemini --model gemini-2.5-flash

# 最大トークン数を変更
pnpm process -- --max-tokens 15000

# カスタムプロンプトを使用
pnpm process -- --prompt "指摘事項を詳細に抽出してください"
```

### オプション一覧

| オプション | 説明 | デフォルト | 例 |
|-----------|------|-----------|-----|
| `-p, --provider` | OCRプロバイダー | `o3` | `gemini`, `o3` |
| `--model` | 使用モデル | プロバイダー依存 | `gemini-2.5-flash` |
| `--max-tokens` | 最大トークン数 | `10000` | `15000` |
| `--prompt` | カスタムプロンプト | 組み込みプロンプト | 任意のテキスト |


## 💡 使用例

### 例1: 複数画像の一括処理

```bash
# 複数の画像をinputディレクトリに配置
cp drawings/*.png handwritten-input/

# 全画像を処理（3並列で実行）
pnpm process

# 処理結果を確認
ls -la handwritten-output/
```

### 例2: プロバイダー比較

```bash
# o3で処理
pnpm process

# 続けてGeminiで処理
pnpm process -- --provider gemini

# outputディレクトリで結果を比較
ls -la handwritten-output/

# 結果の差分を確認（例）
diff handwritten-output/drawing_o3_o3.txt handwritten-output/drawing_gemini_gemini-2.5-pro.txt
```

### 例3: 高速処理（Gemini Flash）

```bash
pnpm process -- --provider gemini --model gemini-2.5-flash
```

## 📊 出力形式

処理結果は以下の形式で出力されます：

```
========== 図面情報 ==========
図面名称：空調設備 1・2階平面図
図面番号：M-04
図面種別：設備図
建物種別：(not visible)
縮尺：A1=1:200 / A3=1:400
日付：2024-02-16

========== 指摘事項 ==========
■指摘1
手書き内容：
側溝が横断しているが問題ないか？
指摘対象：
トラックヤード出入口と喫煙室の間の側溝
文脈情報：
トラックヤード出入口と喫煙室の間を横切る側溝を指しており...
```

## 🔧 トラブルシューティング

### よくある問題

1. **`pnpm: command not found`**
   ```bash
   npm install -g pnpm
   ```

2. **APIキーエラー**
   - `.env`ファイルが正しく設定されているか確認
   - パスは絶対パスで指定

3. **画像が処理されない**
   - 対応形式: PNG, JPG, JPEG, GIF, WEBP
   - ファイル名に特殊文字が含まれていないか確認
   - `handwritten-input/`ディレクトリに正しく配置されているか確認

4. **Geminiのタイムアウト**
   ```bash
   # タイムアウトを延長
   pnpm process -- --provider gemini --max-tokens 20000
   ```

## 🔄 プロジェクトの更新

```bash
# 最新版を取得
git pull origin main

# 依存関係を更新
pnpm install
```

## 📚 さらに詳しく

- **プロンプトのカスタマイズ**: `/packages/cli/src/handwritten-analyzer.ts`のデフォルトプロンプトを参照
- **新しいプロバイダーの追加**: `/packages/core/src/types.ts`のインターフェースを実装
- **バッチ処理の並列化**: 現在は3並列で処理（`CONCURRENT_LIMIT`）

## 🤝 貢献

1. Forkする
2. Feature branchを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Pull Requestを開く

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)を参照