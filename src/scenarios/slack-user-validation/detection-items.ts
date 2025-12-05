import type { INode } from 'n8n-workflow';
import type { ISlackExtractedValues } from '../../core/extracted-values.types';
import {
  createSecurityDetectionItem,
  type ISecurityDetectionItem,
} from '../../core/security-detection-item';
import type { IIfValidationDetails, IJSCodeValidationDetails } from './types';

/**
 * Detection codes for Slack user validation scenarios
 */
export const SLACK_USER_VALIDATION_DETECTION_CODES = {
  VALIDATION_NODE_MISSING: 'SLACK_VALIDATION_NO_VALIDATION_NODE',
  JSCODE_VALIDATION_INCOMPLETE: 'SLACK_JSCODE_VALIDATION_INCOMPLETE',
  JSCODE_VALIDATION_IMPLEMENTED: 'SLACK_JSCODE_VALIDATION_IMPLEMENTED',
  IF_VALIDATION_INCOMPLETE: 'SLACK_IF_VALIDATION_INCOMPLETE',
  IF_VALIDATION_IMPLEMENTED: 'SLACK_IF_VALIDATION_IMPLEMENTED',
  INVALID_EXTERNAL_CONNECTIONS: 'SLACK_VALIDATION_INVALID_EXTERNAL_CONNECTIONS',
} as const;

/**
 * Slack User Validation specific SecurityDetectionItem factory functions
 */
export const SlackUserValidationDetectionItems = {
  /**
   * Create detection for missing validation node after Slack Trigger
   */
  missingValidationNode(
    checkerId: string,
    slackTriggerNode: INode,
    directDownstreamNodes: INode[]
  ): ISecurityDetectionItem<ISlackExtractedValues> {
    return createSecurityDetectionItem<ISlackExtractedValues>({
      checkerId,
      detectionCode: SLACK_USER_VALIDATION_DETECTION_CODES.VALIDATION_NODE_MISSING,
      severity: 'error',
      message: {
        en: `Slack Trigger lacks user validation. Please implement proper user validation.`,
        ja: `Slack Triggerにユーザー検証が不足しています。適切なユーザー検証を実装してください。`,
      },
      node: slackTriggerNode,
      relatedNodes: directDownstreamNodes,
      extractedValues: {
        hasValidation: false,
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Create detection for incomplete user validation in JSCode nodes
   */
  incompleteJSCodeValidation(
    checkerId: string,
    slackTriggerNode: INode,
    codeNode: INode,
    validationDetails: IJSCodeValidationDetails,
    confidence: number
  ): ISecurityDetectionItem<ISlackExtractedValues> {
    const missingItemsEn = [];
    const missingItemsJa = [];

    if (!validationDetails.hasUserIdExtraction) {
      missingItemsEn.push('User ID extraction: Add using `$input.item.json.user` or `$json.user`');
      missingItemsJa.push(
        'ユーザーID抽出: `$input.item.json.user` または `$json.user` を使用して追加'
      );
    }
    if (!validationDetails.hasAuthorizationList) {
      missingItemsEn.push(
        'Authorization list: Define as object (variable name must be "users"): `const users = { "userId1": "userName1", "userId2": "userName2" }`'
      );
      missingItemsJa.push(
        '認証リスト: オブジェクトとして定義（変数名は "users" である必要があります）: `const users = { "userId1": "userName1", "userId2": "userName2" }`'
      );
    }
    if (!validationDetails.hasValidationLogic) {
      missingItemsEn.push(
        'Validation logic: Add check like `if (!users.hasOwnProperty(userId))`, `if (!(userId in users))` etc.'
      );
      missingItemsJa.push(
        '検証ロジック: `if (!users.hasOwnProperty(userId))`, `if (!(userId in users))` などのチェックを追加'
      );
    }
    if (!validationDetails.hasErrorHandling) {
      missingItemsEn.push(
        'Error handling: Add `return` or `throw` statement inside the validation if statement etc.'
      );
      missingItemsJa.push(
        'エラーハンドリング: 検証のif文内に `return` または `throw` ステートメントを追加'
      );
    }

    // Create structured markdown message for English
    const baseMessageEn = `Slack Trigger has incomplete user validation. Please refer to the following "Missing elements and fixes" and configure the Code node "${codeNode.name}":`;
    const missingSectionEn = `\n  - Missing elements and fixes:\n${missingItemsEn.map((item, index) => `  - ${index + 1}. ${item}`).join('\n')}`;

    // Create structured markdown message for Japanese
    const baseMessageJa = `Slack Triggerにユーザー検証が不完全です。以下の「不足している要素と修正方法」を参考にCodeノード "${codeNode.name}" を設定してください：`;
    const missingSectionJa = `\n  - 不足している要素と修正方法:\n${missingItemsJa.map((item, index) => `  - ${index + 1}. ${item}`).join('\n')}`;

    return createSecurityDetectionItem<ISlackExtractedValues>({
      checkerId,
      detectionCode: SLACK_USER_VALIDATION_DETECTION_CODES.JSCODE_VALIDATION_INCOMPLETE,
      severity: 'error',
      message: {
        en: `${baseMessageEn}${missingSectionEn}`,
        ja: `${baseMessageJa}${missingSectionJa}`,
      },
      node: slackTriggerNode,
      relatedNodes: [codeNode],
      extractedValues: {
        ...validationDetails,
      },
      analysisMethod: 'static',
      confidence,
    });
  },

  /**
   * Create detection for incomplete user validation in If nodes
   */
  incompleteIfValidation(
    checkerId: string,
    slackTriggerNode: INode
  ): ISecurityDetectionItem<ISlackExtractedValues> {
    return createSecurityDetectionItem<ISlackExtractedValues>({
      checkerId,
      detectionCode: SLACK_USER_VALIDATION_DETECTION_CODES.IF_VALIDATION_INCOMPLETE,
      severity: 'error',
      message: {
        en: `Slack Trigger lacks user validation. Please implement proper user validation.`,
        ja: `Slack Triggerにユーザー検証が不足しています。適切なユーザー検証を実装してください。`,
      },
      node: slackTriggerNode,
      relatedNodes: [],
      extractedValues: {},
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Create detection for valid JSCode user validation (success case)
   */
  validJSCodeValidation(
    checkerId: string,
    slackTriggerNode: INode,
    codeNode: INode,
    validationDetails: IJSCodeValidationDetails,
    confidence: number
  ): ISecurityDetectionItem<ISlackExtractedValues> {
    return createSecurityDetectionItem<ISlackExtractedValues>({
      checkerId,
      detectionCode: SLACK_USER_VALIDATION_DETECTION_CODES.JSCODE_VALIDATION_IMPLEMENTED,
      severity: 'none',
      message: {
        en: `Slack Trigger has proper user validation implemented in Code node. Authorized user count: ${validationDetails.authorizedUserCount || 'unknown'}`,
        ja: `Slack TriggerのCodeノードで適切なユーザー検証が実装されています。承認済みユーザー数: ${validationDetails.authorizedUserCount || '不明'}`,
      },
      node: slackTriggerNode,
      relatedNodes: [codeNode],
      extractedValues: {
        ...validationDetails,
      },
      analysisMethod: 'static',
      confidence,
    });
  },

  /**
   * Create detection for valid If node user validation (success case)
   */
  validIfValidation(
    checkerId: string,
    slackTriggerNode: INode,
    ifNode: INode,
    validationDetails: IIfValidationDetails
  ): ISecurityDetectionItem<ISlackExtractedValues> {
    return createSecurityDetectionItem<ISlackExtractedValues>({
      checkerId,
      detectionCode: SLACK_USER_VALIDATION_DETECTION_CODES.IF_VALIDATION_IMPLEMENTED,
      severity: 'none',
      message: {
        en: `Slack Trigger has proper user validation implemented in If node.`,
        ja: `Slack TriggerのIfノードで適切なユーザー検証が実装されています。`,
      },
      node: slackTriggerNode,
      relatedNodes: [ifNode],
      extractedValues: {
        ...validationDetails,
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Create detection for invalid external connections in validation path
   */
  invalidExternalConnections(
    checkerId: string,
    slackTriggerNode: INode,
    validationNode: INode,
    externalNodes: INode[],
    confidence: number
  ): ISecurityDetectionItem<ISlackExtractedValues> {
    const externalNodeNames = externalNodes.map((node) => `"${node.name}"`).join(', ');

    return createSecurityDetectionItem<ISlackExtractedValues>({
      checkerId,
      detectionCode: SLACK_USER_VALIDATION_DETECTION_CODES.INVALID_EXTERNAL_CONNECTIONS,
      severity: 'error',
      message: {
        en: `Slack Trigger requires user validation before external access. Please implement user validation first, then configure external nodes (${externalNodeNames}).`,
        ja: `Slack Triggerでは外部アクセス前にユーザーバリデーションが必要です。まずユーザーバリデーションを実装してから、外部ノード (${externalNodeNames}) を設定してください。`,
      },
      node: slackTriggerNode,
      relatedNodes: [validationNode, ...externalNodes],
      extractedValues: {
        hasValidation: false,
      },
      analysisMethod: 'static',
      confidence,
    });
  },
};
