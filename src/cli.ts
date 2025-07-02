#!/usr/bin/env node
import { program } from 'commander';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { PDFAnalyzer } from './pdf-analyzer.ts';
import { ResultFormatter } from './result-formatter.ts';
import { initializeDirectories, processImages } from './handwritten-analyzer.ts';

// Load environment variables
config();

program
  .name('pdf-ocr-analyzer')
  .description('Analyze handwritten comments in PDF architectural drawings')
  .version('1.0.0');

program
  .command('analyze <pdf-file>')
  .description('Analyze a PDF file for handwritten comments')
  .option('-o, --output-csv <path>', 'Export results to CSV file')
  .option('-j, --output-json <path>', 'Export results to JSON file')
  .option('--api-key <key>', 'OpenAI API key (overrides env variable)')
  .action(async (pdfFile: string, options: {
    outputCsv?: string;
    outputJson?: string;
    apiKey?: string;
  }) => {
    try {
      // Validate input file
      const pdfPath = resolve(pdfFile);
      if (!existsSync(pdfPath)) {
        console.error(`❌ Error: PDF file not found: ${pdfPath}`);
        process.exit(1);
      }

      // Get API key
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error(
          '❌ Error: OpenAI API key not found. Set OPENAI_API_KEY environment variable or use --api-key option.'
        );
        process.exit(1);
      }

      console.log(`🔍 Analyzing PDF: ${pdfPath}`);

      // Analyze PDF
      const analyzer = new PDFAnalyzer(apiKey);
      const result = await analyzer.analyzePDF(pdfPath);

      // Format and display results
      const formatter = new ResultFormatter();
      formatter.displayTable(result);

      // Export if requested
      if (options.outputCsv) {
        formatter.exportToCSV(result, options.outputCsv);
      }
      if (options.outputJson) {
        formatter.exportToJSON(result, options.outputJson);
      }

      // Summary
      const totalComments = result.pages.reduce(
        (sum, page) => sum + page.comments.length,
        0
      );
      console.log(`\n📊 Summary: Found ${totalComments} comments across ${result.pages.length} pages`);

    } catch (error) {
      console.error('❌ Error during analysis:', error);
      process.exit(1);
    }
  });

// handwritten:initコマンド
program
  .command('handwritten:init')
  .description('Initialize input/output directories for handwritten text analysis')
  .action(async () => {
    try {
      await initializeDirectories();
    } catch (error) {
      console.error('❌ Error during initialization:', error);
      process.exit(1);
    }
  });

// handwritten:processコマンド
program
  .command('handwritten:process')
  .description('Process images in the input directory and extract handwritten text')
  .option('--max-tokens <number>', 'Maximum tokens for o3 model (default: 10000)', '10000')
  .action(async (options: { maxTokens: string }) => {
    try {
      await processImages({
        maxTokens: parseInt(options.maxTokens, 10)
      });
    } catch (error) {
      console.error('❌ Error during processing:', error);
      process.exit(1);
    }
  });

program.parse();