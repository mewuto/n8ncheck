// Import n8n Google Drive official definition
import { versionDescription } from 'n8n-nodes-base/dist/nodes/Google/Drive/v2/actions/versionDescription';
import type { INodeParameters } from 'n8n-workflow';
import { BaseNodeSchemaValidator } from '../../types/validation/base-node-schema-validator';
import type { IValidationError } from '../../types/validation/node-schema-validator.interface';
import {
  GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS,
  GOOGLE_DRIVE_FILE_OPERATIONS,
  GOOGLE_DRIVE_FOLDER_OPERATIONS,
  GOOGLE_DRIVE_RESOURCES,
  GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS,
  type GoogleDriveResource,
} from './constants';
import type { IGoogleDriveTypedParameters } from './types';

/**
 * Google Drive schema validator using BaseNodeSchemaValidator
 * Validates that custom Google Drive type definitions match n8n's official Google Drive node schema
 * Also provides type mapping functionality for type-safe parameter access
 */
export class GoogleDriveSchemaValidator extends BaseNodeSchemaValidator {
  constructor() {
    super(versionDescription);
  }

  /**
   * Map raw workflow parameters to strict typed Google Drive parameters
   * Returns mapping result with validation errors instead of throwing exceptions
   * Applies default resource and operation values based on n8n's official definitions
   */
  mapToTypedParams(rawParams: INodeParameters): {
    params: IGoogleDriveTypedParameters | null;
    errors: IValidationError[];
  } {
    const errors: IValidationError[] = [];

    // Apply default resource if missing based on n8n's official default
    const processedParams = { ...rawParams };
    if (!processedParams.resource) {
      processedParams.resource = GOOGLE_DRIVE_RESOURCES.FILE; // n8n's default resource
    }

    // Apply default operation if missing based on resource type
    if (!processedParams.operation) {
      const defaultOperation = this.getDefaultOperation(
        processedParams.resource as GoogleDriveResource
      );
      if (defaultOperation) {
        processedParams.operation = defaultOperation;
      } else {
        errors.push({
          field: 'operation',
          message: {
            ja: `Google Drive ${processedParams.resource} に対して操作が必要です`,
            en: `Operation is required for Google Drive ${processedParams.resource}`,
          },
        });
        return { params: null, errors };
      }
    }

    // Type assertion after validation
    return {
      params: processedParams as IGoogleDriveTypedParameters,
      errors: [],
    };
  }

  /**
   * Get default operation for a given resource type based on n8n's official definitions
   * Uses type-safe constants to ensure consistency with actual Google Drive operations
   */
  private getDefaultOperation(resource: GoogleDriveResource): string | null {
    const resourceDefaults: Record<GoogleDriveResource, string> = {
      [GOOGLE_DRIVE_RESOURCES.FOLDER]: GOOGLE_DRIVE_FOLDER_OPERATIONS.CREATE,
      [GOOGLE_DRIVE_RESOURCES.FILE]: GOOGLE_DRIVE_FILE_OPERATIONS.UPLOAD,
      [GOOGLE_DRIVE_RESOURCES.FILE_FOLDER]: GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS.SEARCH,
      [GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE]: GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.CREATE,
    };

    return resourceDefaults[resource] || null;
  }
}
