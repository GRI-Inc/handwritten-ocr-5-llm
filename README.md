# Handwritten OCR System v5 with o3 Model

建築図面PDFから手書きコメントを抽出・分析するシステムです。OpenAI GPT-4o (o3) モデルを使用して、手書きのコメントやメモを識別し、その位置、内容、文脈を解析します。

## 機能

- 📄 PDFファイルの各ページを画像に変換
- 🔍 GPT-4o モデルによる手書きコメントの検出
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

### 基本的な使い方

```bash
# PDFファイルを分析
pnpm analyze <pdf-file>

# 例：
pnpm analyze "石黒メモ.pdf"
```

### オプション

```bash
# CSV形式で出力
pnpm analyze "石黒メモ.pdf" -o results.csv

# JSON形式で出力
pnpm analyze "石黒メモ.pdf" -j results.json

# 両方の形式で出力
pnpm analyze "石黒メモ.pdf" -o results.csv -j results.json

# APIキーを直接指定
pnpm analyze "石黒メモ.pdf" --api-key sk-xxx
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
- **AI分析**: OpenAI GPT-4o
- **CLI**: Commander.js
- **テーブル表示**: cli-table3
- **テスト**: Vitest

## ライセンス

MIT