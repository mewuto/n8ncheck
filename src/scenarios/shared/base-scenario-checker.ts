import type { INode, IWorkflowBase } from 'n8n-workflow';
import type { ExtractedValues } from '../../core/extracted-values.types';
import type {
  CheckerType,
  CheckResult,
  IChecker,
  ICheckerContext,
} from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import type { WorkflowGraph } from '../../graph/workflow-graph';
import { createLogger } from '../../utils/logger';

/**
 * Abstract base class for scenario-level checkers
 * Analyzes workflow scenarios for security and compliance
 */
export abstract class BaseScenarioChecker<T extends ExtractedValues = ExtractedValues>
  implements IChecker<T>
{
  readonly type: CheckerType = 'scenario';
  protected graph: WorkflowGraph;
  protected nodes: Map<string, INode>;
  protected workflow: IWorkflowBase;
  protected logger = createLogger(`ScenarioChecker`);

  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    protected context: ICheckerContext
  ) {
    this.logger.setComponent(`ScenarioChecker:${this.name}`);
    this.workflow = context.workflow;
    this.graph = context.graph;
    this.nodes = context.nodes;
  }

  /**
   * Perform scenario-specific security checks
   */
  abstract checkScenario(): ISecurityDetectionItem<T>[];

  /**
   * Check if this checker is applicable for the given context
   * Must be implemented by each scenario checker
   */
  abstract isApplicable(context: ICheckerContext): boolean;

  /**
   * Execute the checker
   */
  check(): CheckResult<T> {
    // Check if this scenario is applicable to the current context
    if (!this.isApplicable(this.context)) {
      return {
        checkerId: this.id,
        checkerName: this.name,
        passed: true,
        detectionItems: [],
      };
    }

    const detectionItems = this.checkScenario();

    return {
      checkerId: this.id,
      checkerName: this.name,
      passed: detectionItems.length === 0,
      detectionItems,
    };
  }

  /**
   * Get node by ID
   */
  protected getNodeById(id: string): INode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Log scenario check result
   */
  protected log(message: string, indent: number = 0): void {
    const prefix = '  '.repeat(indent);
    this.logger.debug(`${prefix}${message}`);
  }

  /**
   * Get direct downstream nodes (immediate successors)
   */
  protected getDownstreamNodes(nodeId: string): INode[] {
    const downstreamIds = this.graph.getNodeDependents(nodeId);
    return this.convertIdsToNodes(downstreamIds);
  }

  /**
   * Get all downstream nodes recursively (all reachable nodes)
   */
  protected getAllDownstreamNodes(nodeId: string): INode[] {
    const downstreamIds = this.graph.getAllSubsequentNodes(nodeId);
    return this.convertIdsToNodes(downstreamIds);
  }

  /**
   * Convert node IDs to INode objects
   */
  private convertIdsToNodes(nodeIds: string[]): INode[] {
    return nodeIds
      .map((id) => this.nodes.get(id))
      .filter((node): node is INode => node !== undefined);
  }
}
