/**
 * Reporter for PR comments with Japanese/English bilingual support
 */

import type { IWorkflowBase } from 'n8n-workflow';
import type { CheckResult, NodeCategories } from '../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../core/security-detection-item';
import type { WorkflowGraph } from '../graph/workflow-graph';
import type { SeverityLevel } from '../types/core/sarif-report.types';
import { GraphDisplay } from '../utils/graph-display';
import { i18n } from '../utils/i18n-messages';

type RiskLevel = 'Low' | 'Medium' | 'High';

type IGroupedDetections = Record<SeverityLevel, ISecurityDetectionItem[]>;

interface IWorkflowSummary {
  totalNodes: number;
  nodeTypes: string[];
  riskLevel: RiskLevel;
  triggers: string[];
  dataSources: string[];
  outputs: string[];
  others: string[];
  timeSavedPerExecution?: number;
}

export class PRCommentReporter {
  private readonly maxDetectionsPerLevel = 300;

  constructor(private showGraph: boolean = false) {}

  /**
   * Generate Markdown for PR comments
   */
  generateComment(
    workflowData: IWorkflowBase,
    checkResults: CheckResult[],
    workflowGraph?: WorkflowGraph
  ): string {
    const grouped = this.groupDetectionsBySeverity(checkResults);
    const summary = this.generateWorkflowSummaryFromResults(workflowData, checkResults, grouped);

    const jaSections: string[] = [];
    const enSections: string[] = [];

    // Generate Japanese sections
    jaSections.push(this.generateHeader(workflowData, 'ja'));
    jaSections.push(this.generateSummary(summary, 'ja'));
    jaSections.push(this.generateSecurityDetections(grouped, 'ja'));
    jaSections.push(this.generatePreChecklist('ja'));

    if (this.showGraph && workflowGraph) {
      jaSections.push(this.generateGraphAnalysis(workflowGraph, 'ja'));
    }

    // Generate English sections
    enSections.push(this.generateHeader(workflowData, 'en'));
    enSections.push(this.generateSummary(summary, 'en'));
    enSections.push(this.generateSecurityDetections(grouped, 'en'));
    enSections.push(this.generatePreChecklist('en'));

    if (this.showGraph && workflowGraph) {
      enSections.push(this.generateGraphAnalysis(workflowGraph, 'en'));
    }

    // Combine all Japanese sections, then separator, then all English sections
    return `${jaSections.join('\n\n')}\n\n---\n\n${enSections.join('\n\n')}`;
  }

  private groupDetectionsBySeverity(checkResults: CheckResult[]): IGroupedDetections {
    const grouped: IGroupedDetections = {
      error: [],
      warning: [],
      note: [],
      none: [],
    };

    for (const result of checkResults) {
      for (const item of result.detectionItems) {
        const level = item.severity;
        grouped[level].push(item);
      }
    }

    return grouped;
  }

  private generateWorkflowSummaryFromResults(
    workflowData: IWorkflowBase,
    checkResults: CheckResult[],
    grouped: IGroupedDetections
  ): IWorkflowSummary {
    // Aggregate node categories from all checkers
    const aggregatedCategories: NodeCategories = {
      triggers: [],
      dataSources: [],
      outputs: [],
      others: [],
    };

    const nodeTypes = new Set<string>();

    for (const result of checkResults) {
      if (result.nodeCategories) {
        aggregatedCategories.triggers.push(...result.nodeCategories.triggers);
        aggregatedCategories.dataSources.push(...result.nodeCategories.dataSources);
        aggregatedCategories.outputs.push(...result.nodeCategories.outputs);
        aggregatedCategories.others.push(...result.nodeCategories.others);
      }

      // Collect node types from detection items
      for (const item of result.detectionItems) {
        if (item.nodeType) {
          nodeTypes.add(item.nodeType);
        }
      }
    }

    // Remove duplicates
    aggregatedCategories.triggers = [...new Set(aggregatedCategories.triggers)];
    aggregatedCategories.dataSources = [...new Set(aggregatedCategories.dataSources)];
    aggregatedCategories.outputs = [...new Set(aggregatedCategories.outputs)];
    aggregatedCategories.others = [...new Set(aggregatedCategories.others)];

    // Determine risk level based on findings
    let riskLevel: RiskLevel = 'Low';
    if (grouped.error.length > 0) {
      riskLevel = 'High';
    } else if (grouped.warning.length > 0) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    const totalNodes = workflowData.nodes?.length || 0;
    const timeSavedPerExecution = workflowData.settings?.timeSavedPerExecution;

    return {
      totalNodes,
      nodeTypes: Array.from(nodeTypes),
      riskLevel,
      triggers: aggregatedCategories.triggers,
      dataSources: aggregatedCategories.dataSources,
      outputs: aggregatedCategories.outputs,
      others: aggregatedCategories.others,
      timeSavedPerExecution,
    };
  }

  private generateHeader(workflowData: IWorkflowBase, lang: 'ja' | 'en'): string {
    const lines = [
      `# ${i18n.headers.securityCheckResults[lang]}`,
      '',
      `**${i18n.fields.workflowId[lang]}:** \`${workflowData.id}\``,
      `**${i18n.fields.workflowName[lang]}:** \`${workflowData.name}\``,
      `**${i18n.fields.analysisDate[lang]}:** ${this.formatDate(new Date())}`,
    ];

    return lines.join('\n');
  }

  private generateSummary(summary: IWorkflowSummary, lang: 'ja' | 'en'): string {
    const riskEmoji = this.getRiskLevelEmoji(summary.riskLevel);
    const riskLevel = summary.riskLevel;

    const lines = [
      `## ${i18n.headers.resourceSummary[lang]}`,
      '',
      `- **${i18n.fields.nodes[lang]}:** ${summary.totalNodes} total`,
    ];

    // Add risk-level-specific action message with emoji
    if (riskLevel === 'High') {
      const actionMessage =
        lang === 'ja'
          ? `${i18n.severityLevels.criticalIssues[lang]}${i18n.riskLevelActions.highAction[lang]}`
          : `Please review the ${i18n.severityLevels.criticalIssues[lang]}${i18n.riskLevelActions.highAction[lang]}`;
      lines.push(`- **Action:** ${riskEmoji} ${actionMessage}`);
    } else if (riskLevel === 'Medium') {
      const actionMessage =
        lang === 'ja'
          ? `${i18n.severityLevels.warnings[lang]}${i18n.riskLevelActions.mediumAction[lang]}`
          : `Please review the ${i18n.severityLevels.warnings[lang]}${i18n.riskLevelActions.mediumAction[lang]}`;
      lines.push(`- **Action:** ${riskEmoji} ${actionMessage}`);
    } else {
      lines.push(`- **Action:** ${riskEmoji} ${i18n.riskLevelActions.lowAction[lang]}`);
    }

    // Input/Trigger
    if (summary.triggers.length > 0) {
      lines.push(`- **${i18n.fields.inputTrigger[lang]}:** ${summary.triggers.join(', ')}`);
    }

    // Data Sources
    if (summary.dataSources.length > 0) {
      lines.push(`- **${i18n.fields.dataSources[lang]}:** ${summary.dataSources.join(', ')}`);
    }

    // Output/Destination
    if (summary.outputs.length > 0) {
      lines.push(`- **${i18n.fields.outputDestination[lang]}:** ${summary.outputs.join(', ')}`);
    }

    // Others (for administrator review)
    if (summary.others.length > 0) {
      lines.push(`- **${i18n.fields.others[lang]}:** ${summary.others.join(', ')}`);
      lines.push(`  ${i18n.fields.othersNote[lang]}`);
    }

    // Time Saved Per Execution
    if (summary.timeSavedPerExecution !== undefined) {
      lines.push(
        `- **${i18n.fields.timeSavedPerExecution[lang]}:** ${summary.timeSavedPerExecution} minutes`
      );
    }

    return lines.join('\n');
  }

  private generateSecurityDetections(grouped: IGroupedDetections, lang: 'ja' | 'en'): string {
    const sections: string[] = [`## ${i18n.headers.securityDetections[lang]}`];

    // Critical Issues
    if (grouped.error.length > 0) {
      sections.push(
        this.generateDetectionSection(
          `${this.getSeverityEmoji('error')} ${i18n.severityLevels.criticalIssues[lang]}`,
          grouped.error,
          'error',
          lang
        )
      );
    }

    // Warnings
    if (grouped.warning.length > 0) {
      sections.push(
        this.generateDetectionSection(
          `${this.getSeverityEmoji('warning')} ${i18n.severityLevels.warnings[lang]}`,
          grouped.warning,
          'warning',
          lang
        )
      );
    }

    // Notes
    if (grouped.note.length > 0) {
      sections.push(
        this.generateDetectionSection(
          `${this.getSeverityEmoji('note')} ${i18n.severityLevels.notes[lang]}`,
          grouped.note,
          'note',
          lang
        )
      );
    }

    // None (informational)
    if (grouped.none.length > 0) {
      sections.push(
        this.generateDetectionSection(
          `${this.getSeverityEmoji('none')} ${i18n.severityLevels.informational[lang]}`,
          grouped.none,
          'none',
          lang
        )
      );
    }

    return sections.join('\n\n');
  }

  private generateDetectionSection(
    title: string,
    detections: ISecurityDetectionItem[],
    level: string,
    lang: 'ja' | 'en' = 'en'
  ): string {
    const displayDetections = detections.slice(0, this.maxDetectionsPerLevel);
    const hasMore = detections.length > this.maxDetectionsPerLevel;

    const lines = [`### ${title} (${detections.length})`];

    for (const detection of displayDetections) {
      const nodeInfo = detection.nodeName ? ` [${detection.nodeName}]` : '';
      const typeInfo = detection.nodeType ? ` (${detection.nodeType})` : '';

      // Handle multi-line messages by properly indenting continuation lines
      const message = this.formatMultiLineMessage(detection.message[lang]);
      lines.push(`- ${nodeInfo}${typeInfo} ${message}`);
    }

    if (hasMore) {
      lines.push(`- *... and ${detections.length - this.maxDetectionsPerLevel} more ${level}s*`);
    }

    return lines.join('\n');
  }

  /**
   * Format multi-line messages for proper display in markdown lists
   */
  private formatMultiLineMessage(message: string): string {
    const lines = message.split('\n');
    if (lines.length === 1) {
      return message;
    }

    // First line as-is, subsequent lines with proper indentation for nested list items
    const formattedLines = [lines[0]];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Add proper indentation for continuation lines
        formattedLines.push(`  ${line}`);
      } else {
        // Preserve empty lines for markdown formatting
        formattedLines.push('');
      }
    }

    return formattedLines.join('\n');
  }

  private getRiskLevelEmoji(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'High':
        return '🔴';
      case 'Medium':
        return '🟠';
      case 'Low':
        return '🟢';
      default:
        return '⚪';
    }
  }

  private getSeverityEmoji(severity: SeverityLevel): string {
    switch (severity) {
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'note':
        return '💡';
      case 'none':
        return '✅';
      default:
        return '⚪';
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate markdown-formatted graph analysis section
   */
  private generateGraphAnalysis(workflowGraph: WorkflowGraph, lang: 'ja' | 'en'): string {
    const lines = [`## ${i18n.headers.workflowGraphAnalysis[lang]}`];

    // Basic graph info
    const graphData = workflowGraph.exportGraph();
    lines.push('');
    lines.push(`- **${i18n.fields.totalNodes[lang]}:** ${graphData.nodes.length}`);
    lines.push(`- **${i18n.fields.totalConnections[lang]}:** ${graphData.edges.length}`);

    // Strongly Connected Components (Loops)
    const sccs = workflowGraph.getSCCs();
    const loopSCCs = workflowGraph.getLoopSCCs();
    lines.push(`- **${i18n.fields.stronglyConnectedComponents[lang]}:** ${sccs.length}`);
    lines.push(`- **${i18n.fields.loopComponents[lang]}:** ${loopSCCs.length}`);

    if (loopSCCs.length > 0) {
      lines.push('');
      lines.push(`### ${i18n.fields.loopAnalysis[lang]}`);
      for (const scc of loopSCCs) {
        const loopLabel = lang === 'ja' ? `ループ ${scc.id}` : `Loop ${scc.id}`;
        lines.push(`- **${loopLabel}:** ${scc.nodes.join(' ↔ ')}`);
      }
    }

    // Execution Order
    try {
      const executionOrder = workflowGraph.getExecutionOrder();
      lines.push('');
      lines.push(`### ${i18n.fields.executionOrder[lang]}`);
      executionOrder.forEach((nodeGroup, index) => {
        const groupStr = nodeGroup.length > 1 ? `[${nodeGroup.join(', ')}]` : nodeGroup[0];
        lines.push(`${index + 1}. ${groupStr}`);
      });
    } catch {
      lines.push('');
      lines.push(i18n.fields.circularDependencyDetected[lang]);
    }

    // Mermaid diagrams
    const mermaidDiagrams = GraphDisplay.generateMermaidDiagrams(workflowGraph);
    if (mermaidDiagrams.trim()) {
      lines.push('');
      lines.push(`### ${i18n.fields.workflowDiagrams[lang]}`);
      lines.push('');
      lines.push('<details>');
      lines.push(`<summary>${i18n.fields.clickToExpand[lang]}</summary>`);
      lines.push('');
      lines.push(mermaidDiagrams);
      lines.push('</details>');
    }

    return lines.join('\n');
  }

  /**
   * Generate pre-checklist from z-guide.md with role-based separation
   */
  private generatePreChecklist(lang: 'ja' | 'en'): string {
    const lines = [
      `# ${i18n.headers.preChecklistItems[lang]}`,
      '',
      `### ${i18n.checklist.userTitle[lang]}`,
      `- [ ] ${i18n.checklist.user.credentialsAndPermissions[lang]}`,
      '',
      `### ${i18n.checklist.approverTitle[lang]}`,
      `- [ ] ${i18n.checklist.approver.securityDetections[lang]}`,
      `- [ ] ${i18n.checklist.approver.permissionConsistency[lang]}`,
      `- [ ] ${i18n.checklist.approver.teamBoundary[lang]}`,
    ];

    return lines.join('\n');
  }
}
