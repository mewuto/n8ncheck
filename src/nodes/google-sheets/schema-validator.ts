// Import n8n Google Sheets official definition
// This import gets the official n8n Google Sheets node description with all properties
import { versionDescription } from 'n8n-nodes-base/dist/nodes/Google/Sheet/v2/actions/versionDescription';
import type { INodeParameters } from 'n8n-workflow';
import { BaseNodeSchemaValidator } from '../../types/validation/base-node-schema-validator';
import type { IValidationError } from '../../types/validation/node-schema-validator.interface';
import {
  DOCUMENT_OPERATIONS,
  GOOGLE_SHEETS_RESOURCES,
  type GoogleSheetsResource,
  SHEET_WITHIN_DOCUMENT_OPERATIONS,
} from './constants';
import type { IGoogleSheetsTypedParameters } from './types';

/**
 * Google Sheets schema validator using BaseNodeSchemaValidator
 * Validates that custom Google Sheets type definitions match n8n's official Google Sheets node schema
 * Also provides type mapping functionality for type-safe parameter access
 */
export class GoogleSheetsSchemaValidator extends BaseNodeSchemaValidator {
  constructor() {
    super(versionDescription);
  }

  /**
   * Map raw workflow parameters to strict typed Google Sheets parameters
   * Returns mapping result with validation errors instead of throwing exceptions
   * Applies default resource and operation values based on n8n's official definitions
   */
  mapToTypedParams(rawParams: INodeParameters): {
    params: IGoogleSheetsTypedParameters | null;
    errors: IValidationError[];
  } {
    const errors: IValidationError[] = [];

    // Apply default resource if missing based on n8n's official default
    const processedParams = { ...rawParams };
    if (!processedParams.resource) {
      processedParams.resource = GOOGLE_SHEETS_RESOURCES.SHEET_WITHIN_DOCUMENT; // n8n's default resource
    }

    // Apply default operation if missing based on resource type
    if (!processedParams.operation) {
      const defaultOperation = this.getDefaultOperation(
        processedParams.resource as GoogleSheetsResource
      );
      if (defaultOperation) {
        processedParams.operation = defaultOperation;
      } else {
        errors.push({
          field: 'operation',
          message: {
            ja: `Google Sheets ${processedParams.resource}に対して操作が必要です`,
            en: `Operation is required for Google Sheets ${processedParams.resource}`,
          },
        });
        return { params: null, errors };
      }
    }

    // Type assertion after validation
    return {
      params: processedParams as IGoogleSheetsTypedParameters,
      errors: [],
    };
  }

  /**
   * Get default operation for a given resource type based on n8n's official definitions
   * Uses type-safe constants to ensure consistency with actual Google Sheets operations
   */
  private getDefaultOperation(resource: GoogleSheetsResource): string | null {
    const resourceDefaults: Record<GoogleSheetsResource, string> = {
      [GOOGLE_SHEETS_RESOURCES.DOCUMENT]: DOCUMENT_OPERATIONS.CREATE,
      [GOOGLE_SHEETS_RESOURCES.SHEET_WITHIN_DOCUMENT]: SHEET_WITHIN_DOCUMENT_OPERATIONS.GET_ROWS,
    };

    return resourceDefaults[resource] || null;
  }
}
