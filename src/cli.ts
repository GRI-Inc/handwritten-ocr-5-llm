#!/usr/bin/env node
import { program } from 'commander';
import { config } from 'dotenv';
import { initializeDirectories, processImages } from './handwritten-analyzer.ts';

// Load environment variables
config();

program
  .name('handwritten-analyzer')
  .description('Analyze handwritten text in images')
  .version('1.0.0');

// handwritten:initコマンド
program
  .command('init')
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
  .command('process')
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