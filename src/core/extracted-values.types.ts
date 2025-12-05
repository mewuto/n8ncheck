/**
 * Base interface for all extracted values
 */
export interface IBaseExtractedValues {
  [key: string]: unknown;
}

import type { IBigQueryExtractedValues } from '../nodes/bigquery/types';
import type { IGoogleDriveExtractedValues } from '../nodes/google-drive/types';
import type { IGoogleSheetsExtractedValues } from '../nodes/google-sheets/types';
import type { IHttpRequestExtractedValues } from '../nodes/httprequest/types';
import type { IIfExtractedValues } from '../nodes/if/types';
// Import and re-export node-specific extracted values
import type { IJSCodeExtractedValues } from '../nodes/jscode/types';
import type { ISlackExtractedValues } from '../nodes/slack/types';

export type {
  IJSCodeExtractedValues,
  IBigQueryExtractedValues,
  ISlackExtractedValues,
  IHttpRequestExtractedValues,
  IGoogleDriveExtractedValues,
  IGoogleSheetsExtractedValues,
  IIfExtractedValues,
};

/**
 * Union type for all extracted values
 */
export type ExtractedValues =
  | IJSCodeExtractedValues
  | IBigQueryExtractedValues
  | ISlackExtractedValues
  | IHttpRequestExtractedValues
  | IGoogleDriveExtractedValues
  | IGoogleSheetsExtractedValues
  | IIfExtractedValues
  | IBaseExtractedValues;
