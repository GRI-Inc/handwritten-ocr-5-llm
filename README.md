# Handwritten OCR System v5 with o3 Model

建築図面PDFから手書きコメントを抽出・分析するシステムです。OpenAI o3 モデル（推論特化型）を使用して、手書きのコメントやメモを識別し、その位置、内容、文脈を解析します。

## 機能

- 📄 PDFファイルの各ページを画像に変換
- 🔍 o3 モデル（推論特化型）による手書きコメントの検出
- 📍 コメントの位置情報（バウンディングボックス）の取得
- 🏗️ 建築図面の要素との関連付け
- 📊 結果をテーブル形式で表示
- 💾 CSV/JSON形式でのエクスポート

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. OpenAI APIキーの設定

`.env`ファイルを作成し、APIキーを設定：

```bash
OPENAI_API_KEY=your-api-key-here
```

## 使用方法

### PDFファイル分析

基本的な使い方

```bash
# PDFファイルを分析
pnpm analyze <pdf-file>

# 例：
pnpm analyze "samples/石黒メモ.pdf"
```

### オプション

```bash
# CSV形式で出力（デフォルト: results/ディレクトリに保存）
pnpm analyze "samples/石黒メモ.pdf" -o results/output.csv

# JSON形式で出力
pnpm analyze "samples/石黒メモ.pdf" -j results/output.json

# 両方の形式で出力
pnpm analyze "samples/石黒メモ.pdf" -o results/output.csv -j results/output.json

# APIキーを直接指定
pnpm analyze "samples/石黒メモ.pdf" --api-key sk-xxx
```

### 画像解析CLIツール（シンプルモード）

PDFではなく、画像ファイルを直接バッチ処理したい場合は、以下のシンプルなCLIツールを使用できます。

#### 1. 初期化

```bash
# 入出力ディレクトリを作成
npx tsx src/cli.ts handwritten:init
```

これにより以下のディレクトリが作成されます：
- `handwritten-input/` - 画像ファイルを配置するディレクトリ
- `handwritten-output/` - 解析結果が出力されるディレクトリ

#### 2. 画像の配置

`handwritten-input/` ディレクトリに解析したい画像ファイルを配置します。
サポートされている形式: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`

#### 3. バッチ処理の実行

```bash
# すべての画像を処理
npx tsx src/cli.ts handwritten:process

# トークン数を指定（デフォルト: 10000）
npx tsx src/cli.ts handwritten:process --max-tokens 20000
```

#### 4. 結果の確認

- 各画像の解析結果は `handwritten-output/` ディレクトリに `.txt` ファイルとして保存されます
- 処理ログは `handwritten-output/process-log-[timestamp].json` として保存されます

#### 使用例

```bash
# ステップ1: 初期化
npx tsx src/cli.ts handwritten:init

# ステップ2: 画像を配置
cp my-images/*.png handwritten-input/

# ステップ3: 処理実行
npx tsx src/cli.ts handwritten:process

# ステップ4: 結果確認
ls handwritten-output/
# image1.txt
# image2.txt
# process-log-2025-07-02T08-58-50-382Z.json
```

## ディレクトリ構造

```
handwritten-ocr-5-o3/
├── samples/                # サンプルPDFファイル
│   └── *.pdf
├── results/                # 分析結果ファイル（gitignore対象）
│   ├── *.csv
│   └── *.json
├── handwritten-input/      # 画像解析用入力ディレクトリ
│   └── *.png, *.jpg, etc.
├── handwritten-output/     # 画像解析結果出力ディレクトリ
│   ├── *.txt
│   └── process-log-*.json
├── vision-module/          # 画像解析コアモジュール
├── src/                    # ソースコード
│   ├── cli.ts
│   ├── handwritten-analyzer.ts
│   └── ...
└── README.md
```

## 出力形式

### JSON出力スキーマ

```json
{
  "document_id": "石黒メモ.pdf",
  "pages": [
    {
      "page": 1,
      "comments": [
        {
          "id": "C1",
          "bbox_norm": { "x": 0.12, "y": 0.05, "w": 0.30, "h": 0.08 },
          "comment_text": "階段と外壁のすき間？確認済？",
          "context_note": "階段踊り場側…干渉や耐火塞ぎ忘れの懸念",
          "related_elements": ["stair", "outer_wall"],
          "severity": "warning",
          "resolved": false,
          "created_at": "2025-06-27T16:15:00+09:00"
        }
      ]
    }
  ]
}
```

### CSV出力形式

| Document ID | Page | Comment ID | Comment Text | Context Note | Related Elements | Severity | Resolved | X Position | Y Position | Width | Height | Created At |
|------------|------|------------|--------------|--------------|------------------|----------|----------|------------|------------|-------|--------|------------|
| 石黒メモ.pdf | 1 | C1 | 階段と外壁のすき間？確認済？ | 階段踊り場側…干渉や耐火塞ぎ忘れの懸念 | stair; outer_wall | warning | false | 0.120 | 0.050 | 0.300 | 0.080 | 2025-06-27T16:15:00+09:00 |

## 開発

### ビルド

```bash
# TypeScriptのコンパイル
pnpm build
```

### テスト

```bash
# テストの実行
pnpm test

# カバレッジレポート付き
pnpm test:cov
```

### リント

```bash
# リントチェック
pnpm lint

# 自動修正
pnpm lint:fix
```

## 技術スタック

- **言語**: TypeScript
- **実行環境**: Node.js
- **PDF処理**: pdf-img-convert
- **AI分析**: OpenAI o3（推論特化型モデル）
- **CLI**: Commander.js
- **テーブル表示**: cli-table3
- **テスト**: Vitest

## ライセンス

MIT