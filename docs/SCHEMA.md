# LLM-OCR 統合データスキーマ仕様書

## 概要

建築図面の検図業務において、手書き指摘事項をOCRで抽出し、構造化データとして管理するための統合スキーマです。

## スキーマ構造

### 1. ルートオブジェクト

```typescript
interface InspectionDocument {
  documentId: string;              // UUID - 処理セッションの一意識別子
  fileMetadata: FileMetadata;      // 画像ファイルのメタデータ
  drawingMetadata: DrawingMetadata; // 図面情報（OCRで抽出）
  inspectionMetadata: InspectionMetadata; // 検図情報
  annotations: Annotation[];        // 手書き指摘事項のリスト
  processingHistory: ProcessingRecord[]; // 処理履歴
  aggregatedMetrics: Metrics;      // 集計メトリクス
}
```

### 2. ファイルメタデータ

```typescript
interface FileMetadata {
  fileName: string;
  filePath: string;
  fileSize: number;                // バイト単位
  mimeType: "image/png" | "image/jpeg" | "image/tiff";
  dimensions: {
    width: number;
    height: number;
  };
  createdAt: string;              // ISO 8601形式
  modifiedAt: string;             // ISO 8601形式
}
```

### 3. 図面メタデータ

```typescript
interface DrawingMetadata {
  drawingName: string;            // 図面名称
  drawingNumber: string;          // 図面番号
  drawingType: DrawingType;       // 図面種別
  buildingType: BuildingType;     // 建物種別
  scale: string;                  // 縮尺
  date: string;                   // 日付
  projectName?: string;           // プロジェクト名
  architect?: string;             // 設計者
  contractor?: string;            // 施工者
  revisionNumber?: string;        // 改訂番号
  additionalInfo?: Record<string, string>; // その他の情報
}

// 図面種別
type DrawingType = 
  | "architectural"    // 意匠図
  | "structural"       // 構造図
  | "mechanical"       // 設備図
  | "electrical"       // 電気設備図
  | "construction"     // 施工図
  | "detail"          // 詳細図
  | "other";          // その他

// 建物種別
type BuildingType = 
  | "RC"     // RC造
  | "S"      // S造
  | "SRC"    // SRC造
  | "W"      // 木造
  | "mixed"  // 混構造
  | "other"; // その他
```

### 4. 検図メタデータ

```typescript
interface InspectionMetadata {
  inspector: string;              // 検図担当者
  inspectionDate: string;         // 検図日時 (ISO 8601)
  inspectionStage: InspectionStage; // 検図段階
  projectPhase: ProjectPhase;     // プロジェクトフェーズ
}

type InspectionStage = 
  | "basic_design"      // 基本設計
  | "detail_design"     // 実施設計
  | "construction"      // 施工図
  | "as_built"         // 竣工図
  | "other";

type ProjectPhase = 
  | "application"      // 申請
  | "start"           // 着工
  | "construction"    // 施工
  | "completion"      // 竣工
  | "other";
```

### 5. 指摘事項（Annotation）

```typescript
interface Annotation {
  annotationId: string;           // UUID
  sequenceNumber: number;         // 指摘番号（表示用）
  category: AnnotationCategory;   // カテゴリ
  severity: Severity;             // 重要度
  status: Status;                 // 処理状況
  assignee?: string;              // 担当者
  dueDate?: string;              // 対応期日 (ISO 8601)
  location: Location;             // 位置情報
  extractions: Extraction[];      // OCR抽出結果
  consolidatedText?: ConsolidatedText; // 統合テキスト
  relatedElements: BuildingElement[]; // 関連要素
  statusHistory: StatusChange[];  // ステータス変更履歴
  comments?: string;              // コメント
}

// カテゴリ
type AnnotationCategory = 
  | "dimension"        // 寸法確認
  | "specification"    // 仕様確認
  | "consistency"      // 整合性
  | "missing"         // 記載漏れ
  | "change"          // 変更指示
  | "question"        // 質疑
  | "attention"       // 注意事項
  | "other";

// 重要度
type Severity = "critical" | "high" | "medium" | "low";

// ステータス
type Status = 
  | "pending"         // 未対応
  | "in_progress"     // 対応中
  | "reviewed"        // 確認済
  | "completed"       // 完了
  | "on_hold";        // 保留

// 建物要素
type BuildingElement = 
  | "column"    // 柱
  | "beam"      // 梁
  | "wall"      // 壁
  | "floor"     // 床
  | "ceiling"   // 天井
  | "opening"   // 開口部
  | "door"      // 建具
  | "equipment" // 設備
  | "pipe"      // 配管
  | "wire"      // 配線
  | "finish"    // 仕上げ
  | "other";
```

### 6. 位置情報

```typescript
interface Location {
  description: string;            // 位置の説明（例：2階X3-Y2通り）
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    coordinateSystem: "pixel";   // 座標系
  };
  gridReference?: string;         // 通り芯参照（例：X3-Y2）
  floor?: string;                 // 階数
  room?: string;                  // 部屋名
}
```

### 7. OCR抽出結果

```typescript
interface Extraction {
  provider: OCRProvider;          // プロバイダー
  handwrittenText: string;        // 手書き内容
  targetElement: string;          // 指摘対象
  contextInfo: string;            // 文脈情報
  confidence?: number;            // 信頼度 (0-1)
  extractedAt: string;            // 抽出日時 (ISO 8601)
}

type OCRProvider = 
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "o3"
  | "claude-3-opus"
  | "manual";
```

### 8. 統合テキスト

```typescript
interface ConsolidatedText {
  text: string;                   // 最終テキスト
  editedBy: string;              // 編集者
  editedAt: string;              // 編集日時 (ISO 8601)
}
```

### 9. ステータス変更履歴

```typescript
interface StatusChange {
  changedAt: string;              // 変更日時 (ISO 8601)
  changedBy: string;              // 変更者
  fromStatus: Status;             // 変更前ステータス
  toStatus: Status;               // 変更後ステータス
  reason?: string;                // 変更理由
}
```

### 10. 処理履歴

```typescript
interface ProcessingRecord {
  processId: string;              // UUID
  provider: string;               // プロバイダー
  model: string;                  // モデル名
  startedAt: string;              // 開始日時 (ISO 8601)
  completedAt?: string;           // 完了日時
  processingTimeSeconds?: number; // 処理時間（秒）
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  status: "success" | "partial" | "failed";
  error?: string;                 // エラーメッセージ
}
```

### 11. 集計メトリクス

```typescript
interface Metrics {
  totalAnnotations: number;       // 総指摘数
  annotationsByCategory: Record<AnnotationCategory, number>;
  annotationsBySeverity: Record<Severity, number>;
  annotationsByStatus: Record<Status, number>;
  annotationsByAssignee?: Record<string, number>;
  providerComparison: Record<string, number>; // プロバイダー別抽出数
  averageResolutionTime?: number; // 平均解決時間（時間）
  reworkRate?: number;            // 手戻り率（％）
}
```

## 実装例

```json
{
  "documentId": "550e8400-e29b-41d4-a716-446655440000",
  "fileMetadata": {
    "fileName": "石黒チェック図_page_1.png",
    "filePath": "/home/oomae/projects/llm-ocr/handwritten-input/石黒チェック図_page_1.png",
    "fileSize": 9354627,
    "mimeType": "image/png",
    "dimensions": {
      "width": 4960,
      "height": 3508
    },
    "createdAt": "2025-07-03T01:00:00Z",
    "modifiedAt": "2025-07-03T01:00:00Z"
  },
  "drawingMetadata": {
    "drawingName": "空調設備 1・2階平面図",
    "drawingNumber": "M-04",
    "drawingType": "mechanical",
    "buildingType": "other",
    "scale": "A1=1:200 / A3=1:400",
    "date": "2024-02-16"
  },
  "inspectionMetadata": {
    "inspector": "石黒",
    "inspectionDate": "2025-07-03T10:00:00Z",
    "inspectionStage": "construction",
    "projectPhase": "construction"
  },
  "annotations": [
    {
      "annotationId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "sequenceNumber": 1,
      "category": "question",
      "severity": "high",
      "status": "pending",
      "location": {
        "description": "1階平面図の左上、Y11-Y12通り・X8-X9通り付近",
        "gridReference": "Y11-Y12, X8-X9",
        "floor": "1階"
      },
      "extractions": [
        {
          "provider": "gemini-2.5-pro",
          "handwrittenText": "側溝が横断しているが問題ないか？",
          "targetElement": "トラックヤード出入口と喫煙室の間の側溝",
          "contextInfo": "トラックヤード出入口と喫煙室の間を横切る側溝を指しており、車両が通行する際の強度等について問題ないか確認を求めている。",
          "confidence": 0.95,
          "extractedAt": "2025-07-03T03:24:00Z"
        }
      ],
      "relatedElements": ["other"]
    }
  ],
  "processingHistory": [
    {
      "processId": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
      "provider": "gemini",
      "model": "gemini-2.5-pro",
      "startedAt": "2025-07-03T03:24:00Z",
      "completedAt": "2025-07-03T03:24:44Z",
      "processingTimeSeconds": 43.6,
      "tokenUsage": {
        "input": 3500,
        "output": 482,
        "total": 3982
      },
      "status": "success"
    }
  ],
  "aggregatedMetrics": {
    "totalAnnotations": 12,
    "annotationsByCategory": {
      "dimension": 2,
      "specification": 3,
      "consistency": 1,
      "missing": 1,
      "change": 1,
      "question": 3,
      "attention": 1,
      "other": 0
    },
    "annotationsBySeverity": {
      "critical": 0,
      "high": 4,
      "medium": 6,
      "low": 2
    },
    "annotationsByStatus": {
      "pending": 12,
      "in_progress": 0,
      "reviewed": 0,
      "completed": 0,
      "on_hold": 0
    },
    "providerComparison": {
      "gemini-2.5-pro": 12,
      "o3": 10
    }
  }
}
```

## 活用方法

### 1. 検図業務の効率化
- 指摘事項の一元管理
- ステータス管理による進捗把握
- 担当者割り当てとタスク管理

### 2. AI分析への活用
- カテゴリ別の指摘パターン分析
- 建物種別×図面種別での傾向把握
- プロバイダー間の精度比較

### 3. 品質向上への貢献
- 手戻り率の可視化
- 平均解決時間の短縮
- 頻出指摘事項の事前チェックリスト化

## 更新履歴

- v1.0.0 (2025-07-03): 初版作成