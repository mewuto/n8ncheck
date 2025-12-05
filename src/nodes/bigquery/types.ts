import type {
  INodeParameterResourceLocator,
  INodeParameters,
  NodeParameterValueType,
} from 'n8n-workflow';
import type { IBaseExtractedValues } from '../../core/extracted-values.types';
import type { BigQueryOperation } from './constants';

/**
 * Typed parameters for executeQuery operation
 */
export interface IBigQueryExecuteQueryParameters extends INodeParameters {
  operation: 'executeQuery';
  sqlQuery?: string;
  projectId: INodeParameterResourceLocator;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for insert operation
 */
export interface IBigQueryInsertParameters extends INodeParameters {
  operation: 'insert';
  projectId: INodeParameterResourceLocator;
  datasetId: INodeParameterResourceLocator;
  tableId: INodeParameterResourceLocator;
  dataMode?: 'autoMap' | 'define';
  fieldsUi?: {
    values: Array<{
      fieldId: string;
      fieldValue: string;
    }>;
  };
  options?: NodeParameterValueType;
}

/**
 * Union type for all typed BigQuery parameters
 */
export type IBigQueryTypedParameters = IBigQueryExecuteQueryParameters | IBigQueryInsertParameters;

/**
 * Extracted values for BigQuery nodes
 */
export interface IBigQueryExtractedValues extends IBaseExtractedValues {
  projectId?: string;
  datasetId?: string;
  tableId?: string;
  operation?: BigQueryOperation;
  sqlQuery?: string;
  hasDynamicQuery?: boolean;
  sqlPatternCount?: number;
  detectedPatterns?: string[];
}
