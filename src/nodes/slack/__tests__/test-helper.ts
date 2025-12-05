import * as path from 'node:path';
import { createCheckerContext } from '../../../core';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { createLogger } from '../../../utils/logger';
import { loadWorkflowFile } from '../../../utils/workflow-loader';
import { SlackChecker } from '../checker';
import type { ISlackExtractedValues } from '../types';

/**
 * Load fixture and run SlackChecker
 * This simulates the exact same execution path as production
 */
export function analyzeFixture(filename: string): ISecurityDetectionItem<ISlackExtractedValues>[] {
  const logger = createLogger('SlackTest');

  try {
    // Load fixture from local fixtures directory
    const fixturesDir = path.join(__dirname, 'fixtures');
    const fixturePath = path.join(fixturesDir, filename);
    const workflow = loadWorkflowFile(fixturePath);

    // Create context directly
    const context = createCheckerContext(workflow);

    // Create checker instance
    const checker = new SlackChecker(context);

    // Find Slack nodes and run checker
    const slackNodes = workflow.nodes.filter((node) =>
      checker.getSupportedNodeTypes().includes(node.type)
    );

    if (slackNodes.length === 0) {
      logger.debug('No Slack nodes found in workflow');
      return [];
    }

    // Run checker on all Slack nodes
    const results: ISecurityDetectionItem<ISlackExtractedValues>[] = [];
    for (const node of slackNodes) {
      const nodeResults = checker.checkNode(node);
      results.push(...(nodeResults as ISecurityDetectionItem<ISlackExtractedValues>[]));
    }

    // Debug logging for test troubleshooting
    if (results.length > 0) {
      logger.debug(
        `Fixture ${filename} results: count=${results.length}, nodes=${slackNodes.length}`
      );
    }

    return results;
  } catch (error) {
    logger.error('Error running checker', error instanceof Error ? error : undefined);
    throw error;
  }
}
