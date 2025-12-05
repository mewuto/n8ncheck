import * as path from 'node:path';
import { createCheckerContext } from '../../../core';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { createLogger } from '../../../utils/logger';
import { loadWorkflowFile } from '../../../utils/workflow-loader';
import { GoogleSheetsChecker } from '../checker';
import type { IGoogleSheetsExtractedValues } from '../types';

/**
 * Load fixture and run GoogleSheetsChecker
 * This simulates the exact same execution path as production
 */
export function analyzeFixture(
  filename: string
): ISecurityDetectionItem<IGoogleSheetsExtractedValues>[] {
  const logger = createLogger('GoogleSheetsTest');

  try {
    // Load fixture from local fixtures directory
    const fixturesDir = path.join(__dirname, 'fixtures');
    const fixturePath = path.join(fixturesDir, filename);
    const workflow = loadWorkflowFile(fixturePath);

    // Create context directly
    const context = createCheckerContext(workflow);

    // Create checker instance
    const checker = new GoogleSheetsChecker(context);

    // Find Google Sheets nodes and run checker
    const googleSheetsNodes = workflow.nodes.filter((node) =>
      checker.getSupportedNodeTypes().includes(node.type)
    );

    // Run checker on all Google Sheets nodes
    const results: ISecurityDetectionItem<IGoogleSheetsExtractedValues>[] = [];
    for (const node of googleSheetsNodes) {
      const nodeResults = checker.checkNode(node);
      // Type-safe cast
      results.push(...(nodeResults as ISecurityDetectionItem<IGoogleSheetsExtractedValues>[]));
    }

    return results;
  } catch (error) {
    logger.error('Error running checker', error instanceof Error ? error : undefined);
    throw error;
  }
}
