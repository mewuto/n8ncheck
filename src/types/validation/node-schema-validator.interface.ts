import type { IDataObject, INodeProperties } from 'n8n-workflow';
import type { I18nMessage } from '../../utils/i18n-messages';

/**
 * Interface for node schema validation
 * Provides type-safe validation against official n8n node schema definitions
 */
export interface INodeSchemaValidator {
  /**
   * Performs validation with comprehensive error reporting
   * @param params Raw parameters from the node
   * @returns Detailed validation result with errors and warnings
   */
  validate(params: IDataObject): IValidationResult;

  /**
   * Get the schema definition for this node type
   * @returns Array of node properties from official definition
   */
  getSchema(): INodeProperties[];
}

/**
 * Validation result with detailed error information
 */
export interface IValidationResult {
  valid: boolean;
  errors: IValidationError[];
  warnings: IValidationWarning[];
}

/**
 * Simplified validation error for security checks
 */
export interface IValidationError {
  field: string;
  message: I18nMessage;
  expected?: string;
  actual?: string;
}

/**
 * Validation warning for non-critical issues
 */
export interface IValidationWarning {
  field: string;
  message: I18nMessage;
}
