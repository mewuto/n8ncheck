import type { INode } from 'n8n-workflow';
import { createSecurityDetectionItem } from '../../core/security-detection-item';
import { createConfigurationErrorMessage, type I18nMessage } from '../../utils/i18n-messages';
import type { GoogleSheetsResource } from './constants';
import type { GoogleSheetsOperation, IGoogleSheetsExtractedValues } from './types';

/**
 * Detection codes for Google Sheets security issues
 */
const GOOGLE_SHEETS_DETECTION_CODES = {
  DATA_EXPOSURE: 'google-sheets-data-exposure',
  CONFIGURATION_ERROR: 'google-sheets-config-error',
} as const;

/**
 * Detection items for Google Sheets node security issues
 */
export const GoogleSheetsDetectionItems = {
  /**
   * Creates detection item for configuration errors
   */
  configurationError(
    checkerId: string,
    node: INode,
    field: string,
    errorMessage: I18nMessage,
    resource?: GoogleSheetsResource,
    operation?: GoogleSheetsOperation
  ) {
    const message = createConfigurationErrorMessage(errorMessage, field);

    return createSecurityDetectionItem<IGoogleSheetsExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_SHEETS_DETECTION_CODES.CONFIGURATION_ERROR,
      severity: 'note',
      message,
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        field,
        resource,
        operation,
      },
    });
  },
} as const;
