import chalk from 'chalk';
import type { WorkflowGraph } from '../graph/workflow-graph';
import { GraphConverter } from './graph-converter';

/**
 * Utility class for generating human-readable graph display output
 */
export class GraphDisplay {
  /**
   * Generate console-friendly graph analysis text
   */
  static generateGraphAnalysis(workflowGraph: WorkflowGraph): string {
    const output: string[] = [];

    output.push(chalk.bold('📊 Workflow Graph Analysis:'));

    // Basic graph info
    const graphData = workflowGraph.exportGraph();
    output.push(`  Total Nodes: ${graphData.nodes.length}`);
    output.push(`  Total Connections: ${graphData.edges.length}`);

    // Strongly Connected Components (Loops)
    const sccs = workflowGraph.getSCCs();
    const loopSCCs = workflowGraph.getLoopSCCs();
    output.push(`  Strongly Connected Components: ${sccs.length}`);
    output.push(`  Loop Components: ${loopSCCs.length}`);

    if (loopSCCs.length > 0) {
      output.push('');
      output.push(chalk.yellow('🔄 Loop Analysis:'));
      for (const scc of loopSCCs) {
        output.push(`    Loop ${scc.id}: [${scc.nodes.join(' ↔ ')}]`);
      }
    }

    // Execution Order
    try {
      const executionOrder = workflowGraph.getExecutionOrder();
      output.push('');
      output.push(chalk.blue('📋 Execution Order (by SCC):'));
      executionOrder.forEach((nodeGroup, index) => {
        const groupStr = nodeGroup.length > 1 ? `[${nodeGroup.join(', ')}]` : nodeGroup[0];
        output.push(`    ${index + 1}. ${groupStr}`);
      });
    } catch {
      output.push('');
      output.push(chalk.red('⚠️  Circular dependency detected - cannot determine execution order'));
    }

    // Node Dependencies (if there are any interesting relationships)
    if (graphData.nodes.length > 1) {
      output.push('');
      output.push(chalk.cyan('🔗 Node Dependencies:'));
      for (const node of graphData.nodes) {
        const dependencies = workflowGraph.getNodeDependencies(node.id);
        const dependents = workflowGraph.getNodeDependents(node.id);

        if (dependencies.length > 0 || dependents.length > 0) {
          output.push(`    ${node.name || node.id}:`);
          if (dependencies.length > 0) {
            output.push(`      ← Depends on: ${dependencies.join(', ')}`);
          }
          if (dependents.length > 0) {
            output.push(`      → Affects: ${dependents.join(', ')}`);
          }
        }
      }
    }

    return output.join('\n');
  }

  /**
   * Generate Mermaid diagrams using existing GraphConverter
   */
  static generateMermaidDiagrams(workflowGraph: WorkflowGraph): string {
    const output: string[] = [];

    // Original workflow graph
    const originalGraph = GraphConverter.convertOriginalGraph(workflowGraph);
    output.push(chalk.bold('📈 Original Workflow Graph:'));
    output.push(originalGraph.description?.text || '');
    output.push('');

    // Condensed DAG if there are loops
    if (workflowGraph.hasCircularDependencies()) {
      const condensedDAG = GraphConverter.convertCondensedDAG(workflowGraph);
      output.push(chalk.bold('🔄 Condensed DAG (Loop Analysis):'));
      output.push(condensedDAG.description?.text || '');
      output.push('');

      // Loop analysis
      const loopAnalysis = GraphConverter.convertLoopAnalysis(workflowGraph);
      if (loopAnalysis.nodes && loopAnalysis.nodes.length > 0) {
        output.push(chalk.bold('🔗 Loop Details:'));
        output.push(loopAnalysis.description?.text || '');
        output.push('');
      }
    }

    return output.join('\n');
  }

  /**
   * Generate comprehensive graph information combining analysis and diagrams
   */
  static generateFullGraphDisplay(workflowGraph: WorkflowGraph): string {
    const output: string[] = [];

    // Graph analysis
    output.push(GraphDisplay.generateGraphAnalysis(workflowGraph));
    output.push('');

    // Mermaid diagrams
    output.push(GraphDisplay.generateMermaidDiagrams(workflowGraph));

    return output.join('\n');
  }
}
