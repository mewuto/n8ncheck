import * as path from 'node:path';
import { createCheckerContext } from '../../../core';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { createLogger } from '../../../utils/logger';
import { loadWorkflowFile } from '../../../utils/workflow-loader';
import { BigQueryChecker } from '../checker';
import type { IBigQueryExtractedValues } from '../types';

/**
 * Load fixture and run BigQueryChecker
 * This simulates the exact same execution path as production
 */
export function analyzeFixture(
  filename: string
): ISecurityDetectionItem<IBigQueryExtractedValues>[] {
  const logger = createLogger('BigQueryTest');

  try {
    // Load fixture from local fixtures directory
    const fixturesDir = path.join(__dirname, 'fixtures');
    const fixturePath = path.join(fixturesDir, filename);
    const workflow = loadWorkflowFile(fixturePath);

    // Create context directly
    const context = createCheckerContext(workflow);

    // Create checker instance
    const checker = new BigQueryChecker(context);

    // Find BigQuery nodes and run checker
    const bigQueryNodes = workflow.nodes.filter((node) =>
      checker.getSupportedNodeTypes().includes(node.type)
    );

    // Run checker on all BigQuery nodes
    const results: ISecurityDetectionItem<IBigQueryExtractedValues>[] = [];
    for (const node of bigQueryNodes) {
      const nodeResults = checker.checkNode(node);
      results.push(...nodeResults);
    }

    return results;
  } catch (error) {
    logger.error('Error running checker', error instanceof Error ? error : undefined);
    throw error;
  }
}
