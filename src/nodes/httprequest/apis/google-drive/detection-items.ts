import type { INode } from 'n8n-workflow';
import {
  createSecurityDetectionItem,
  type ISecurityDetectionItem,
} from '../../../../core/security-detection-item';
import type { IGoogleDrivePermissionValues } from '../../../google-drive/types';
import type { IHttpRequestExtractedValues } from '../../types';

/**
 * Detection codes for Google Drive HTTP Request scenarios
 */
export const GOOGLE_DRIVE_DETECTION_CODES = {
  GOOGLE_DRIVE_PUBLIC_ACCESS: 'HTTP_GDRIVE_PUBLIC_ACCESS',
  GOOGLE_DRIVE_COMPANY_DOMAIN_BROAD: 'HTTP_GDRIVE_COMPANY_DOMAIN_BROAD',
  GOOGLE_DRIVE_COMPANY_RESTRICTED: 'HTTP_GDRIVE_COMPANY_RESTRICTED',
  GOOGLE_DRIVE_MISSING_REQUIRED_CONFIG: 'HTTP_GDRIVE_MISSING_CONFIG',
} as const;

/**
 * Google Drive-specific SecurityDetectionItem factory functions
 */
export const GoogleDriveDetectionItems = {
  /**
   * Create detection item for public access (Error level)
   */
  googleDrivePublicAccess(
    checkerId: string,
    node: INode,
    url: string,
    permissionData: IGoogleDrivePermissionValues,
    jsonBody?: string
  ): ISecurityDetectionItem {
    return createSecurityDetectionItem<IHttpRequestExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.GOOGLE_DRIVE_PUBLIC_ACCESS,
      severity: 'error',
      message: {
        en: `Resource is configured to be accessible by anyone. Please reconfigure access controls to restrict access to authorized users only. Permission data:\n\`\`\`json\n${JSON.stringify(permissionData, null, 2)}\n\`\`\``,
        ja: `リソースが誰でもアクセス可能に設定されています。アクセス制御を再設定し、認証されたユーザーのみにアクセスを制限してください。権限データ:\n\`\`\`json\n${JSON.stringify(permissionData, null, 2)}\n\`\`\``,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        url,
        jsonBody,
        googleDrivePermission: permissionData,
      },
    });
  },

  /**
   * Create detection item for company domain broad access (Warning level)
   */
  googleDriveCompanyDomainBroad(
    checkerId: string,
    node: INode,
    url: string,
    permissionData: IGoogleDrivePermissionValues,
    jsonBody?: string
  ): ISecurityDetectionItem {
    const domain = permissionData.domain;
    return createSecurityDetectionItem<IHttpRequestExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.GOOGLE_DRIVE_COMPANY_DOMAIN_BROAD,
      severity: 'warning',
      message: {
        en: `Resource is configured to be accessible within the domain${domain ? ` (${domain})` : ''}. If domain-wide sharing is not necessary, please reconfigure access to share only with necessary members. Permission data:\n\`\`\`json\n${JSON.stringify(permissionData, null, 2)}\n\`\`\``,
        ja: `リソースがドメイン内でアクセス可能に設定されています${domain ? ` (${domain})` : ''}。ドメイン全体での共有が不要な場合は、必要なメンバーのみと共有するように再設定してください。権限データ:\n\`\`\`json\n${JSON.stringify(permissionData, null, 2)}\n\`\`\``,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        url,
        jsonBody,
        googleDrivePermission: permissionData,
      },
    });
  },

  /**
   * Create detection item for company user/group restricted access (Note level)
   */
  googleDriveCompanyRestricted(
    checkerId: string,
    node: INode,
    url: string,
    permissionData: IGoogleDrivePermissionValues,
    jsonBody?: string
  ): ISecurityDetectionItem {
    const emailAddress = permissionData.emailAddress;
    return createSecurityDetectionItem<IHttpRequestExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.GOOGLE_DRIVE_COMPANY_RESTRICTED,
      severity: 'none',
      message: {
        en: `Access is appropriately restricted to authorized user/group${emailAddress ? ` (${emailAddress})` : ''}. This permission configuration follows security best practices. Permission data:\n\`\`\`json\n${JSON.stringify(permissionData, null, 2)}\n\`\`\``,
        ja: `アクセスは認証されたユーザー/グループに適切に制限されています${emailAddress ? ` (${emailAddress})` : ''}。この権限設定はセキュリティのベストプラクティスに従っています。権限データ:\n\`\`\`json\n${JSON.stringify(permissionData, null, 2)}\n\`\`\``,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        url,
        jsonBody,
        googleDrivePermission: permissionData,
      },
    });
  },

  /**
   * Create detection item for missing required configuration (Error level)
   */
  googleDriveMissingRequiredConfig(
    checkerId: string,
    node: INode,
    url: string
  ): ISecurityDetectionItem {
    return createSecurityDetectionItem<IHttpRequestExtractedValues>({
      checkerId,
      detectionCode: GOOGLE_DRIVE_DETECTION_CODES.GOOGLE_DRIVE_MISSING_REQUIRED_CONFIG,
      severity: 'error',
      message: {
        en: 'Permission configuration is missing. Permission details must be configured to perform security analysis.',
        ja: '権限設定が見つかりません。セキュリティ分析を実行するには権限の詳細を設定してください。',
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        url,
      },
    });
  },
};
