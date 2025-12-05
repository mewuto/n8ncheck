import type { CheckResult } from '../core/interfaces/checker.interface';
import type { WorkflowGraph } from '../graph/workflow-graph';
import type {
  IIReportingDescriptor,
  IISarifLog,
  IResult,
  IRun,
} from '../types/core/sarif-report.types';
import { GraphConverter } from './graph-converter';

/**
 * Generate SARIF 2.1.0 compliant security report object
 * This is a pure function that creates a typed IISarifLog object from check results
 */
export function generateISarifLog(
  checkResults: CheckResult[],
  workflowName: string,
  workflowGraph?: WorkflowGraph
): IISarifLog {
  const rulesMap = new Map<string, IIReportingDescriptor>();
  const results: IResult[] = [];
  let ruleIndex = 0;

  // Process each check result
  for (const checkResult of checkResults) {
    // Add rule to rules map if not exists
    if (!rulesMap.has(checkResult.checkerId)) {
      rulesMap.set(checkResult.checkerId, {
        id: checkResult.checkerId,
      });
    }

    // Convert each detection to SARIF result
    for (const detection of checkResult.detectionItems) {
      results.push({
        ruleId: detection.detectionCode,
        ruleIndex: ruleIndex,
        level: detection.severity,
        message: {
          text: detection.message.en,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri: `n8n://workflow/${workflowName}`,
              },
              region: {
                startLine: 1,
                startColumn: 1,
                endLine: 1,
                endColumn: 1,
              },
            },
          },
        ],
        properties: {
          n8n: {
            checkerId: detection.checkerId,
            nodeId: detection.nodeId || '',
            nodeName: detection.nodeName || '',
            nodeType: detection.nodeType || 'unknown',
            relatedNodes: detection.relatedNodes || [],
            extractedValues: detection.extractedValues,
            analysisMethod: detection.analysisMethod,
            confidence: detection.confidence,
          },
        },
      });
    }
    ruleIndex++;
  }

  const run: IRun = {
    tool: {
      driver: {
        name: 'n8n-security-checker',
        rules: Array.from(rulesMap.values()),
      },
    },
    results,
    graphs: workflowGraph ? generateGraphs(workflowGraph) : undefined,
  };

  return {
    $schema: 'https://www.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [run],
  };
}

/**
 * Generate graph information for SARIF report
 */
function generateGraphs(workflowGraph: WorkflowGraph) {
  const graphs = [];

  // Add original workflow graph
  graphs.push(GraphConverter.convertOriginalGraph(workflowGraph));

  // Add condensed DAG if there are loops
  if (workflowGraph.hasCircularDependencies()) {
    graphs.push(GraphConverter.convertCondensedDAG(workflowGraph));

    // Add loop analysis
    const loopAnalysis = GraphConverter.convertLoopAnalysis(workflowGraph);
    if (loopAnalysis.nodes && loopAnalysis.nodes.length > 0) {
      graphs.push(loopAnalysis);
    }
  }

  return graphs;
}
