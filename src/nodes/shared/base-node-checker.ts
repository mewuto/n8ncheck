import type { INode } from 'n8n-workflow';
import type { ExtractedValues } from '../../core/extracted-values.types';
import type {
  CheckerType,
  CheckResult,
  IChecker,
  ICheckerContext,
  NodeCategories,
  NodeCategory,
} from '../../core/interfaces/checker.interface';
import {
  createSecurityDetectionItem,
  type ISecurityDetectionItem,
} from '../../core/security-detection-item';
import type {
  IValidationError,
  IValidationResult,
  IValidationWarning,
} from '../../types/validation/node-schema-validator.interface';
import { createConfigurationErrorMessage } from '../../utils/i18n-messages';
import { createLogger } from '../../utils/logger';

/**
 * Detection codes for base node validation issues
 */
const BASE_NODE_DETECTION_CODES = {
  NODE_VALIDATION_ERROR: 'NODE_VALIDATION_ERROR',
  NODE_VALIDATION_WARNING: 'NODE_VALIDATION_WARNING',
} as const;

/**
 * Abstract base class for node-level checkers
 * Checks individual nodes for security issues
 */
export abstract class BaseNodeChecker<T extends ExtractedValues = ExtractedValues>
  implements IChecker<T>
{
  readonly type: CheckerType = 'node';
  protected logger = createLogger(`NodeChecker`);
  protected nodeCategories!: NodeCategories;

  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    protected context: ICheckerContext
  ) {
    this.logger.setComponent(`NodeChecker:${this.name}`);
    this.initializeNodeCategories();
  }

  /**
   * Get the node types this checker supports
   */
  abstract getSupportedNodeTypes(): string[];

  /**
   * Perform the actual node check
   */
  abstract checkNode(node: INode): ISecurityDetectionItem<T>[];

  /**
   * Check if this checker is applicable for the given context
   */
  isApplicable(context: ICheckerContext): boolean {
    if (!context.node) {
      return false;
    }

    const supportedTypes = this.getSupportedNodeTypes();
    return supportedTypes.includes(context.node.type);
  }

  /**
   * Execute the checker
   */
  check(node: INode): CheckResult<T> {
    if (!node) {
      return {
        checkerId: this.id,
        checkerName: this.name,
        passed: true,
        detectionItems: [],
        nodeCategories: this.nodeCategories,
      };
    }

    const detectionItems = this.checkNode(node);

    return {
      checkerId: this.id,
      checkerName: this.name,
      passed: detectionItems.length === 0,
      detectionItems,
      nodeCategories: this.nodeCategories,
    };
  }

  /**
   * Initialize node categories structure
   */
  protected initializeNodeCategories(): void {
    this.nodeCategories = {
      triggers: [],
      dataSources: [],
      outputs: [],
      others: [],
    };
  }

  /**
   * Categorize the node based on its operation/type
   * Each checker must implement this to properly categorize nodes
   */
  protected abstract categorizeNode(node: INode, params: unknown): void;

  /**
   * Add a node to a specific category
   */
  protected addToCategory(category: NodeCategory, nodeName: string): void {
    switch (category) {
      case 'trigger':
        if (!this.nodeCategories.triggers.includes(nodeName)) {
          this.nodeCategories.triggers.push(nodeName);
        }
        break;
      case 'dataSource':
        if (!this.nodeCategories.dataSources.includes(nodeName)) {
          this.nodeCategories.dataSources.push(nodeName);
        }
        break;
      case 'output':
        if (!this.nodeCategories.outputs.includes(nodeName)) {
          this.nodeCategories.outputs.push(nodeName);
        }
        break;
      case 'other':
        if (!this.nodeCategories.others.includes(nodeName)) {
          this.nodeCategories.others.push(nodeName);
        }
        break;
    }
  }

  /**
   * Helper method to format log output
   */
  protected log(message: string, indent: number = 0): void {
    const prefix = '  '.repeat(indent);
    this.logger.debug(`${prefix}${message}`);
  }

  /**
   * Helper method to format checker output header
   */
  protected logHeader(node: INode): void {
    this.logger.info(`Detected node "${node.name}"`);
  }

  /**
   * Common method to convert ValidationResult to SecurityDetectionItem array
   * Can be overridden by specific checkers for custom handling
   */
  protected convertValidationToDetectionItems(
    node: INode,
    validationResult: IValidationResult
  ): ISecurityDetectionItem<T>[] {
    const detectionItems: ISecurityDetectionItem<T>[] = [];

    // Convert validation errors to security detection items
    for (const error of validationResult.errors) {
      detectionItems.push(this.createErrorDetectionItem(node, error));
    }

    // Convert validation warnings to security detection items
    for (const warning of validationResult.warnings) {
      detectionItems.push(this.createWarningDetectionItem(node, warning));
    }

    return detectionItems;
  }

  /**
   * Create a SecurityDetectionItem from a validation error
   * Can be overridden by specific checkers for custom error types
   */
  protected createErrorDetectionItem(
    node: INode,
    error: IValidationError
  ): ISecurityDetectionItem<T> {
    const message = createConfigurationErrorMessage(error.message);

    return createSecurityDetectionItem<T>({
      checkerId: this.id,
      detectionCode: BASE_NODE_DETECTION_CODES.NODE_VALIDATION_ERROR,
      severity: 'note',
      message,
      node,
      extractedValues: undefined,
      analysisMethod: 'static',
      confidence: 1.0,
    });
  }

  /**
   * Create a SecurityDetectionItem from a validation warning
   * Can be overridden by specific checkers for custom warning types
   */
  protected createWarningDetectionItem(
    node: INode,
    warning: IValidationWarning
  ): ISecurityDetectionItem<T> {
    const message = createConfigurationErrorMessage(warning.message);

    return createSecurityDetectionItem<T>({
      checkerId: this.id,
      detectionCode: BASE_NODE_DETECTION_CODES.NODE_VALIDATION_WARNING,
      severity: 'note',
      message,
      node,
      extractedValues: undefined,
      analysisMethod: 'static',
      confidence: 1.0,
    });
  }
}
