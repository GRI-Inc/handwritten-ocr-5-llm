import { describe, test, expect } from 'vitest';
import type { Comment, PDFAnalysisResult } from './comment-schema.ts';

describe('Comment Schema Types', () => {
  test('should create valid Comment object', () => {
    const comment: Comment = {
      id: 'C1',
      bbox_norm: { x: 0.1, y: 0.2, w: 0.3, h: 0.1 },
      comment_text: 'Test comment',
      context_note: 'Test context',
      related_elements: ['wall', 'door'],
      severity: 'warning',
      resolved: false,
      created_at: new Date().toISOString(),
    };

    expect(comment.id).toBe('C1');
    expect(comment.severity).toBe('warning');
    expect(comment.related_elements).toContain('wall');
  });

  test('should create valid PDFAnalysisResult', () => {
    const result: PDFAnalysisResult = {
      document_id: 'test.pdf',
      pages: [
        {
          page: 1,
          comments: [],
        },
      ],
    };

    expect(result.document_id).toBe('test.pdf');
    expect(result.pages).toHaveLength(1);
  });
});