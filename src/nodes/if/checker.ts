import type { FilterValue, INode } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import { COMMON_NODE_MESSAGES } from '../../utils/i18n-messages';
import { BaseNodeChecker } from '../shared/base-node-checker';
import { IF_CHECKER_ID } from './constants';
import { IfDetectionItems } from './detection-items';
import { IfSchemaValidator } from './schema-validator';
import type { IIfExtractedValues } from './types';

export class IfChecker extends BaseNodeChecker<IIfExtractedValues> {
  private schemaValidator: IfSchemaValidator;

  constructor(context: ICheckerContext) {
    super(IF_CHECKER_ID, 'If Checker', 'Maps If node configuration to typed parameters', context);
    this.schemaValidator = new IfSchemaValidator();
  }

  getSupportedNodeTypes(): string[] {
    return [NODE_TYPES.IF];
  }

  categorizeNode(node: INode): IIfExtractedValues {
    const rawParams = node.parameters;

    return {
      conditions: rawParams?.conditions as FilterValue | undefined,
      options: rawParams?.options as { ignoreCase?: boolean } | undefined,
    };
  }

  checkNode(node: INode): ISecurityDetectionItem<IIfExtractedValues>[] {
    const detections: ISecurityDetectionItem<IIfExtractedValues>[] = [];

    // Check if node parameters exist
    const params = node.parameters;
    if (!params) {
      detections.push(
        IfDetectionItems.configurationError(
          this.id,
          node,
          COMMON_NODE_MESSAGES.PARAMETERS_NOT_CONFIGURED()
        )
      );
      return detections;
    }

    // Validate parameters
    const typedParams = this.schemaValidator.mapToTypedParams(params);
    if (!typedParams) {
      detections.push(
        IfDetectionItems.configurationError(
          this.id,
          node,
          COMMON_NODE_MESSAGES.PARAMETERS_NOT_CONFIGURED()
        )
      );
      return detections;
    }

    return detections;
  }
}
