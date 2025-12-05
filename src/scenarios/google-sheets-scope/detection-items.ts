import type { INode } from 'n8n-workflow';
import { createSecurityDetectionItem } from '../../core/security-detection-item';
import { GOOGLE_SHEETS_RESOURCES } from '../../nodes/google-sheets/constants';
import type { GoogleSheetsOperation } from '../../nodes/google-sheets/types';
import type { IGoogleSheetsScopeExtractedValues } from './types';

/**
 * Detection codes for Google Sheets Scope scenarios
 */
export const GOOGLE_SHEETS_SCOPE_DETECTION_CODES = {
  MISSING_SCOPE_AFTER_CREATION: 'google-sheets-missing-scope',
} as const;

/**
 * Detection items for Google Sheets Scope scenario
 */
export const GoogleSheetsScopeDetectionItems = {
  /**
   * Creates detection item for missing scope setting after spreadsheet creation
   */
  missingScopeAfterCreation(
    checkerId: string,
    creationNode: INode,
    operationType: GoogleSheetsOperation
  ) {
    return createSecurityDetectionItem<IGoogleSheetsScopeExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_SHEETS_SCOPE_DETECTION_CODES.MISSING_SCOPE_AFTER_CREATION,
      severity: 'error',
      message: {
        en: `SpreadSheets creation detected without proper scope setting. After creating a spreadsheet, you must configure appropriate access permissions through Google Drive Share operations or HTTP Request permissions.`,
        ja: `適切なスコープ設定なしでSpreadSheetsの作成が検出されました。スプレッドシートを作成した後、Google Drive Share操作またはHTTPリクエストの権限を通じて適切なアクセス許可を設定する必要があります。`,
      },
      node: creationNode,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        sheet: {
          resource: GOOGLE_SHEETS_RESOURCES.DOCUMENT,
          operation: operationType,
          isCreatingNewSpreadsheet: true,
        },
      },
    });
  },
} as const;
