import type { IBaseExtractedValues } from '../../core/extracted-values.types';
import type { IGoogleDriveExtractedValues } from '../../nodes/google-drive/types';
import type { IGoogleSheetsExtractedValues } from '../../nodes/google-sheets/types';

/**
 * Extracted values for Google Sheets scope detection scenarios
 * Uses nested structure to avoid field conflicts and leverage existing types
 */
export interface IGoogleSheetsScopeExtractedValues extends IBaseExtractedValues {
  /** Google Sheets related information */
  sheet?: IGoogleSheetsExtractedValues;

  /** Google Drive related information (for scope/permission settings) */
  drive?: IGoogleDriveExtractedValues;
}
