# Handwritten Text Analyzer

画像から手書きテキストを抽出するシンプルなCLIツールです。OpenAI o3モデル（推論特化型）を使用します。

## 機能

- 🖼️ 画像ファイルのバッチ処理
- 🔍 o3モデルによる高精度なテキスト抽出
- 📁 シンプルな入出力ディレクトリ管理
- 📊 処理ログの自動記録

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

### 1. 初期化

```bash
pnpm init
# または
npx tsx src/cli.ts init
```

これにより以下のディレクトリが作成されます：
- `handwritten-input/` - 画像ファイルを配置するディレクトリ
- `handwritten-output/` - 解析結果が出力されるディレクトリ

### 2. 画像の配置

`handwritten-input/` ディレクトリに解析したい画像ファイルを配置します。

サポートされている形式: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`

### 3. バッチ処理の実行

```bash
pnpm process
# または
npx tsx src/cli.ts process

# トークン数を指定（デフォルト: 10000）
npx tsx src/cli.ts process --max-tokens 20000
```

### 4. 結果の確認

- 各画像の解析結果は `handwritten-output/` ディレクトリに `.txt` ファイルとして保存されます
- 処理ログは `handwritten-output/process-log-[timestamp].json` として保存されます

## 使用例

```bash
# ステップ1: 初期化
pnpm init

# ステップ2: 画像を配置
cp my-images/*.png handwritten-input/

# ステップ3: 処理実行
pnpm process

# ステップ4: 結果確認
ls handwritten-output/
# image1.txt
# image2.txt
# process-log-2025-07-02T08-58-50-382Z.json
```

## ディレクトリ構造

```
handwritten-analyzer/
├── handwritten-input/      # 画像入力ディレクトリ（.gitignore）
│   └── *.png, *.jpg, etc.
├── handwritten-output/     # 結果出力ディレクトリ（.gitignore）
│   ├── *.txt
│   └── process-log-*.json
├── vision-module/          # 画像解析コアモジュール
│   └── src/
├── src/                    # ソースコード
│   ├── cli.ts
│   ├── handwritten-analyzer.ts
│   └── index.ts
├── .env                    # 環境変数（.gitignore）
└── README.md
```

## 技術スタック

- **言語**: TypeScript
- **実行環境**: Node.js
- **AI分析**: OpenAI o3（推論特化型モデル）
- **CLI**: Commander.js

## スクリプト

| コマンド | 説明 |
|---------|-----|
| `pnpm init` | 入出力ディレクトリを初期化 |
| `pnpm process` | 画像を一括処理 |
| `pnpm typecheck` | TypeScriptの型チェック |
| `pnpm dev` | CLIツールを直接実行 |

## 注意事項

- o3モデルは推論に多くのトークンを使用するため、`--max-tokens` は最低10,000を推奨
- 大量の画像を処理する場合は、API利用料金にご注意ください
- 処理結果は自動的に保存されますが、`handwritten-output/` ディレクトリは定期的にクリーンアップしてください

## ライセンス

MIT