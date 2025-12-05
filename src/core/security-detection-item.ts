import type { INode } from 'n8n-workflow';
import type { SeverityLevel } from '../types/core/sarif-report.types';
import type { I18nMessage } from '../utils/i18n-messages';
import type { ExtractedValues } from './extracted-values.types';

/**
 * Security detection item from a checker (SARIF-compliant)
 */
export interface ISecurityDetectionItem<T extends ExtractedValues = ExtractedValues> {
  checkerId: string;
  detectionCode: string;
  severity: SeverityLevel;
  message: I18nMessage;
  nodeId?: string;
  nodeName?: string;
  nodeType?: string;

  // 関連ノード情報
  relatedNodes?: Array<{
    id: string;
    name: string;
    type: string;
  }>;

  // SARIF準拠の構造化された情報
  extractedValues: T;
  analysisMethod: 'static' | 'ai';
  confidence: number;
}

/**
 * Create a SecurityDetectionItem using a simple, direct approach
 */
export function createSecurityDetectionItem<T extends ExtractedValues = ExtractedValues>(params: {
  checkerId: string;
  detectionCode: string;
  severity: SeverityLevel;
  message: I18nMessage;
  node: INode;
  analysisMethod: 'static' | 'ai';
  confidence: number;
  relatedNodes?: INode[];
  extractedValues?: T;
}): ISecurityDetectionItem<T> {
  const {
    checkerId,
    detectionCode,
    severity,
    message,
    node,
    relatedNodes,
    extractedValues = {} as T,
    analysisMethod,
    confidence,
  } = params;

  return {
    checkerId,
    detectionCode,
    severity,
    message,
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    extractedValues,
    analysisMethod,
    confidence,
    ...(relatedNodes?.length && {
      relatedNodes: relatedNodes.map(({ id, name, type }) => ({ id, name, type })),
    }),
  };
}
