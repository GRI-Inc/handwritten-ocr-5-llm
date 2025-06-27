import Table from 'cli-table3';
import { writeFileSync } from 'fs';
import { type PDFAnalysisResult } from './types/comment-schema.ts';

export class ResultFormatter {
  displayTable(result: PDFAnalysisResult): void {
    const table = new Table({
      head: [
        'Page',
        'ID',
        'Comment Text',
        'Context',
        'Related Elements',
        'Severity',
        'Position',
      ],
      wordWrap: true,
      colWidths: [6, 6, 30, 30, 20, 10, 15],
    });

    result.pages.forEach((page) => {
      page.comments.forEach((comment) => {
        table.push([
          page.page.toString(),
          comment.id,
          comment.comment_text,
          comment.context_note,
          comment.related_elements.join(', '),
          comment.severity,
          `${(comment.bbox_norm.x * 100).toFixed(0)}%,${(
            comment.bbox_norm.y * 100
          ).toFixed(0)}%`,
        ]);
      });
    });

    console.log('\n📋 Handwritten Comments Analysis Results\n');
    console.log(table.toString());
  }

  exportToCSV(result: PDFAnalysisResult, outputPath: string): void {
    const headers = [
      'Document ID',
      'Page',
      'Comment ID',
      'Comment Text',
      'Context Note',
      'Related Elements',
      'Severity',
      'Resolved',
      'X Position',
      'Y Position',
      'Width',
      'Height',
      'Created At',
    ];

    const rows: string[] = [headers.join(',')];

    result.pages.forEach((page) => {
      page.comments.forEach((comment) => {
        const row = [
          this.escapeCSV(result.document_id),
          page.page.toString(),
          this.escapeCSV(comment.id),
          this.escapeCSV(comment.comment_text),
          this.escapeCSV(comment.context_note),
          this.escapeCSV(comment.related_elements.join('; ')),
          comment.severity,
          comment.resolved.toString(),
          comment.bbox_norm.x.toFixed(3),
          comment.bbox_norm.y.toFixed(3),
          comment.bbox_norm.w.toFixed(3),
          comment.bbox_norm.h.toFixed(3),
          comment.created_at,
        ];
        rows.push(row.join(','));
      });
    });

    writeFileSync(outputPath, rows.join('\n'), 'utf-8');
    console.log(`\n✅ CSV exported to: ${outputPath}`);
  }

  exportToJSON(result: PDFAnalysisResult, outputPath: string): void {
    writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`✅ JSON exported to: ${outputPath}`);
  }

  private escapeCSV(value: string): string {
    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}