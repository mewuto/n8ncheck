import type { INode } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import { containsNetworkAccess, containsProdString } from '../../core/content-analyzer';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import { COMMON_NODE_MESSAGES } from '../../utils/i18n-messages';
import { BaseNodeChecker } from '../shared/base-node-checker';
import { JSCODE_CHECKER_ID } from './constants';
import { JSCodeDetectionItems } from './detection-items';
import { JSCodeSchemaValidator } from './schema-validator';
import type { IJSCodeTypedParameters } from './types';

/**
 * Checker for n8n Code nodes (JavaScript/TypeScript execution)
 * Detects potentially dangerous patterns in code
 */
export class JSCodeChecker extends BaseNodeChecker {
  private schemaValidator: JSCodeSchemaValidator;

  constructor(context: ICheckerContext) {
    super(
      JSCODE_CHECKER_ID,
      'JSCode Checker',
      'Checks JavaScript/TypeScript code nodes for dangerous patterns',
      context
    );
    this.schemaValidator = new JSCodeSchemaValidator();
  }

  getSupportedNodeTypes(): string[] {
    return [NODE_TYPES.CODE];
  }

  checkNode(node: INode): ISecurityDetectionItem[] {
    this.logHeader(node);

    const detectionItems: ISecurityDetectionItem[] = [];

    // Check if node is Code type
    if (!this.getSupportedNodeTypes().includes(node.type)) {
      return detectionItems;
    }

    // Get node parameters
    const params = node.parameters;
    if (!params) {
      detectionItems.push(
        JSCodeDetectionItems.configurationError(
          this.id,
          node,
          COMMON_NODE_MESSAGES.PARAMETERS_NOT_CONFIGURED()
        )
      );
      return detectionItems;
    }

    // 1. Map raw parameters to strict typed parameters using schemaValidator
    const mappingResult = this.schemaValidator.mapToTypedParams(params);

    // Handle mapping errors
    if (mappingResult.errors.length > 0 || !mappingResult.params) {
      mappingResult.errors.forEach((error) => {
        detectionItems.push(JSCodeDetectionItems.configurationError(this.id, node, error.message));
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
   * Security checks with typed parameters for comprehensive business logic validation
   */
  private performSecurityChecks(
    node: INode,
    params: IJSCodeTypedParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    // Categorize node
    this.categorizeNode(node, params);

    // Check if Python code is detected and report as error
    if (params.language === 'python') {
      detectionItems.push(JSCodeDetectionItems.pythonNotSupported(this.id, node));
      return detectionItems;
    }

    // Check JavaScript code for network access
    if (params.jsCode) {
      if (containsNetworkAccess(params.jsCode)) {
        detectionItems.push(JSCodeDetectionItems.networkAccess(this.id, node, params.jsCode));
      }

      // Check for production access in code
      if (containsProdString(params.jsCode)) {
        detectionItems.push(JSCodeDetectionItems.productionAccess(this.id, node, params.jsCode));
      }
    }

    return detectionItems;
  }

  protected categorizeNode(_node: INode, _params: IJSCodeTypedParameters): void {}
}
