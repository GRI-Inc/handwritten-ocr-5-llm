#!/usr/bin/env node
import { program } from 'commander';
import { config } from 'dotenv';
import { initializeDirectories, processImages } from './handwritten-analyzer.js';

// Load environment variables
config();

program
  .name('llm-ocr')
  .description('Analyze text in images using LLM providers')
  .version('1.0.0');

// initコマンド
program
  .command('init')
  .description('Initialize input/output directories for text analysis')
  .action(async () => {
    try {
      await initializeDirectories();
    } catch (error) {
      console.error('❌ Error during initialization:', error);
      process.exit(1);
    }
  });

// processコマンド
program
  .command('process')
  .description('Process images in the input directory and extract text')
  .option('-p, --provider <provider>', 'LLM provider to use (o3, gemini)', 'o3')
  .option('--model <model>', 'Model to use (provider-specific)')
  .option('--max-tokens <number>', 'Maximum tokens for completion', '10000')
  .option('--prompt <prompt>', 'Custom prompt for analysis')
  .action(async (options: { provider: string; model?: string; maxTokens: string; prompt?: string }) => {
    try {
      await processImages({
        provider: options.provider,
        model: options.model,
        maxTokens: parseInt(options.maxTokens, 10),
        prompt: options.prompt
      });
    } catch (error) {
      console.error('❌ Error during processing:', error);
      process.exit(1);
    }
  });

program.parse();