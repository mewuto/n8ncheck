import type { INode } from 'n8n-workflow';
import {
  createSecurityDetectionItem,
  type ISecurityDetectionItem,
} from '../../core/security-detection-item';
import { createConfigurationErrorMessage, type I18nMessage } from '../../utils/i18n-messages';
import type { IHttpRequestExtractedValues } from './types';

/**
 * Detection codes for HTTP Request scenarios
 */
export const HTTPREQUEST_DETECTION_CODES = {
  PRODUCTION_URL_DETECTED: 'HTTP_PROD_URL',
  DYNAMIC_URL_CONSTRUCTION: 'HTTP_DYNAMIC_URL',
  DYNAMIC_BODY_CONSTRUCTION: 'HTTP_DYNAMIC_BODY',
  CONFIGURATION_ERROR: 'HTTP_CONFIG_ERROR',
} as const;

/**
 * HTTP Request-specific SecurityDetectionItem factory functions
 */
export const HttpRequestDetectionItems = {
  /**
   * Create detection item for production URL access
   */
  productionUrlDetected(checkerId: string, node: INode, url: string): ISecurityDetectionItem {
    return createSecurityDetectionItem<IHttpRequestExtractedValues>({
      checkerId,
      detectionCode: HTTPREQUEST_DETECTION_CODES.PRODUCTION_URL_DETECTED,
      severity: 'warning',
      message: {
        en: `Production environment URL \`${url}\` access detected. Please confirm if access is allowed.`,
        ja: `本番環境URL \`${url}\` へのアクセスが検出されました。本当にアクセスして良いか確認してください。`,
      },
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        url,
      },
    });
  },

  /**
   * Create detection item for dynamic URL construction
   */
  dynamicUrlConstruction(checkerId: string, node: INode, url: string): ISecurityDetectionItem {
    return createSecurityDetectionItem<IHttpRequestExtractedValues>({
      checkerId,
      detectionCode: HTTPREQUEST_DETECTION_CODES.DYNAMIC_URL_CONSTRUCTION,
      severity: 'warning',
      message: {
        en: `Dynamic URL construction detected: \`${url.substring(0, 100)}${url.length > 100 ? '...' : ''}\`. Please verify that proper input validation and access controls are configured for the target endpoints.`,
        ja: `動的URL構築が検出されました: \`${url.substring(0, 100)}${url.length > 100 ? '...' : ''}\`。対象エンドポイントに対して適切な入力検証とアクセス制御が設定されているかを確認してください。`,
      },
      node,
      analysisMethod: 'static',
      confidence: 0.8,
      extractedValues: {
        url,
      },
    });
  },

  /**
   * Create detection item for dynamic body construction
   */
  dynamicBodyConstruction(
    checkerId: string,
    node: INode,
    body: string,
    isJsonBody?: boolean
  ): ISecurityDetectionItem {
    const codeBlockType = isJsonBody ? 'json' : '';
    const bodyField = isJsonBody ? 'jsonBody' : 'body';

    return createSecurityDetectionItem<IHttpRequestExtractedValues>({
      checkerId,
      detectionCode: HTTPREQUEST_DETECTION_CODES.DYNAMIC_BODY_CONSTRUCTION,
      severity: 'warning',
      message: {
        en: `Dynamic ${isJsonBody ? 'JSON ' : ''}body construction detected. ${isJsonBody ? 'JSON ' : ''}Body:\n\`\`\`${codeBlockType}\n${body.substring(0, 200)}${body.length > 200 ? '\n...' : ''}\n\`\`\`\nPlease check what values will be included in this dynamic construction.`,
        ja: `動的${isJsonBody ? 'JSON ' : ''}ボディ構築が検出されました。${isJsonBody ? 'JSON ' : ''}ボディ:\n\`\`\`${codeBlockType}\n${body.substring(0, 200)}${body.length > 200 ? '\n...' : ''}\n\`\`\`\nこの動的構築にどのような値が含まれるかを確認してください。`,
      },
      node,
      analysisMethod: 'static',
      confidence: 0.8,
      extractedValues: {
        url: '',
        [bodyField]: body,
      },
    });
  },

  /**
   * Create detection item for configuration errors
   */
  configurationError(
    checkerId: string,
    node: INode,
    message: I18nMessage,
    configInfo?: Partial<IHttpRequestExtractedValues>
  ): ISecurityDetectionItem {
    const detectionMessage = createConfigurationErrorMessage(message);

    return createSecurityDetectionItem<IHttpRequestExtractedValues>({
      checkerId,
      detectionCode: HTTPREQUEST_DETECTION_CODES.CONFIGURATION_ERROR,
      severity: 'note',
      message: detectionMessage,
      node,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        url: '',
        ...configInfo,
      },
    });
  },
};
