import type { INodeParameterResourceLocator, INodeParameters } from 'n8n-workflow';
import type { IBaseExtractedValues } from '../../core/extracted-values.types';
import type {
  DOCUMENT_OPERATIONS,
  DocumentOperation,
  GOOGLE_SHEETS_RESOURCES,
  GoogleSheetsResource,
  SHEET_WITHIN_DOCUMENT_OPERATIONS,
  SheetWithinDocumentOperation,
} from './constants';

export type GoogleSheetsOperation = DocumentOperation | SheetWithinDocumentOperation;

/**
 * Base interface for all Google Sheets operations
 */
export interface IGoogleSheetsBaseParameters extends INodeParameters {
  resource: GoogleSheetsResource;
  operation: GoogleSheetsOperation;
  documentId?: INodeParameterResourceLocator;
  sheetName?: INodeParameterResourceLocator;
}

/**
 * Document operations
 */
export interface IGoogleSheetsDocumentCreateParameters extends IGoogleSheetsBaseParameters {
  resource: typeof GOOGLE_SHEETS_RESOURCES.DOCUMENT;
  operation: typeof DOCUMENT_OPERATIONS.CREATE;
  title: string;
}

export interface IGoogleSheetsDocumentDeleteParameters extends IGoogleSheetsBaseParameters {
  resource: typeof GOOGLE_SHEETS_RESOURCES.DOCUMENT;
  operation: typeof DOCUMENT_OPERATIONS.DELETE;
  documentId: INodeParameterResourceLocator;
}

/**
 * Base interface for operations requiring documentId and sheetName
 */
export interface IGoogleSheetsSheetBaseParameters extends IGoogleSheetsBaseParameters {
  resource: typeof GOOGLE_SHEETS_RESOURCES.SHEET_WITHIN_DOCUMENT;
  documentId: INodeParameterResourceLocator;
  sheetName: INodeParameterResourceLocator;
}
/**
 * Sheet operations
 */
export interface IGoogleSheetsSheetAppendParameters extends IGoogleSheetsSheetBaseParameters {
  operation: typeof SHEET_WITHIN_DOCUMENT_OPERATIONS.APPEND_ROW;
}

export interface IGoogleSheetsSheetAppendOrUpdateParameters
  extends IGoogleSheetsSheetBaseParameters {
  operation: typeof SHEET_WITHIN_DOCUMENT_OPERATIONS.APPEND_OR_UPDATE_ROW;
}

export interface IGoogleSheetsSheetClearParameters extends IGoogleSheetsSheetBaseParameters {
  operation: typeof SHEET_WITHIN_DOCUMENT_OPERATIONS.CLEAR;
}

export interface IGoogleSheetsSheetCreateParameters extends IGoogleSheetsSheetBaseParameters {
  operation: typeof SHEET_WITHIN_DOCUMENT_OPERATIONS.CREATE;
}

export interface IGoogleSheetsSheetReadParameters extends IGoogleSheetsSheetBaseParameters {
  operation: typeof SHEET_WITHIN_DOCUMENT_OPERATIONS.GET_ROWS;
}

export interface IGoogleSheetsSheetRemoveParameters extends IGoogleSheetsSheetBaseParameters {
  operation: typeof SHEET_WITHIN_DOCUMENT_OPERATIONS.DELETE;
}

export interface IGoogleSheetsSheetUpdateParameters extends IGoogleSheetsSheetBaseParameters {
  operation: typeof SHEET_WITHIN_DOCUMENT_OPERATIONS.UPDATE_ROW;
}

export interface IGoogleSheetsSheetDeleteRowsOrColumnsParameters
  extends IGoogleSheetsSheetBaseParameters {
  operation: typeof SHEET_WITHIN_DOCUMENT_OPERATIONS.DELETE_ROWS_OR_COLUMNS;
}

/**
 * Union type for all typed Google Sheets parameters
 */
export type IGoogleSheetsTypedParameters =
  | IGoogleSheetsDocumentCreateParameters
  | IGoogleSheetsDocumentDeleteParameters
  | IGoogleSheetsSheetAppendParameters
  | IGoogleSheetsSheetAppendOrUpdateParameters
  | IGoogleSheetsSheetClearParameters
  | IGoogleSheetsSheetCreateParameters
  | IGoogleSheetsSheetReadParameters
  | IGoogleSheetsSheetRemoveParameters
  | IGoogleSheetsSheetUpdateParameters
  | IGoogleSheetsSheetDeleteRowsOrColumnsParameters;

/**
 * Extracted values for Google Sheets nodes
 */
export interface IGoogleSheetsExtractedValues extends IBaseExtractedValues {
  resource?: GoogleSheetsResource;
  operation?: GoogleSheetsOperation;
  documentId?: string;
  sheetName?: string;
  title?: string;
  field?: string;
  isCreatingNewSpreadsheet?: boolean;
}
