import type { INode } from 'n8n-workflow';
import {
  createSecurityDetectionItem,
  type ISecurityDetectionItem,
} from '../../core/security-detection-item';
import { createConfigurationErrorMessage, type I18nMessage } from '../../utils/i18n-messages';

/**
 * Detection codes for Slack scenarios
 */
export const SLACK_DETECTION_CODES = {
  CHANNEL_DIRECT_ID_USED: 'SLACK_DIRECT_CHANNEL_ID',
  CONFIGURATION_ERROR: 'SLACK_CONFIG_ERROR',
} as const;

/**
 * Detection items for Slack node security issues
 */
export const SlackDetectionItems = {
  /**
   * Warning for direct channel ID usage
   */
  channelDirectId(checkerId: string, node: INode, channelId: string): ISecurityDetectionItem {
    const message: I18nMessage = {
      ja: `このチャンネルID (${channelId}) はパブリックチャンネルの可能性があります。Botの出力を特定のチームや個人に絞ることを検討してください（例：エフェメラルメッセージやスプレッドシート出力）。`,
      en: `This channel ID (${channelId}) may be a public channel. Consider limiting bot output to specific teams or individuals (e.g., ephemeral messages or spreadsheet output).`,
    };

    return createSecurityDetectionItem({
      checkerId,
      detectionCode: SLACK_DETECTION_CODES.CHANNEL_DIRECT_ID_USED,
      node,
      severity: 'warning',
      message,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: {
        value: channelId,
      },
    });
  },

  /**
   * Configuration error
   */
  configurationError(
    checkerId: string,
    node: INode,
    errorMessage: I18nMessage,
    field?: string
  ): ISecurityDetectionItem {
    const message = createConfigurationErrorMessage(errorMessage, field);

    return createSecurityDetectionItem({
      checkerId,
      detectionCode: SLACK_DETECTION_CODES.CONFIGURATION_ERROR,
      node,
      severity: 'note',
      message,
      analysisMethod: 'static',
      confidence: 1.0,
      extractedValues: field ? { field } : {},
    });
  },
};
