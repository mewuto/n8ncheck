import * as path from 'node:path';
import { createCheckerContext } from '../../../core';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import type { ISlackExtractedValues } from '../../../nodes/slack/types';
import { createLogger } from '../../../utils/logger';
import { loadWorkflowFile } from '../../../utils/workflow-loader';
import { SlackUserValidationScenario } from '../checker';

/**
 * Load fixture and run SlackUserValidationScenario checker
 * This simulates the exact same execution path as production
 */
export function analyzeFixture(filename: string): ISecurityDetectionItem<ISlackExtractedValues>[] {
  const logger = createLogger('SlackUserValidationTest');

  try {
    // Load fixture directly
    const fixturesDir = path.join(__dirname, 'fixtures');
    const fixturePath = path.join(fixturesDir, filename);
    const workflow = loadWorkflowFile(fixturePath);

    // Create context directly
    const context = createCheckerContext(workflow);

    // Create checker instance
    const checker = new SlackUserValidationScenario(context);

    // Check if applicable
    if (!checker.isApplicable(context)) {
      logger.debug('Checker not applicable for this workflow');
      return [];
    }

    // Run checker
    const checkResult = checker.check();

    // Extract detection items from check result
    const results = checkResult.detectionItems;

    // Debug logging for test troubleshooting
    if (results.length > 0) {
      logger.debug(
        `Fixture ${filename} results: count=${results.length}, severity=${results[0].severity}`
      );
    }

    return results;
  } catch (error) {
    logger.error('Error running checker', error instanceof Error ? error : undefined);
    throw error;
  }
}
