import type { INode } from 'n8n-workflow';
import {
  createSecurityDetectionItem,
  type ISecurityDetectionItem,
} from '../../core/security-detection-item';
import { createConfigurationErrorMessage, type I18nMessage } from '../../utils/i18n-messages';
import type { IIfExtractedValues } from './types';

export const IfDetectionItems = {
  configurationError(
    checkerId: string,
    node: INode,
    errorMessage: I18nMessage,
    field?: string
  ): ISecurityDetectionItem<IIfExtractedValues> {
    const message = createConfigurationErrorMessage(errorMessage, field);

    return createSecurityDetectionItem<IIfExtractedValues>({
      checkerId,
      detectionCode: 'CONFIGURATION_ERROR',
      severity: 'error',
      message,
      node,
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },
};
