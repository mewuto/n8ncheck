import * as path from 'node:path';
import { createCheckerContext } from '../../../core';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { createLogger } from '../../../utils/logger';
import { loadWorkflowFile } from '../../../utils/workflow-loader';
import { HttpRequestChecker } from '../checker';

/**
 * Helper function to run HttpRequestChecker on a fixture file
 */
function runCheckerOnFixture(fixturePath: string): ISecurityDetectionItem[] {
  const logger = createLogger('HttpRequestTest');

  try {
    const workflow = loadWorkflowFile(fixturePath);
    const context = createCheckerContext(workflow);
    const checker = new HttpRequestChecker(context);

    const httpRequestNodes = workflow.nodes.filter((node) =>
      checker.getSupportedNodeTypes().includes(node.type)
    );

    if (httpRequestNodes.length === 0) {
      logger.debug('No HTTP Request nodes found in workflow');
      return [];
    }

    const results: ISecurityDetectionItem[] = [];
    for (const node of httpRequestNodes) {
      const nodeResults = checker.checkNode(node);
      results.push(...nodeResults);
    }

    if (results.length > 0) {
      logger.debug(`Fixture results: count=${results.length}, severity=${results[0].severity}`);
    }

    return results;
  } catch (error) {
    logger.error('Error running checker', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * Load basic fixture and run HttpRequestChecker
 */
export function analyzeBasicFixture(filename: string): ISecurityDetectionItem[] {
  const fixturesDir = path.join(__dirname, 'fixtures', 'basic');
  const fixturePath = path.join(fixturesDir, filename);
  return runCheckerOnFixture(fixturePath);
}

/**
 * Load Google Drive fixture and run HttpRequestChecker
 */
export function analyzeGoogleDriveFixture(filename: string): ISecurityDetectionItem[] {
  const fixturesDir = path.join(__dirname, 'fixtures', 'google-drive');
  const fixturePath = path.join(fixturesDir, filename);
  return runCheckerOnFixture(fixturePath);
}
