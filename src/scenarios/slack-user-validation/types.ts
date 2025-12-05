// ============================================================================
// User validation types for Slack User Validation scenario
// ============================================================================

/** Error handling type */
export type ErrorHandlingType = 'throw' | 'return' | 'none';

/** Validation methods detected by the checker */
export type ValidationMethod =
  | 'hasOwnProperty'
  | 'in_operator'
  | 'bracket_access'
  | 'conditional_check';

/**
 * Detailed validation information for JSCode nodes
 * Used for comprehensive analysis of user validation in Code nodes
 */
export interface IJSCodeValidationDetails {
  /**
   * Overall validation status
   * Result of hasUserIdExtraction && hasAuthorizationList && hasValidationLogic
   */
  hasValidation: boolean;
  /** Whether user ID is extracted from Slack Trigger */
  hasUserIdExtraction: boolean;
  /** Whether authorization list (users/userNameMap) is defined */
  hasAuthorizationList: boolean;
  /** Whether user ID validation logic is implemented */
  hasValidationLogic: boolean;
  /** Whether error handling is implemented (not required but recommended) */
  hasErrorHandling: boolean;
  /** Type of error handling */
  errorHandlingType?: ErrorHandlingType;
  /** Number of authorized users */
  authorizedUserCount?: number;
  /** Validation method (hasOwnProperty, in_operator, bracket_access, etc.) */
  validationMethod?: ValidationMethod;
}

/**
 * Validation information for If nodes
 * Used for basic validation checks in If conditions
 */
export interface IIfValidationDetails {
  hasValidation: boolean;
}

// ============================================================================
// Combined validation details (for backward compatibility)
// ============================================================================

/**
 * Union type for all validation detail types
 * Allows handling both JSCode and If validation details uniformly
 */
export type IUserValidationDetails = IJSCodeValidationDetails | IIfValidationDetails;

// ============================================================================
// Type guards
// ============================================================================

/**
 * Check if validation details are for JSCode node
 */
export function isJSCodeValidationDetails(
  details: IUserValidationDetails
): details is IJSCodeValidationDetails {
  return 'hasAuthorizationList' in details;
}

/**
 * Check if validation details are for If node
 */
export function isIfValidationDetails(
  details: IUserValidationDetails
): details is IIfValidationDetails {
  return !('hasAuthorizationList' in details);
}
