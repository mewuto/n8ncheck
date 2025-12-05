// Import n8n BigQuery official definition
// This import gets the official n8n BigQuery node description with all properties
import { versionDescription } from 'n8n-nodes-base/dist/nodes/Google/BigQuery/v2/actions/versionDescription';
import type {
  INodeParameterResourceLocator,
  INodeParameters,
  NodeParameterValueType,
} from 'n8n-workflow';
import { BaseNodeSchemaValidator } from '../../types/validation/base-node-schema-validator';
import type { IValidationError } from '../../types/validation/node-schema-validator.interface';
import type {
  IBigQueryExecuteQueryParameters,
  IBigQueryInsertParameters,
  IBigQueryTypedParameters,
} from './types';

/**
 * BigQuery schema validator using BaseNodeSchemaValidator
 * Validates that custom BigQuery type definitions match n8n's official BigQuery node schema
 * Also provides type mapping functionality for type-safe parameter access
 */
export class BigQuerySchemaValidator extends BaseNodeSchemaValidator {
  constructor() {
    super(versionDescription);
  }

  /**
   * Map raw workflow parameters to strict typed BigQuery parameters
   * Returns mapping result with validation errors instead of throwing exceptions
   */
  mapToTypedParams(rawParams: INodeParameters): {
    params: IBigQueryTypedParameters | null;
    errors: IValidationError[];
  } {
    const errors: IValidationError[] = [];

    // 1. 明示的なinsert操作の判別
    if (rawParams.operation === 'insert') {
      if (!rawParams.datasetId || !rawParams.tableId) {
        errors.push({
          field: 'datasetId/tableId',
          message: {
            en: 'Insert operation requires datasetId and tableId',
            ja: 'Insert操作にはdatasetIdとtableIdが必要です',
          },
        });
        return { params: null, errors };
      }

      return { params: this.mapToInsertParams(rawParams), errors: [] };
    }

    // 2. executeQuery操作の判別（sqlQueryの存在または操作未指定でprojectIdあり）
    if (rawParams.sqlQuery !== undefined || (!rawParams.operation && rawParams.projectId)) {
      // sqlQuery can be empty string, so we don't require it
      return { params: this.mapToExecuteQueryParams(rawParams), errors: [] };
    }

    // 3. 判別不可能な場合
    const availableParams = Object.keys(rawParams).join(', ');
    errors.push({
      field: 'operation',
      message: {
        en: `Cannot determine operation. Available parameters: ${availableParams}`,
        ja: `操作を特定できません。利用可能なパラメータ: ${availableParams}`,
      },
    });

    return { params: null, errors };
  }

  /**
   * Map to ExecuteQuery parameters with only relevant properties
   */
  private mapToExecuteQueryParams(rawParams: INodeParameters): IBigQueryExecuteQueryParameters {
    return {
      operation: 'executeQuery',
      sqlQuery: rawParams.sqlQuery as string | undefined,
      projectId: rawParams.projectId as INodeParameterResourceLocator,
      options: rawParams.options as NodeParameterValueType,
    };
  }

  /**
   * Map to Insert parameters with only relevant properties
   */
  private mapToInsertParams(rawParams: INodeParameters): IBigQueryInsertParameters {
    return {
      operation: 'insert',
      projectId: rawParams.projectId as INodeParameterResourceLocator,
      datasetId: rawParams.datasetId as INodeParameterResourceLocator,
      tableId: rawParams.tableId as INodeParameterResourceLocator,
      dataMode: this.safeParseDataMode(rawParams.dataMode),
      fieldsUi: this.safeParseFieldsUi(rawParams.fieldsUi),
      options: rawParams.options as NodeParameterValueType,
    };
  }

  /**
   * Safely parse dataMode with validation
   */
  private safeParseDataMode(value: unknown): 'autoMap' | 'define' | undefined {
    if (typeof value === 'string' && (value === 'autoMap' || value === 'define')) {
      return value;
    }
    return undefined;
  }

  /**
   * Safely parse fieldsUi structure
   */
  private safeParseFieldsUi(
    value: unknown
  ): { values: Array<{ fieldId: string; fieldValue: string }> } | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'object' && 'values' in value) {
      return value as { values: Array<{ fieldId: string; fieldValue: string }> };
    }
    return undefined;
  }
}
