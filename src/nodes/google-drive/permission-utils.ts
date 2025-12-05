import { COMPANY_DOMAIN_PATTERN, COMPANY_EMAIL_PATTERN } from '../../constants/email-patterns';
import { GOOGLE_DRIVE_PERMISSION_ROLES, GOOGLE_DRIVE_PERMISSION_TYPES } from './constants';
import type { IGoogleDrivePermissionValues } from './types';

/**
 * Utility functions for Google Drive permission analysis
 * These functions are shared between Google Drive node checker and HTTP Request analyzer
 */

/**
 * Check if permission grants public access (Error level)
 */
export function isPublicAccess(permissionData: IGoogleDrivePermissionValues): boolean {
  const type = permissionData.type;

  // Direct public access
  if (type === GOOGLE_DRIVE_PERMISSION_TYPES.ANYONE) {
    return true;
  }

  return false;
}

/**
 * Check if permission grants domain access (Warning level)
 */
export function isDomainAccess(permissionData: IGoogleDrivePermissionValues): boolean {
  const type = permissionData.type;
  return type === GOOGLE_DRIVE_PERMISSION_TYPES.DOMAIN;
}

/**
 * Check if permission grants broad company domain access (Warning level)
 */
export function isCompanyDomainBroad(permissionData: IGoogleDrivePermissionValues): boolean {
  const type = permissionData.type;
  const domain = permissionData.domain;
  const emailAddress = permissionData.emailAddress;

  // Check domain field for domain type
  if (type === GOOGLE_DRIVE_PERMISSION_TYPES.DOMAIN && domain) {
    return COMPANY_DOMAIN_PATTERN.test(domain);
  }

  // Some implementations incorrectly use emailAddress for domain type
  // Extract domain from emailAddress if type is 'domain' but no domain field
  if (type === GOOGLE_DRIVE_PERMISSION_TYPES.DOMAIN && !domain && emailAddress) {
    const extractedDomain = emailAddress.split('@')[1];
    if (extractedDomain) {
      return COMPANY_DOMAIN_PATTERN.test(extractedDomain);
    }
  }

  return false;
}

/**
 * Check if permission is restricted to company user/group (Note level - appropriate)
 */
export function isCompanyUserOrGroupRestricted(
  permissionData: IGoogleDrivePermissionValues
): boolean {
  const type = permissionData.type;
  const emailAddress = permissionData.emailAddress;

  // Check email field for user type
  if (type === GOOGLE_DRIVE_PERMISSION_TYPES.USER && emailAddress) {
    return COMPANY_EMAIL_PATTERN.test(emailAddress);
  }

  // Check email field for group type
  if (type === GOOGLE_DRIVE_PERMISSION_TYPES.GROUP && emailAddress) {
    return COMPANY_EMAIL_PATTERN.test(emailAddress);
  }

  return false;
}

/**
 * Check if permission involves ownership transfer (Warning level)
 */
export function isOwnerTransfer(permissionData: IGoogleDrivePermissionValues): boolean {
  const role = permissionData.role;
  return role === GOOGLE_DRIVE_PERMISSION_ROLES.OWNER;
}
