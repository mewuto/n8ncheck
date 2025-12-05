#!/usr/bin/env node

import * as fs from 'node:fs';
import { Command } from 'commander';
import { WorkflowAnalyzer } from './core/analyzer';
import { ConsoleReporter } from './reporters/console-reporter';
import { JsonReporter } from './reporters/json-reporter';
import { PRCommentReporter } from './reporters/pr-comment-reporter';
import { createLogger, LogLevel } from './utils/logger';
import { loadWorkflowFile } from './utils/workflow-loader';

// Command options types
interface IAnalyzeOptions {
  format: 'console' | 'json' | 'pr-comment';
  output?: string;
  graph: boolean;
}

const program = new Command();

program
  .name('n8ncheck')
  .description('Security checker for n8n workflows')
  .version('1.0.0');

// Analyze command
program
  .command('analyze <workflow-file>')
  .description('Analyze a single n8n workflow for security vulnerabilities')
  .option('-f, --format <type>', 'Output format (console, json, pr-comment)', 'console')
  .option('-o, --output <file>', 'Output file path')
  .option('-g, --graph', 'Show detailed DAG/SCC graph information', false)
  .action(async (workflowFile: string, options: IAnalyzeOptions) => {
    // Initialize logger
    const logger = createLogger('CLI', LogLevel.INFO);

    try {
      logger.progress('Analyzing workflow...');

      // Load workflow
      const workflowData = loadWorkflowFile(workflowFile);

      // Initialize analyzer
      const analyzer = new WorkflowAnalyzer();

      // Analyze workflow
      const { checkResults, workflowGraph, aggregatedCategories } =
        await analyzer.analyze(workflowData);

      // Generate report
      let reportOutput: string;
      if (options.format === 'json') {
        // JSON reports with graph information
        const reporter = new JsonReporter(true);
        reportOutput = reporter.generateSARIFReport(checkResults, workflowData.name, workflowGraph);
      } else if (options.format === 'pr-comment') {
        // PR comment format
        const reporter = new PRCommentReporter(options.graph);
        reportOutput = reporter.generateComment(workflowData, checkResults, workflowGraph);
      } else {
        // Console reports
        const reporter = new ConsoleReporter(options.graph);
        reportOutput = reporter.report(
          checkResults,
          workflowData,
          aggregatedCategories,
          workflowGraph
        );
      }

      // Output report
      if (options.output) {
        fs.writeFileSync(options.output, reportOutput);
        logger.success(`Report saved to: ${options.output}`);
      } else {
        console.log(reportOutput);
      }

      // Analysis completed successfully - exit with code 0 regardless of detections
      // The purpose of this tool is to report security detections, not to fail CI/CD
      process.exit(0);
    } catch (error) {
      logger.error('Analysis failed', error instanceof Error ? error : undefined);
      process.exit(3);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
