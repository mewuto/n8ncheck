import type { INode, IWorkflowBase } from 'n8n-workflow';
import type { WorkflowGraph } from '../../graph/workflow-graph';
import type { ExtractedValues } from '../extracted-values.types';
import type { ISecurityDetectionItem } from '../security-detection-item';

/**
 * Type of checker
 */
export type CheckerType = 'node' | 'scenario';

/**
 * Context provided to checkers during execution
 */
export interface ICheckerContext {
  workflow: IWorkflowBase;
  graph: WorkflowGraph;
  nodes: Map<string, INode>;
  // Node is only provided for node-level checkers
  node?: INode;
}

/**
 * Node categories for classification
 */
export type NodeCategory = 'trigger' | 'dataSource' | 'output' | 'other';

/**
 * Node categories aggregated from checker results
 */
export type NodeCategories = {
  triggers: string[];
  dataSources: string[];
  outputs: string[];
  others: string[];
};

/**
 * Result from a checker execution
 */
export interface ICheckResult<T extends ExtractedValues = ExtractedValues> {
  checkerId: string;
  checkerName: string;
  passed: boolean;
  detectionItems: ISecurityDetectionItem<T>[];

  // Node categorization based on actual operations
  nodeCategories?: NodeCategories;
}

/**
 * Unified interface for all checkers
 */
export interface IChecker<T extends ExtractedValues = ExtractedValues> {
  /**
   * Unique identifier for this checker
   */
  readonly id: string;

  /**
   * Human-readable name for this checker
   */
  readonly name: string;

  /**
   * Type of checker (node or scenario)
   */
  readonly type: CheckerType;

  /**
   * Description of what this checker does
   */
  readonly description: string;

  /**
   * Execute the checker
   * For node checkers: expects the node to check
   * For scenario checkers: no additional parameters needed
   */
  check(node?: INode): ICheckResult<T>;

  /**
   * Check if this checker is applicable for the given context
   */
  isApplicable(context: ICheckerContext): boolean;
}

// Backward compatibility
export type CheckResult<T extends ExtractedValues = ExtractedValues> = ICheckResult<T>;
