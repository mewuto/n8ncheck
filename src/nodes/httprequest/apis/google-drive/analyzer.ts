import type { INode } from 'n8n-workflow';
import { hasDynamicConstruction, safeJsonParse } from '../../../../core/content-analyzer';
import type { ISecurityDetectionItem } from '../../../../core/security-detection-item';
import type {
  GoogleDrivePermissionRole,
  GoogleDrivePermissionType,
} from '../../../google-drive/constants';
import {
  isCompanyDomainBroad,
  isCompanyUserOrGroupRestricted,
  isPublicAccess,
} from '../../../google-drive/permission-utils';
import type { IGoogleDrivePermissionValues } from '../../../google-drive/types';
import { HTTP_METHODS, type HttpMethod } from '../../constants';
import { HttpRequestDetectionItems } from '../../detection-items';
import {
  GOOGLE_DRIVE_API_TYPES,
  GOOGLE_DRIVE_URL_PATTERNS,
  type GoogleDriveApiType,
} from './constants';
import { GoogleDriveDetectionItems } from './detection-items';

/**
 * Determine Google Drive API type based on URL pattern
 */
function determineApiType(url: string): GoogleDriveApiType {
  if (GOOGLE_DRIVE_URL_PATTERNS.PERMISSIONS.test(url)) {
    return GOOGLE_DRIVE_API_TYPES.PERMISSIONS;
  }
  return GOOGLE_DRIVE_API_TYPES.UNKNOWN;
}

/**
 * Analyze Google Drive HTTP Request and return detection items
 * Universal entry point for all Google Drive API analysis
 */
export function analyzeGoogleDriveHttpRequest(
  checkerId: string,
  node: INode,
  url: string,
  method?: HttpMethod,
  jsonBody?: string,
  bodyParameters?: { parameters?: Array<{ name: string; value: string }> }
): ISecurityDetectionItem[] {
  const apiType = determineApiType(url);

  // Route to specific analyzer based on API type
  switch (apiType) {
    case GOOGLE_DRIVE_API_TYPES.PERMISSIONS:
      return analyzePermissionsApi(checkerId, node, url, method, jsonBody, bodyParameters);
    default:
      // Return configuration error for unknown API patterns
      return [
        HttpRequestDetectionItems.configurationError(checkerId, node, {
          ja: `未知のGoogle Drive API URLパターンです: ${url}`,
          en: `Unknown Google Drive API URL pattern: ${url}`,
        }),
      ];
  }
}

/**
 * Analyze Google Drive Permissions API and return detection items
 * Specialized analyzer for permissions API calls
 */
function analyzePermissionsApi(
  checkerId: string,
  node: INode,
  url: string,
  method?: HttpMethod,
  jsonBody?: string,
  bodyParameters?: { parameters?: Array<{ name: string; value: string }> }
): ISecurityDetectionItem[] {
  const detectionItems: ISecurityDetectionItem[] = [];

  // Validate HTTP method for permissions API
  const httpMethod = method || HTTP_METHODS.GET;
  if (httpMethod !== HTTP_METHODS.POST) {
    detectionItems.push(
      HttpRequestDetectionItems.configurationError(checkerId, node, {
        ja: `Google Drive Permissions APIは通常POSTメソッドを使用します（現在: ${httpMethod}）`,
        en: `Google Drive Permissions API typically uses POST method (current: ${httpMethod})`,
      })
    );
    return detectionItems;
  }

  // Check if either JSON body or body parameters exist
  if (!jsonBody && !bodyParameters?.parameters) {
    detectionItems.push(
      GoogleDriveDetectionItems.googleDriveMissingRequiredConfig(checkerId, node, url)
    );
    return detectionItems;
  }

  let analysisItems: ISecurityDetectionItem[] = [];

  // Process JSON body if available
  if (jsonBody) {
    analysisItems = createDetectionItemsFromJsonBody(checkerId, node, url, jsonBody);
  }
  // Process body parameters if available
  else if (bodyParameters?.parameters) {
    analysisItems = createDetectionItemsFromBodyParameters(checkerId, node, url, bodyParameters);
  }

  detectionItems.push(...analysisItems);

  return detectionItems;
}

/**
 * Create detection items from JSON body string for Google Drive permissions
 */
function createDetectionItemsFromJsonBody(
  checkerId: string,
  node: INode,
  url: string,
  jsonBody: string
): ISecurityDetectionItem[] {
  try {
    const permissionData = safeJsonParse<IGoogleDrivePermissionValues>(jsonBody);
    return createDetectionItemsFromPermissionData(checkerId, node, url, permissionData, jsonBody);
  } catch {
    return [
      HttpRequestDetectionItems.configurationError(checkerId, node, {
        ja: 'JSONパース中エラーまたは無効な権限データ',
        en: 'JSON parsing error or invalid permission data',
      }),
    ];
  }
}

/**
 * Create detection items from body parameters for Google Drive permissions
 */
function createDetectionItemsFromBodyParameters(
  checkerId: string,
  node: INode,
  url: string,
  bodyParameters: { parameters?: Array<{ name: string; value: string }> }
): ISecurityDetectionItem[] {
  if (!bodyParameters.parameters) {
    return [GoogleDriveDetectionItems.googleDriveMissingRequiredConfig(checkerId, node, url)];
  }

  try {
    // Convert body parameters to permission data object using type-safe mapping
    const permissionData = convertParametersToGoogleDrivePermission(bodyParameters.parameters);

    return createDetectionItemsFromPermissionData(checkerId, node, url, permissionData);
  } catch {
    return [
      HttpRequestDetectionItems.configurationError(checkerId, node, {
        ja: 'ボディパラメータ処理エラー',
        en: 'Body parameter processing error',
      }),
    ];
  }
}

/**
 * Create detection items from permission data
 */
function createDetectionItemsFromPermissionData(
  checkerId: string,
  node: INode,
  url: string,
  permissionData: IGoogleDrivePermissionValues,
  jsonBody?: string
): ISecurityDetectionItem[] {
  const detectionItems: ISecurityDetectionItem[] = [];

  // Check for dynamic construction in permission data
  const contentToCheck = jsonBody || JSON.stringify(permissionData);
  if (hasDynamicConstruction(contentToCheck)) {
    detectionItems.push(
      HttpRequestDetectionItems.dynamicBodyConstruction(checkerId, node, contentToCheck, true)
    );
  }

  const type = permissionData.type || '';

  // Create detection items for all applicable conditions

  // Check for public access
  if (isPublicAccess(permissionData) && type) {
    detectionItems.push(
      GoogleDriveDetectionItems.googleDrivePublicAccess(
        checkerId,
        node,
        url,
        permissionData,
        jsonBody
      )
    );
  }

  // Check for company domain broad access (Warning)
  if (isCompanyDomainBroad(permissionData)) {
    detectionItems.push(
      GoogleDriveDetectionItems.googleDriveCompanyDomainBroad(
        checkerId,
        node,
        url,
        permissionData,
        jsonBody
      )
    );
  }

  // Check for company user/group restricted access (Note - appropriate)
  if (isCompanyUserOrGroupRestricted(permissionData) && type) {
    detectionItems.push(
      GoogleDriveDetectionItems.googleDriveCompanyRestricted(
        checkerId,
        node,
        url,
        permissionData,
        jsonBody
      )
    );
  }

  return detectionItems;
}

/**
 * Convert parameter array to IGoogleDrivePermissionValues
 */
function convertParametersToGoogleDrivePermission(
  parameters: Array<{ name: string; value: string }>
): IGoogleDrivePermissionValues {
  return parameters.reduce<IGoogleDrivePermissionValues>((result, param) => {
    switch (param.name.toLowerCase()) {
      case 'type':
        result.type = param.value as GoogleDrivePermissionType;
        break;
      case 'role':
        result.role = param.value as GoogleDrivePermissionRole;
        break;
      case 'emailaddress':
      case 'email':
        result.emailAddress = param.value;
        break;
      case 'domain':
        result.domain = param.value;
        break;
      case 'allowfilediscovery':
        result.allowFileDiscovery = param.value.toLowerCase() === 'true';
        break;
    }
    return result;
  }, {});
}
