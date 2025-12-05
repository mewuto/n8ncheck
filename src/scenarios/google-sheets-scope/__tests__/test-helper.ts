import * as path from 'node:path';
import { createCheckerContext } from '../../../core';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { createLogger } from '../../../utils/logger';
import { loadWorkflowFile } from '../../../utils/workflow-loader';
import { GoogleSheetsScopeScenario } from '../checker';
import type { IGoogleSheetsScopeExtractedValues } from '../types';

/**
 * Load fixture and run GoogleSheetsScopeScenario
 * This simulates the exact same execution path as production
 */
export function analyzeFixture(
  filename: string
): ISecurityDetectionItem<IGoogleSheetsScopeExtractedValues>[] {
  const logger = createLogger('GoogleSheetsScopeTest');

  try {
    // Load fixture from local fixtures directory
    const fixturesDir = path.join(__dirname, 'fixtures');
    const fixturePath = path.join(fixturesDir, filename);
    const workflow = loadWorkflowFile(fixturePath);

    // Create context directly
    const context = createCheckerContext(workflow);

    // Create scenario checker instance
    const checker = new GoogleSheetsScopeScenario(context);

    // Check if scenario is applicable
    if (!checker.isApplicable(context)) {
      logger.debug('Google Sheets Scope scenario not applicable for this workflow');
      return [];
    }

    // Run scenario checker
    const results = checker.checkScenario();

    // Debug logging for test troubleshooting
    if (results.length > 0) {
      logger.debug(`Fixture ${filename} results: count=${results.length}`);
    }

    return results;
  } catch (error) {
    logger.error('Error running scenario checker', error instanceof Error ? error : undefined);
    throw error;
  }
}
