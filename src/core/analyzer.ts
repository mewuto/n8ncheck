import type { INode, IWorkflowBase } from 'n8n-workflow';
import type { WorkflowGraph } from '../graph/workflow-graph';
import { createLogger } from '../utils/logger';
import { createCheckerContext } from './context-factory';
import type {
  CheckResult,
  IChecker,
  ICheckerContext,
  NodeCategories,
} from './interfaces/checker.interface';
import { NodeClassifier } from './node-classifier';
import { CheckerRegistry } from './registry/checker-registry';

/**
 * SARIF-compliant workflow analyzer
 * Focuses on CheckResult aggregation rather than node classification
 */
export class WorkflowAnalyzer {
  private checkerRegistry: CheckerRegistry;
  private nodeClassifier: NodeClassifier;
  private logger = createLogger('Analyzer');

  constructor() {
    this.checkerRegistry = new CheckerRegistry();
    this.nodeClassifier = new NodeClassifier();
  }

  /**
   * Analyze a workflow for security issues using SARIF-compliant checkers
   * Returns CheckResult array and WorkflowGraph for SARIF report generation
   */
  async analyze(workflowData: IWorkflowBase): Promise<{
    checkResults: CheckResult[];
    workflowGraph: WorkflowGraph;
    aggregatedCategories: NodeCategories;
  }> {
    // Create checker context
    const context = createCheckerContext(workflowData);

    // Create checkers with context
    const checkers = this.checkerRegistry.createCheckers(context);

    // Run all checkers and collect results
    const nodes = context.workflow.nodes || [];
    const checkResults = await this.runAllCheckers(nodes, checkers, context);

    // Aggregate categories from all check results
    const aggregatedCategories = this.aggregateNodeCategories(checkResults);

    return {
      checkResults,
      workflowGraph: context.graph,
      aggregatedCategories,
    };
  }

  /**
   * Aggregate node categories from all check results
   */
  private aggregateNodeCategories(checkResults: CheckResult[]): NodeCategories {
    const aggregated = {
      triggers: new Set<string>(),
      dataSources: new Set<string>(),
      outputs: new Set<string>(),
      others: new Set<string>(),
    };

    for (const result of checkResults) {
      if (result.nodeCategories) {
        for (const category of Object.keys(result.nodeCategories) as Array<
          keyof typeof aggregated
        >) {
          for (const nodeName of result.nodeCategories[category]) {
            aggregated[category].add(nodeName);
          }
        }
      }
    }

    return {
      triggers: Array.from(aggregated.triggers),
      dataSources: Array.from(aggregated.dataSources),
      outputs: Array.from(aggregated.outputs),
      others: Array.from(aggregated.others),
    };
  }

  /**
   * Run all checkers and collect results for SARIF report
   */
  private async runAllCheckers(
    nodes: INode[],
    checkers: IChecker[],
    context: ICheckerContext
  ): Promise<CheckResult[]> {
    const checkResults: CheckResult[] = [];

    // Run node checkers
    const nodeCheckers = this.checkerRegistry.getNodeCheckers(checkers);

    for (const node of nodes) {
      const classification = this.nodeClassifier.classify(node.type);
      let checked = false;

      if (classification === 'safe') {
        // Safe nodes - create 'none' level result
        checkResults.push({
          checkerId: 'safe-node-classifier',
          checkerName: 'Safe Node Classifier',
          passed: true,
          detectionItems: [
            {
              checkerId: 'safe-node-classifier',
              detectionCode: 'SAFE_NODE_CONFIRMED',
              severity: 'none',
              message: {
                ja: '安全',
                en: 'safe',
              },
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
              extractedValues: {},
              analysisMethod: 'static' as const,
              confidence: 1.0,
            },
          ],
        });
      } else if (classification === 'review_required') {
        const reviewInfo = this.nodeClassifier.getReviewRequiredNodeInfo(node.type);

        if (reviewInfo?.hasChecker) {
          // Has checker - delegate to checker
          for (const checker of nodeCheckers) {
            const nodeContext = { ...context, node };

            if (checker.isApplicable(nodeContext)) {
              try {
                const result = checker.check(node);
                checkResults.push(result);
                checked = true;
                break;
              } catch (error) {
                this.logger.error(
                  `Error occurred in node checker "${checker.name}"`,
                  error instanceof Error ? error : undefined
                );
              }
            }
          }
        }

        if (!checked) {
          // No checker implemented or checker failed - create warning
          const connectionType = reviewInfo?.externalConnection ? 'external' : 'internal';
          checkResults.push({
            checkerId: 'unimplemented-node-checker',
            checkerName: 'Unimplemented Node Checker',
            passed: false,
            nodeCategories: {
              triggers: [],
              dataSources: [],
              outputs: [],
              others: [node.type],
            },
            detectionItems: [
              {
                checkerId: 'unimplemented-node-checker',
                detectionCode: 'UNIMPLEMENTED_NODE_REVIEW_REQUIRED',
                severity: 'warning',
                message: {
                  ja: `ノードタイプ "${node.type}" (${connectionType === 'external' ? '外部' : connectionType}接続) はチェッカーが未定義のため手動レビューが必要です`,
                  en: `Node type "${node.type}" (${connectionType} connection) requires manual review as checker is not defined`,
                },
                nodeId: node.id,
                nodeName: node.name,
                nodeType: node.type,
                extractedValues: {
                  nodeType: node.type,
                  classification: 'review_required',
                  externalConnection: reviewInfo?.externalConnection || false,
                  hasChecker: reviewInfo?.hasChecker || false,
                  checkerId: reviewInfo?.checkerId,
                },
                analysisMethod: 'static' as const,
                confidence: 1.0,
              },
            ],
          });
        }
      } else {
        // Unknown nodes - create 'note' level result
        checkResults.push({
          checkerId: 'unknown-node-classifier',
          checkerName: 'Unknown Node Classifier',
          passed: true,
          detectionItems: [
            {
              checkerId: 'unknown-node-classifier',
              detectionCode: 'UNKNOWN_NODE_NEEDS_CLASSIFICATION',
              severity: 'warning',
              message: {
                ja: `新しいノードタイプ "${node.type}" が発見されました - レビューと分類をお願いします`,
                en: `New node type "${node.type}" discovered - please review and classify`,
              },
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
              extractedValues: {
                nodeType: node.type,
                classification: 'unknown',
              },
              analysisMethod: 'static' as const,
              confidence: 1.0,
            },
          ],
        });
      }
    }

    // Run scenario checkers
    const scenarioCheckers = this.checkerRegistry.getScenarioCheckers(checkers);
    for (const checker of scenarioCheckers) {
      if (checker.isApplicable(context)) {
        try {
          const result = checker.check();
          checkResults.push(result);
        } catch (error) {
          this.logger.error(
            `シナリオチェッカー "${checker.name}" でエラーが発生しました`,
            error instanceof Error ? error : undefined
          );
        }
      }
    }

    return checkResults;
  }
}
