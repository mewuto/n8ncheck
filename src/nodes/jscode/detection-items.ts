import type { INode } from 'n8n-workflow';
import {
  findNetworkAccessWithContext,
  findProdStringWithContext,
} from '../../core/content-analyzer';
import {
  createSecurityDetectionItem,
  type ISecurityDetectionItem,
} from '../../core/security-detection-item';
import { createConfigurationErrorMessage, type I18nMessage } from '../../utils/i18n-messages';
import type { IJSCodeExtractedValues } from './types';

/**
 * Detection codes for JSCode scenarios
 */
const JSCODE_DETECTION_CODES = {
  NETWORK_ACCESS_DETECTED: 'JSCODE_NETWORK_ACCESS',
  PRODUCTION_ACCESS_DETECTED: 'JSCODE_PROD_ACCESS',
  CONFIGURATION_ERROR: 'JSCODE_CONFIG_ERROR',
  PYTHON_NOT_SUPPORTED: 'JSCODE_PYTHON_NOT_SUPPORTED',
} as const;

/**
 * JavaScript Code-specific SecurityDetectionItem factory functions
 *
 * These functions provide a clean, type-safe way to create SecurityDetectionItems
 * for JavaScript code-related security issues.
 */
export const JSCodeDetectionItems = {
  /**
   * Create detection for network access
   */
  networkAccess(checkerId: string, node: INode, jsCode: string): ISecurityDetectionItem {
    const context = findNetworkAccessWithContext(jsCode);

    let enMessage =
      'Network access detected in JavaScript code. Consider using appropriate nodes instead of defining network access in JSCode.';
    let jaMessage =
      'JavaScriptコード内でネットワークアクセスが検出されました。JSCodeで定義するのではなく適切なノードを使用することを検討してください。';

    if (context?.found && context.contextCode) {
      enMessage += `\n\nDetected at line ${context.lineNumber}:\n\`\`\`javascript\n${context.contextCode}\n\`\`\``;
      jaMessage += `\n\n${context.lineNumber}行目で検出:\n\`\`\`javascript\n${context.contextCode}\n\`\`\``;
    }

    return createSecurityDetectionItem<IJSCodeExtractedValues>({
      checkerId,
      detectionCode: JSCODE_DETECTION_CODES.NETWORK_ACCESS_DETECTED,
      severity: 'warning',
      message: {
        en: enMessage,
        ja: jaMessage,
      },
      node,
      extractedValues: {
        language: 'javaScript' as const,
        jsCode,
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Create detection for production access in code
   */
  productionAccess(checkerId: string, node: INode, jsCode: string): ISecurityDetectionItem {
    const context = findProdStringWithContext(jsCode);

    let enMessage = 'Production environment reference detected in JavaScript code.';
    let jaMessage = 'JavaScriptコード内でプロダクション環境への参照が検出されました。';

    if (context?.found && context.contextCode) {
      enMessage += `\n\nDetected at line ${context.lineNumber}:\n\`\`\`javascript\n${context.contextCode}\n\`\`\``;
      jaMessage += `\n\n${context.lineNumber}行目で検出:\n\`\`\`javascript\n${context.contextCode}\n\`\`\``;
    }

    return createSecurityDetectionItem<IJSCodeExtractedValues>({
      checkerId,
      detectionCode: JSCODE_DETECTION_CODES.PRODUCTION_ACCESS_DETECTED,
      severity: 'warning',
      message: {
        en: enMessage,
        ja: jaMessage,
      },
      node,
      extractedValues: {
        language: 'javaScript' as const,
        jsCode,
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Create detection for configuration errors
   */
  configurationError(
    checkerId: string,
    node: INode,
    errorMessage: I18nMessage,
    codeInfo?: Partial<IJSCodeExtractedValues>
  ): ISecurityDetectionItem {
    return createSecurityDetectionItem<IJSCodeExtractedValues>({
      checkerId,
      detectionCode: JSCODE_DETECTION_CODES.CONFIGURATION_ERROR,
      severity: 'note',
      message: createConfigurationErrorMessage(errorMessage),
      node,
      extractedValues: {
        language: 'javaScript' as const,
        ...codeInfo,
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Create detection for Python code not supported
   */
  pythonNotSupported(checkerId: string, node: INode): ISecurityDetectionItem {
    return createSecurityDetectionItem({
      checkerId,
      detectionCode: JSCODE_DETECTION_CODES.PYTHON_NOT_SUPPORTED,
      severity: 'error',
      message: {
        en: 'Python code is not supported. Please reconfigure to use JavaScript code instead.',
        ja: 'Pythonコードはサポートされていません。JavaScriptコードを使用するよう設定を変更してください。',
      },
      node,
      extractedValues: {},
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },
};
