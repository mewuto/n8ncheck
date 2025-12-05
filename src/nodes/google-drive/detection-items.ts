import type { INode } from 'n8n-workflow';
import { createSecurityDetectionItem } from '../../core/security-detection-item';
import { createConfigurationErrorMessage, type I18nMessage } from '../../utils/i18n-messages';
import type { GoogleDriveOperation, GoogleDriveResource } from './constants';
import type { IGoogleDriveExtractedValues, IGoogleDrivePermissionUI } from './types';

/**
 * Detection codes for Google Drive security issues
 */
export const GOOGLE_DRIVE_DETECTION_CODES = {
  CONFIG_ERROR: 'google-drive-config-error',
  PERMISSION_CONFIG_MISSING: 'google-drive-permission-config-missing',
  ANYONE_ACCESS_WARNING: 'google-drive-anyone-access-warning',
  DOMAIN_ACCESS_WARNING: 'google-drive-domain-access-warning',
  OWNER_TRANSFER_WARNING: 'google-drive-owner-transfer-warning',
  COMPANY_RESTRICTED: 'google-drive-company-restricted',
} as const;

/**
 * Detection items for Google Drive node security issues
 */
export const GoogleDriveDetectionItems = {
  /**
   * Creates detection item for configuration errors
   */
  configurationError(
    checkerId: string,
    node: INode,
    field: string | undefined,
    errorMessage: I18nMessage,
    resource?: GoogleDriveResource,
    operation?: GoogleDriveOperation
  ) {
    const message = createConfigurationErrorMessage(errorMessage, field);

    return createSecurityDetectionItem<IGoogleDriveExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.CONFIG_ERROR,
      severity: 'note',
      message,
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        field,
        resource,
        operation,
      },
    });
  },

  /**
   * Creates detection item for missing permission configuration
   */
  permissionConfigurationMissing(
    checkerId: string,
    node: INode,
    resource: GoogleDriveResource,
    operation: GoogleDriveOperation
  ) {
    return createSecurityDetectionItem<IGoogleDriveExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.PERMISSION_CONFIG_MISSING,
      severity: 'error',
      message: {
        en: `Permission configuration is missing for ${resource}.${operation} operation. Permission details must be configured to perform security analysis.`,
        ja: `${resource}.${operation} の権限設定が見つかりません。セキュリティ分析を実行するには権限の詳細を設定してください。`,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        resource,
        operation,
      },
    });
  },

  /**
   * Creates detection item for public access (anyone can access)
   */
  anyoneAccessError(
    checkerId: string,
    node: INode,
    resource: GoogleDriveResource,
    operation: GoogleDriveOperation,
    permissionsUi?: IGoogleDrivePermissionUI
  ) {
    return createSecurityDetectionItem<IGoogleDriveExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.ANYONE_ACCESS_WARNING,
      severity: 'error',
      message: {
        en: `${resource} is configured to be accessible by anyone. Please reconfigure access controls to restrict access to authorized users only. Permission data:\n\`\`\`json\n${JSON.stringify(permissionsUi, null, 2)}\n\`\`\``,
        ja: `${resource} が誰でもアクセス可能に設定されています。アクセス制御を再設定し、認証されたユーザーのみにアクセスを制限してください。権限データ:\n\`\`\`json\n${JSON.stringify(permissionsUi, null, 2)}\n\`\`\``,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        resource,
        operation,
        permissionsUi,
      },
    });
  },

  /**
   * Creates detection item for domain access warning
   */
  domainAccessWarning(
    checkerId: string,
    node: INode,
    resource: GoogleDriveResource,
    operation: GoogleDriveOperation,
    permissionsUi?: IGoogleDrivePermissionUI
  ) {
    const domain = permissionsUi?.permissionsValues?.domain;
    return createSecurityDetectionItem<IGoogleDriveExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.DOMAIN_ACCESS_WARNING,
      severity: 'warning',
      message: {
        en: `${resource} is configured to be accessible within the domain${domain ? ` (${domain})` : ''}. If domain-wide sharing is not necessary, please reconfigure access to share only with necessary members. Permission data:\n\`\`\`json\n${JSON.stringify(permissionsUi, null, 2)}\n\`\`\``,
        ja: `${resource} がドメイン内でアクセス可能に設定されています${domain ? ` (${domain})` : ''}。ドメイン全体での共有が不要な場合は、必要なメンバーのみと共有するように再設定してください。権限データ:\n\`\`\`json\n${JSON.stringify(permissionsUi, null, 2)}\n\`\`\``,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        resource,
        operation,
        permissionsUi,
      },
    });
  },

  /**
   * Creates detection item for owner transfer warning
   */
  ownerTransferWarning(
    checkerId: string,
    node: INode,
    resource: GoogleDriveResource,
    operation: GoogleDriveOperation,
    permissionsUi?: IGoogleDrivePermissionUI
  ) {
    const emailAddress = permissionsUi?.permissionsValues?.emailAddress;
    return createSecurityDetectionItem<IGoogleDriveExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.OWNER_TRANSFER_WARNING,
      severity: 'warning',
      message: {
        en: `${resource} ownership transfer is configured${emailAddress ? ` to ${emailAddress}` : ''}. Please verify that this ownership transfer is intentional and authorized. Permission data:\n\`\`\`json\n${JSON.stringify(permissionsUi, null, 2)}\n\`\`\``,
        ja: `${resource} の所有権譲渡が設定されています${emailAddress ? ` (譲渡先: ${emailAddress})` : ''}。この所有権譲渡が意図的で承認されたものであることを確認してください。権限データ:\n\`\`\`json\n${JSON.stringify(permissionsUi, null, 2)}\n\`\`\``,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        resource,
        operation,
        permissionsUi,
      },
    });
  },

  /**
   * Creates detection item for company user/group restricted access (Note level)
   */
  googleDriveCompanyRestricted(
    checkerId: string,
    node: INode,
    resource: GoogleDriveResource,
    operation: GoogleDriveOperation,
    permissionsUi?: IGoogleDrivePermissionUI
  ) {
    const emailAddress = permissionsUi?.permissionsValues?.emailAddress;
    return createSecurityDetectionItem<IGoogleDriveExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.COMPANY_RESTRICTED,
      severity: 'note',
      message: {
        en: `Access is appropriately restricted to authorized user/group${emailAddress ? ` (${emailAddress})` : ''}. This permission configuration follows security best practices. Permission data:\n\`\`\`json\n${JSON.stringify(permissionsUi, null, 2)}\n\`\`\``,
        ja: `アクセスは認証されたユーザー/グループに適切に制限されています${emailAddress ? ` (${emailAddress})` : ''}。この権限設定はセキュリティのベストプラクティスに従っています。権限データ:\n\`\`\`json\n${JSON.stringify(permissionsUi, null, 2)}\n\`\`\``,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        resource,
        operation,
        permissionsUi,
      },
    });
  },
} as const;
