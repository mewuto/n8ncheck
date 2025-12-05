import type { CheckResult } from '../core/interfaces/checker.interface';
import type { WorkflowGraph } from '../graph/workflow-graph';
import { generateISarifLog } from '../utils/sarif-generator';

export class JsonReporter {
  constructor(private pretty: boolean = true) {}

  /**
   * Generate SARIF 2.1.0 compliant security report for AWS CodeCatalyst
   */
  generateSARIFReport(
    checkResults: CheckResult[],
    workflowName: string,
    workflowGraph?: WorkflowGraph
  ): string {
    const sarifLog = generateISarifLog(checkResults, workflowName, workflowGraph);
    return this.pretty ? JSON.stringify(sarifLog, null, 2) : JSON.stringify(sarifLog);
  }
}
