import { BigQueryChecker } from '../../nodes/bigquery';
import { GoogleDriveChecker } from '../../nodes/google-drive';
import { GoogleSheetsChecker } from '../../nodes/google-sheets';
import { HttpRequestChecker } from '../../nodes/httprequest';
import { IfChecker } from '../../nodes/if';
import { JSCodeChecker } from '../../nodes/jscode';
import { SlackChecker } from '../../nodes/slack';
import { GoogleSheetsScopeScenario } from '../../scenarios/google-sheets-scope';
import { SlackUserValidationScenario } from '../../scenarios/slack-user-validation';
import type { IChecker, ICheckerContext } from '../interfaces/checker.interface';

/**
 * Registry for all checkers (node and scenario)
 */
export class CheckerRegistry {
  /**
   * Create all checkers for a given context
   */
  createCheckers(context: ICheckerContext): IChecker[] {
    const checkers: IChecker[] = [];

    // Create node checkers
    checkers.push(new JSCodeChecker(context));
    checkers.push(new BigQueryChecker(context));
    checkers.push(new SlackChecker(context));
    checkers.push(new HttpRequestChecker(context));
    checkers.push(new GoogleSheetsChecker(context));
    checkers.push(new GoogleDriveChecker(context));
    checkers.push(new IfChecker(context));

    // Create scenario checkers
    checkers.push(new SlackUserValidationScenario(context));
    checkers.push(new GoogleSheetsScopeScenario(context));

    return checkers;
  }

  /**
   * Get node checkers from a list of checkers
   */
  getNodeCheckers(checkers: IChecker[]): IChecker[] {
    return checkers.filter((checker) => checker.type === 'node');
  }

  /**
   * Get scenario checkers from a list of checkers
   */
  getScenarioCheckers(checkers: IChecker[]): IChecker[] {
    return checkers.filter((checker) => checker.type === 'scenario');
  }
}
