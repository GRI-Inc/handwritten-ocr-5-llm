export interface Comment {
  id: string;
  bbox_norm: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  comment_text: string;
  context_note: string;
  related_elements: string[];
  severity: 'info' | 'warning' | 'error';
  resolved: boolean;
  created_at: string;
}

export interface Page {
  page: number;
  comments: Comment[];
}

export interface PDFAnalysisResult {
  document_id: string;
  pages: Page[];
}