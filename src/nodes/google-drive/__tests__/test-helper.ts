import * as path from 'node:path';
import { createCheckerContext } from '../../../core';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { createLogger } from '../../../utils/logger';
import { loadWorkflowFile } from '../../../utils/workflow-loader';
import { GoogleDriveChecker } from '../checker';
import type { IGoogleDriveExtractedValues } from '../types';

/**
 * Load fixture and run GoogleDriveChecker
 * This simulates the exact same execution path as production
 */
export function analyzeFixture(
  filename: string
): ISecurityDetectionItem<IGoogleDriveExtractedValues>[] {
  const logger = createLogger('GoogleDriveTest');

  try {
    // Load fixture from local fixtures directory
    const fixturesDir = path.join(__dirname, 'fixtures');
    const fixturePath = path.join(fixturesDir, filename);
    const workflow = loadWorkflowFile(fixturePath);

    // Create context directly
    const context = createCheckerContext(workflow);

    // Create checker instance
    const checker = new GoogleDriveChecker(context);

    // Find Google Drive nodes and run checker
    const googleDriveNodes = workflow.nodes.filter((node) =>
      checker.getSupportedNodeTypes().includes(node.type)
    );

    if (googleDriveNodes.length === 0) {
      logger.debug('No Google Drive nodes found in workflow');
      return [];
    }

    // Run checker on all Google Drive nodes
    const results: ISecurityDetectionItem<IGoogleDriveExtractedValues>[] = [];
    for (const node of googleDriveNodes) {
      const nodeResults = checker.checkNode(node);
      results.push(...(nodeResults as ISecurityDetectionItem<IGoogleDriveExtractedValues>[]));
    }

    // Debug logging for test troubleshooting
    if (results.length > 0) {
      logger.debug(
        `Fixture ${filename} results: count=${results.length}, nodes=${googleDriveNodes.length}`
      );
    }

    return results;
  } catch (error) {
    logger.error('Error running checker', error instanceof Error ? error : undefined);
    throw error;
  }
}
