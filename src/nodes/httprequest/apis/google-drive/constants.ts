import {
  COMPANY_DOMAIN_PATTERN,
  COMPANY_EMAIL_PATTERN,
} from '../../../../constants/email-patterns';

/**
 * Google Drive API Constants for HTTP Request analysis
 */

/**
 * Google Drive API types
 */
export const GOOGLE_DRIVE_API_TYPES = {
  PERMISSIONS: 'permissions',
  UNKNOWN: 'unknown',
} as const;

export type GoogleDriveApiType =
  (typeof GOOGLE_DRIVE_API_TYPES)[keyof typeof GOOGLE_DRIVE_API_TYPES];

/**
 * URL patterns for Google Drive APIs used in HTTP Request nodes
 */
export const GOOGLE_DRIVE_URL_PATTERNS = {
  PERMISSIONS: /googleapis\.com\/drive\/v3\/files\/.*\/permissions/i,
} as const;

/**
 * Re-export domain patterns for backward compatibility
 */
export { COMPANY_EMAIL_PATTERN, COMPANY_DOMAIN_PATTERN };
