import * as pdf2img from 'pdf-img-convert';
import OpenAI from 'openai';
import { type PDFAnalysisResult, type Page } from './types/comment-schema.ts';
import { basename } from 'path';

export class PDFAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzePDF(pdfPath: string): Promise<PDFAnalysisResult> {
    console.log(`Converting PDF to images: ${pdfPath}`);
    
    try {
      // Convert PDF pages to base64 images
      const pdfPages = (await pdf2img.convert(pdfPath, {
        height: 1998,
        base64: true,
      })) as string[];

      console.log(`Found ${pdfPages.length} pages`);

      const analysisResults: PDFAnalysisResult = {
        document_id: basename(pdfPath),
        pages: [],
      };

      // Process each page
      for (let i = 0; i < pdfPages.length; i++) {
        console.log(`Analyzing page ${i + 1}/${pdfPages.length}...`);
        
        const pageResult = await this.analyzePage(pdfPages[i], i + 1);
        if (pageResult && pageResult.comments && pageResult.comments.length > 0) {
          analysisResults.pages.push(pageResult);
        }
      }

      return analysisResults;
    } catch (error) {
      console.error('Error during PDF conversion:', error);
      // Return empty result on error
      return {
        document_id: basename(pdfPath),
        pages: [],
      };
    }
  }

  private async analyzePage(imageBase64: string, pageNumber: number): Promise<Page> {
    const prompt = `建築図面の画像を分析し、手書きのコメントやメモを抽出してください。

各コメントについて以下の情報を提供してください：
- コメントの位置（画像内の相対座標: x, y, width, height を0-1の範囲で）
- コメントのテキスト内容
- 図面のどの部分に関連しているか（階段、壁、ドアなど）
- コメントの重要度（info/warning/error）
- 図面と合わせて読んだときの意味・文脈の補足説明

以下のJSON形式で返してください：
{
  "page": ${pageNumber},
  "comments": [
    {
      "id": "C1",
      "bbox_norm": { "x": 0.12, "y": 0.05, "w": 0.30, "h": 0.08 },
      "comment_text": "抽出したテキスト",
      "context_note": "図面との関連性の説明",
      "related_elements": ["関連する図面要素"],
      "severity": "warning",
      "resolved": false,
      "created_at": "${new Date().toISOString()}"
    }
  ]
}

手書きコメントが見つからない場合は、空の配列を返してください。`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message.content;
      if (!content) {
        return { page: pageNumber, comments: [] };
      }

      const result = JSON.parse(content) as Page;
      return result;
    } catch (error) {
      console.error(`Error analyzing page ${pageNumber}:`, error);
      return { page: pageNumber, comments: [] };
    }
  }
}