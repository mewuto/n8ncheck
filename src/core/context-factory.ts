import type { IWorkflowBase } from 'n8n-workflow';
import { WorkflowGraph } from '../graph/workflow-graph';
import type { ICheckerContext } from './interfaces/checker.interface';

/**
 * Factory function to create CheckerContext from workflow data
 * Used by both production analyzer and test environments
 */
export function createCheckerContext(workflow: IWorkflowBase): ICheckerContext {
  const nodes = workflow.nodes || [];
  const connections = workflow.connections || {};

  // Create workflow graph
  const graph = new WorkflowGraph(nodes, connections);
  const nodesMap = new Map(nodes.map((n) => [n.id, n]));

  return {
    workflow,
    graph,
    nodes: nodesMap,
  };
}
