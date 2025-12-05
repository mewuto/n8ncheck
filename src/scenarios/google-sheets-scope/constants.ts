/**
 * Google Sheets Scope scenario constants
 */

import {
  GOOGLE_DRIVE_FILE_OPERATIONS,
  GOOGLE_DRIVE_FOLDER_OPERATIONS,
  type GoogleDriveOperation,
} from '../../nodes/google-drive';

export const GOOGLE_SHEETS_SCOPE_SCENARIO_ID = 'google-sheets-scope';

/**
 * Operations that involve sharing/permissions
 */
export const PERMISSION_OPERATIONS: readonly GoogleDriveOperation[] = [
  GOOGLE_DRIVE_FILE_OPERATIONS.SHARE,
  GOOGLE_DRIVE_FOLDER_OPERATIONS.SHARE,
] as const;
