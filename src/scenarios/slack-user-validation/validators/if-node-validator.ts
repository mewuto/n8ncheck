import type { FilterValue, INode } from 'n8n-workflow';
import { COMPANY_EMAIL_PATTERN } from '../../../constants/email-patterns';
import { IfSchemaValidator } from '../../../nodes/if/schema-validator';
import type { IIfValidationDetails } from '../types';

interface IIfNodeValidationResult {
  isValid: boolean;
  details: IIfValidationDetails;
}

/**
 * If Node User Validation Analyzer
 * Analyzes If nodes for user validation patterns
 */
export class IfNodeUserValidator {
  private ifSchemaValidator: IfSchemaValidator;

  constructor() {
    this.ifSchemaValidator = new IfSchemaValidator();
  }

  /**
   * Analyze a single If node for user validation
   * Uses schema validation to ensure parameters are valid before analysis
   */
  analyzeIfNode(ifNode: INode): IIfNodeValidationResult {
    // Use schema validator to validate and map parameters
    const params = this.ifSchemaValidator.mapToTypedParams(ifNode.parameters);

    // Handle mapping errors
    if (!params) {
      return {
        isValid: false,
        details: {
          hasValidation: false,
        },
      };
    }

    // Check email validation in conditions
    const isValid = this.checkEmailValidationInConditions(params.conditions);

    return {
      isValid,
      details: {
        hasValidation: isValid,
      },
    };
  }

  /**
   * Check if conditions contain email validation patterns
   */
  private checkEmailValidationInConditions(conditions: FilterValue | undefined): boolean {
    if (!conditions || !conditions.conditions) {
      return false;
    }

    return conditions.conditions.some((condition) => {
      const leftValue = condition.leftValue;
      const rightValue = condition.rightValue;
      const operator = condition.operator;

      // Check if operator is equality check
      if (operator.operation !== 'equals') {
        return false;
      }

      // Check if right value contains Company email pattern
      const hasEmailPattern =
        typeof rightValue === 'string' && COMPANY_EMAIL_PATTERN.test(rightValue);

      // Check if left value is not empty (any user context extraction)
      const hasUserContext = typeof leftValue === 'string' && leftValue.trim() !== '';

      return hasEmailPattern && hasUserContext;
    });
  }
}
