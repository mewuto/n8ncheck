/**
 * Constants for Google Sheets checker
 */

export const GOOGLE_SHEETS_CHECKER_ID = 'google-sheets-checker';

/**
 * Operations available for Document resource (spreadsheet-level operations)
 */
export const DOCUMENT_OPERATIONS = {
  CREATE: 'create',
  DELETE: 'delete',
} as const;
export type DocumentOperation = (typeof DOCUMENT_OPERATIONS)[keyof typeof DOCUMENT_OPERATIONS];

/**
 * Operations available for Sheet Within Document resource (sheet-level operations)
 */
export const SHEET_WITHIN_DOCUMENT_OPERATIONS = {
  APPEND_ROW: 'append', // "Append Row"
  APPEND_OR_UPDATE_ROW: 'appendOrUpdate', // "Append or Update Row"
  CLEAR: 'clear', // "Clear"
  CREATE: 'create', // "Create"
  GET_ROWS: 'read', // "Get Row(s)"
  DELETE: 'remove', // "Delete"
  DELETE_ROWS_OR_COLUMNS: 'delete', // "Delete Rows or Columns"
  UPDATE_ROW: 'update', // "Update Row"
} as const;
export type SheetWithinDocumentOperation =
  (typeof SHEET_WITHIN_DOCUMENT_OPERATIONS)[keyof typeof SHEET_WITHIN_DOCUMENT_OPERATIONS];

export const GOOGLE_SHEETS_RESOURCES = {
  DOCUMENT: 'spreadsheet',
  SHEET_WITHIN_DOCUMENT: 'sheet',
} as const;
export type GoogleSheetsResource =
  (typeof GOOGLE_SHEETS_RESOURCES)[keyof typeof GOOGLE_SHEETS_RESOURCES];
