import chalk from 'chalk';
import type { IWorkflowBase } from 'n8n-workflow';
import type { CheckResult, NodeCategories } from '../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../core/security-detection-item';
import type { WorkflowGraph } from '../graph/workflow-graph';
import { GraphDisplay } from '../utils/graph-display';

interface ISummary {
  passedCount: number;
  errorCount: number;
  warningCount: number;
  noteCount: number;
  totalDetections: number;
}

export class ConsoleReporter {
  constructor(private showGraph: boolean = false) {}

  report(
    checkResults: CheckResult[],
    workflowData: IWorkflowBase,
    nodeCategories?: NodeCategories,
    workflowGraph?: WorkflowGraph
  ): string {
    const output: string[] = [];
    const nodes = workflowData.nodes || [];

    // Header
    output.push('');
    output.push(chalk.blue.bold('=== n8n Workflow Security Analysis ==='));
    output.push('');

    // Workflow info
    output.push(chalk.bold('Workflow Information:'));
    output.push(`  Name: ${workflowData.name || 'Unnamed'}`);
    output.push(`  Total Nodes: ${nodes.length}`);
    output.push(`  Analysis Time: ${new Date().toLocaleString()}`);
    output.push('');

    // Security Summary
    const summary = this.createSummary(checkResults);
    output.push(chalk.bold('Security Analysis Summary:'));
    output.push(chalk.green(`  ✓ Checks Passed: ${summary.passedCount}`));
    output.push(chalk.yellow(`  ⚠ Warnings: ${summary.warningCount}`));
    output.push(chalk.red(`  ✗ Errors: ${summary.errorCount}`));
    output.push(chalk.blue(`  ℹ Notes: ${summary.noteCount}`));
    output.push(`  Total Detections: ${summary.totalDetections}`);
    output.push('');

    // Node Categories
    if (nodeCategories) {
      output.push(chalk.bold('Node Categories:'));
      if (nodeCategories.triggers.length > 0) {
        output.push(chalk.cyan(`  Triggers: ${nodeCategories.triggers.join(', ')}`));
      }
      if (nodeCategories.dataSources.length > 0) {
        output.push(chalk.yellow(`  Data Sources: ${nodeCategories.dataSources.join(', ')}`));
      }
      if (nodeCategories.outputs.length > 0) {
        output.push(chalk.magenta(`  Outputs: ${nodeCategories.outputs.join(', ')}`));
      }
      if (nodeCategories.others.length > 0) {
        output.push(chalk.gray(`  Others: ${nodeCategories.others.join(', ')}`));
      }
      output.push('');
    }

    // Security Detections by Severity
    const detectionsBySeverity = this.groupDetectionsBySeverity(checkResults);

    // Errors
    if (detectionsBySeverity.error.length > 0) {
      output.push(chalk.bold.red('🚨 Critical Security Issues:'));
      for (const detection of detectionsBySeverity.error) {
        output.push(chalk.red(`  ✗ ${detection.message.en}`));
        if (detection.nodeName) {
          output.push(chalk.dim(`    Node: ${detection.nodeName} (${detection.nodeId})`));
        }
        if (detection.relatedNodes && detection.relatedNodes.length > 0) {
          const relatedNames = detection.relatedNodes.map((n) => n.name).join(', ');
          output.push(chalk.dim(`    Related Nodes: ${relatedNames}`));
        }
      }
      output.push('');
    }

    // Warnings
    if (detectionsBySeverity.warning.length > 0) {
      output.push(chalk.bold.yellow('⚠️  Security Warnings:'));
      for (const detection of detectionsBySeverity.warning) {
        output.push(chalk.yellow(`  ⚠ ${detection.message.en}`));
        if (detection.nodeName) {
          output.push(chalk.dim(`    Node: ${detection.nodeName} (${detection.nodeId})`));
        }
        if (detection.relatedNodes && detection.relatedNodes.length > 0) {
          const relatedNames = detection.relatedNodes.map((n) => n.name).join(', ');
          output.push(chalk.dim(`    Related Nodes: ${relatedNames}`));
        }
      }
      output.push('');
    }

    // Notes
    if (detectionsBySeverity.note.length > 0) {
      output.push(chalk.bold.blue('ℹ️  Security Notes:'));
      for (const detection of detectionsBySeverity.note) {
        output.push(chalk.blue(`  ℹ ${detection.message.en}`));
        if (detection.nodeName) {
          output.push(chalk.dim(`    Node: ${detection.nodeName} (${detection.nodeId})`));
        }
        if (detection.relatedNodes && detection.relatedNodes.length > 0) {
          const relatedNames = detection.relatedNodes.map((n) => n.name).join(', ');
          output.push(chalk.dim(`    Related Nodes: ${relatedNames}`));
        }
      }
      output.push('');
    }

    // Informational
    if (detectionsBySeverity.none.length > 0) {
      output.push(chalk.bold.green('✅ Informational:'));
      for (const detection of detectionsBySeverity.none) {
        output.push(chalk.green(`  ✓ ${detection.message.en}`));
        if (detection.nodeName) {
          output.push(chalk.dim(`    Node: ${detection.nodeName} (${detection.nodeId})`));
        }
        if (detection.relatedNodes && detection.relatedNodes.length > 0) {
          const relatedNames = detection.relatedNodes.map((n) => n.name).join(', ');
          output.push(chalk.dim(`    Related Nodes: ${relatedNames}`));
        }
      }
      output.push('');
    }

    // Checker Results Summary
    if (this.showGraph) {
      output.push(chalk.bold('Detailed Checker Results:'));
      for (const result of checkResults) {
        const status = result.passed ? chalk.green('✓ PASSED') : chalk.red('✗ FAILED');
        output.push(
          `  ${status} ${result.checkerName} (${result.detectionItems.length} detections)`
        );
        if (!result.passed && result.detectionItems.length > 0) {
          for (const detection of result.detectionItems) {
            const severityIcon = this.getSeverityIcon(detection.severity);
            output.push(`    ${severityIcon} ${detection.message.en}`);
          }
        }
      }
      output.push('');

      // Graph Analysis using GraphDisplay utility
      if (workflowGraph) {
        output.push(GraphDisplay.generateFullGraphDisplay(workflowGraph));
        output.push('');
      }
    }

    // Risk Assessment
    const overallRisk = this.calculateOverallRisk(summary);
    const riskColor =
      overallRisk === 'high' ? chalk.red : overallRisk === 'medium' ? chalk.yellow : chalk.green;

    output.push(chalk.bold('Overall Security Assessment:'));
    output.push(`  Risk Level: ${riskColor(overallRisk.toUpperCase())}`);
    output.push('');

    // Footer
    output.push(chalk.blue.bold('=== End of Analysis ==='));
    output.push('');

    return output.join('\n');
  }

  private createSummary(checkResults: CheckResult[]) {
    const summary = {
      passedCount: 0,
      errorCount: 0,
      warningCount: 0,
      noteCount: 0,
      totalDetections: 0,
    };

    for (const result of checkResults) {
      if (result.passed) {
        summary.passedCount++;
      }

      for (const detection of result.detectionItems) {
        summary.totalDetections++;
        switch (detection.severity) {
          case 'error':
            summary.errorCount++;
            break;
          case 'warning':
            summary.warningCount++;
            break;
          case 'note':
            summary.noteCount++;
            break;
        }
      }
    }

    return summary;
  }

  private groupDetectionsBySeverity(checkResults: CheckResult[]) {
    const groups = {
      error: [] as ISecurityDetectionItem[],
      warning: [] as ISecurityDetectionItem[],
      note: [] as ISecurityDetectionItem[],
      none: [] as ISecurityDetectionItem[],
    };

    for (const result of checkResults) {
      for (const detection of result.detectionItems) {
        groups[detection.severity].push(detection);
      }
    }

    return groups;
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'error':
        return chalk.red('✗');
      case 'warning':
        return chalk.yellow('⚠');
      case 'note':
        return chalk.blue('ℹ');
      default:
        return chalk.gray('•');
    }
  }

  private calculateOverallRisk(summary: ISummary): 'low' | 'medium' | 'high' {
    if (summary.errorCount > 0) {
      return 'high';
    } else if (summary.warningCount > 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}
