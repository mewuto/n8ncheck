import type { INode } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import { COMMON_NODE_MESSAGES } from '../../utils/i18n-messages';
import { BaseNodeChecker } from '../shared/base-node-checker';
import {
  DOCUMENT_OPERATIONS,
  GOOGLE_SHEETS_CHECKER_ID,
  SHEET_WITHIN_DOCUMENT_OPERATIONS,
} from './constants';
import { GoogleSheetsDetectionItems } from './detection-items';
import { GoogleSheetsSchemaValidator } from './schema-validator';
import type { GoogleSheetsOperation, IGoogleSheetsTypedParameters } from './types';

/**
 * Security checker for Google Sheets nodes
 * Uses typed parameter mapping and schema validation for comprehensive security checks
 */
export class GoogleSheetsChecker extends BaseNodeChecker {
  private schemaValidator: GoogleSheetsSchemaValidator;

  constructor(context: ICheckerContext) {
    super(
      GOOGLE_SHEETS_CHECKER_ID,
      'Google Sheets Checker',
      'Checks Google Sheets nodes for unsafe configurations',
      context
    );
    this.schemaValidator = new GoogleSheetsSchemaValidator();
  }

  getSupportedNodeTypes(): string[] {
    return [NODE_TYPES.GOOGLE_SHEETS, NODE_TYPES.GOOGLE_SHEETS_TOOL];
  }

  private isGoogleSheetsNode(node: INode): boolean {
    return this.getSupportedNodeTypes().includes(node.type);
  }

  checkNode(node: INode): ISecurityDetectionItem[] {
    this.logHeader(node);

    const detectionItems: ISecurityDetectionItem[] = [];

    // Check if node is Google Sheets type
    if (!this.isGoogleSheetsNode(node)) {
      return detectionItems;
    }

    // Get node parameters
    const params = node.parameters;
    if (!params) {
      detectionItems.push(
        GoogleSheetsDetectionItems.configurationError(
          this.id,
          node,
          'parameters',
          COMMON_NODE_MESSAGES.PARAMETERS_NOT_CONFIGURED()
        )
      );
      return detectionItems;
    }

    // 1. Map raw parameters to strict typed parameters
    const mappingResult = this.schemaValidator.mapToTypedParams(params);

    // Handle mapping errors
    if (mappingResult.errors.length > 0 || !mappingResult.params) {
      mappingResult.errors.forEach((error) => {
        detectionItems.push(
          GoogleSheetsDetectionItems.configurationError(this.id, node, error.field, error.message)
        );
      });
      return detectionItems;
    }

    const typedParams = mappingResult.params;

    // 2. Validate strict typed parameters (schema validation only)
    const validationResult = this.schemaValidator.validate(typedParams);

    // 3. Convert validation errors to security detection items
    detectionItems.push(...this.convertValidationToDetectionItems(node, validationResult));

    // 4. Additional security-specific checks with typed parameters
    detectionItems.push(...this.performSecurityChecks(node, typedParams));

    return detectionItems;
  }

  /**
   * Security checks for Google Sheets operations
   */
  private performSecurityChecks(
    node: INode,
    params: IGoogleSheetsTypedParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    // Categorize based on operation
    this.categorizeNode(node, params.operation);

    // TODO: Implement operation-specific security checks as needed
    detectionItems.push(...this.performCommonSecurityChecks(node, params));

    return detectionItems;
  }

  /**
   * Categorize Google Sheets node based on operation
   */
  protected categorizeNode(node: INode, operation: GoogleSheetsOperation): void {
    const SERVICE_NAME = 'googleSpreadSheet';

    // Data source operations (reading data)
    if (operation === SHEET_WITHIN_DOCUMENT_OPERATIONS.GET_ROWS) {
      this.addToCategory('dataSource', SERVICE_NAME);
      return;
    }

    // Output operations (writing/modifying data)
    const outputOperations: GoogleSheetsOperation[] = [
      SHEET_WITHIN_DOCUMENT_OPERATIONS.APPEND_ROW,
      SHEET_WITHIN_DOCUMENT_OPERATIONS.APPEND_OR_UPDATE_ROW,
      SHEET_WITHIN_DOCUMENT_OPERATIONS.CLEAR,
      SHEET_WITHIN_DOCUMENT_OPERATIONS.CREATE,
      SHEET_WITHIN_DOCUMENT_OPERATIONS.UPDATE_ROW,
      SHEET_WITHIN_DOCUMENT_OPERATIONS.DELETE,
      SHEET_WITHIN_DOCUMENT_OPERATIONS.DELETE_ROWS_OR_COLUMNS,
      DOCUMENT_OPERATIONS.CREATE,
      DOCUMENT_OPERATIONS.DELETE,
    ];

    if (outputOperations.includes(operation)) {
      this.addToCategory('output', SERVICE_NAME);
      return;
    }

    // Fallback for unknown operations
    this.addToCategory('other', node.name);
  }

  /**
   * Common security checks applicable to all Google Sheets operations
   */
  private performCommonSecurityChecks(
    _node: INode,
    _params: IGoogleSheetsTypedParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    // TODO: Add other security checks as needed

    return detectionItems;
  }
}
