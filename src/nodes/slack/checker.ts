import type { INode, INodeParameterResourceLocator } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import { COMMON_NODE_MESSAGES } from '../../utils/i18n-messages';
import { extractResourceValue } from '../../utils/resource-locator';
import { BaseNodeChecker } from '../shared/base-node-checker';
import {
  CHANNEL_OPERATIONS,
  FILE_OPERATIONS,
  MESSAGE_OPERATIONS,
  REACTION_OPERATIONS,
  SLACK_CHANNEL_MODES,
  SLACK_CHECKER_ID,
  SLACK_RESOURCES,
  STAR_OPERATIONS,
  USER_GROUP_OPERATIONS,
  USER_OPERATIONS,
} from './constants';
import { SlackDetectionItems } from './detection-items';
import { SlackSchemaValidator } from './schema-validator';
import {
  type ISlackMessageSendParameters,
  type ISlackTypedParameters,
  isISlackMessageSendParameters,
} from './types';

/**
 * Security checker for Slack nodes
 * Detects potentially dangerous patterns in Slack node configurations
 */
export class SlackChecker extends BaseNodeChecker {
  private schemaValidator: SlackSchemaValidator;

  constructor(context: ICheckerContext) {
    super(
      SLACK_CHECKER_ID,
      'Slack Checker',
      'Checks Slack nodes for unsafe configurations',
      context
    );
    this.schemaValidator = new SlackSchemaValidator();
  }

  getSupportedNodeTypes(): string[] {
    return [NODE_TYPES.SLACK, NODE_TYPES.SLACK_TOOL];
  }

  private isSlackNode(node: INode): boolean {
    return this.getSupportedNodeTypes().includes(node.type);
  }

  checkNode(node: INode): ISecurityDetectionItem[] {
    this.logHeader(node);

    const detectionItems: ISecurityDetectionItem[] = [];

    // Check if node is Slack type
    if (!this.isSlackNode(node)) {
      return detectionItems;
    }

    // Get node parameters
    const params = node.parameters;
    if (!params) {
      detectionItems.push(
        SlackDetectionItems.configurationError(
          this.id,
          node,
          COMMON_NODE_MESSAGES.PARAMETERS_NOT_CONFIGURED()
        )
      );
      return detectionItems;
    }

    // 1. Map raw parameters to strict typed parameters
    const mappingResult = this.schemaValidator.mapToTypedParams(params);

    // Handle mapping errors
    if (mappingResult.errors.length > 0 || !mappingResult.params) {
      mappingResult.errors.forEach((error) => {
        detectionItems.push(SlackDetectionItems.configurationError(this.id, node, error.message));
      });
      return detectionItems;
    }

    const typedParams = mappingResult.params;

    // 2. Validate strict typed parameters (schema validation only)
    const validationResult = this.schemaValidator.validate(params);

    // 3. Convert validation errors to security detection items
    detectionItems.push(...this.convertValidationToDetectionItems(node, validationResult));

    // 4. Additional security-specific checks with typed parameters
    detectionItems.push(...this.performSecurityChecks(node, typedParams));

    return detectionItems;
  }

  /**
   * Security checks with typed parameters
   */
  private performSecurityChecks(
    node: INode,
    params: ISlackTypedParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    // Categorize node
    this.categorizeNode(node, params);

    // Check for message post with channel ID
    if (isISlackMessageSendParameters(params)) {
      detectionItems.push(...this.checkMessagePostSecurity(node, params));
    }

    return detectionItems;
  }

  /**
   * Categorize Slack node based on resource and operation
   */
  protected categorizeNode(_node: INode, params: ISlackTypedParameters): void {
    const SERVICE_NAME = 'slack';

    const { resource, operation } = params;

    // Data source operations (reading data)
    const dataSourceOperations = [
      // Message operations
      { resource: SLACK_RESOURCES.MESSAGE, operation: MESSAGE_OPERATIONS.SEARCH },
      { resource: SLACK_RESOURCES.MESSAGE, operation: MESSAGE_OPERATIONS.GET_PERMALINK },
      // Channel operations
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.GET },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.GET_ALL },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.HISTORY },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.MEMBER },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.REPLIES },
      // File operations
      { resource: SLACK_RESOURCES.FILE, operation: FILE_OPERATIONS.GET },
      { resource: SLACK_RESOURCES.FILE, operation: FILE_OPERATIONS.GET_ALL },
      // User operations
      { resource: SLACK_RESOURCES.USER, operation: USER_OPERATIONS.GET_ALL },
      { resource: SLACK_RESOURCES.USER, operation: USER_OPERATIONS.GET_PRESENCE },
      { resource: SLACK_RESOURCES.USER, operation: USER_OPERATIONS.GET_PROFILE },
      { resource: SLACK_RESOURCES.USER, operation: USER_OPERATIONS.INFO },
      // User group operations
      { resource: SLACK_RESOURCES.USER_GROUP, operation: USER_GROUP_OPERATIONS.GET_ALL },
      // Star operations
      { resource: SLACK_RESOURCES.STAR, operation: STAR_OPERATIONS.GET_ALL },
      // Reaction operations
      { resource: SLACK_RESOURCES.REACTION, operation: REACTION_OPERATIONS.GET },
    ];

    // Check if it's a data source operation
    const isDataSource = dataSourceOperations.some(
      (op) => op.resource === resource && op.operation === operation
    );

    if (isDataSource) {
      this.addToCategory('dataSource', SERVICE_NAME);
      return;
    }

    // Output operations (writing/modifying data)
    const outputOperations = [
      // Message operations
      { resource: SLACK_RESOURCES.MESSAGE, operation: MESSAGE_OPERATIONS.SEND },
      { resource: SLACK_RESOURCES.MESSAGE, operation: MESSAGE_OPERATIONS.SEND_AND_WAIT },
      { resource: SLACK_RESOURCES.MESSAGE, operation: MESSAGE_OPERATIONS.UPDATE },
      { resource: SLACK_RESOURCES.MESSAGE, operation: MESSAGE_OPERATIONS.DELETE },
      // Channel operations
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.ARCHIVE },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.CLOSE },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.CREATE },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.INVITE },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.JOIN },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.KICK },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.LEAVE },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.OPEN },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.RENAME },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.SET_PURPOSE },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.SET_TOPIC },
      { resource: SLACK_RESOURCES.CHANNEL, operation: CHANNEL_OPERATIONS.UNARCHIVE },
      // File operations
      { resource: SLACK_RESOURCES.FILE, operation: FILE_OPERATIONS.UPLOAD },
      // User operations
      { resource: SLACK_RESOURCES.USER, operation: USER_OPERATIONS.UPDATE_PROFILE },
      // User group operations
      { resource: SLACK_RESOURCES.USER_GROUP, operation: USER_GROUP_OPERATIONS.CREATE },
      { resource: SLACK_RESOURCES.USER_GROUP, operation: USER_GROUP_OPERATIONS.DISABLE },
      { resource: SLACK_RESOURCES.USER_GROUP, operation: USER_GROUP_OPERATIONS.ENABLE },
      { resource: SLACK_RESOURCES.USER_GROUP, operation: USER_GROUP_OPERATIONS.UPDATE },
      // Star operations
      { resource: SLACK_RESOURCES.STAR, operation: STAR_OPERATIONS.ADD },
      { resource: SLACK_RESOURCES.STAR, operation: STAR_OPERATIONS.DELETE },
      // Reaction operations
      { resource: SLACK_RESOURCES.REACTION, operation: REACTION_OPERATIONS.ADD },
      { resource: SLACK_RESOURCES.REACTION, operation: REACTION_OPERATIONS.REMOVE },
    ];

    // Check if it's an output operation
    const isOutput = outputOperations.some(
      (op) => op.resource === resource && op.operation === operation
    );

    if (isOutput) {
      this.addToCategory('output', SERVICE_NAME);
      return;
    }

    // Fallback for unknown operations
    this.addToCategory('other', SERVICE_NAME);
  }

  /**
   * Check message post operation for security issues
   */
  private checkMessagePostSecurity(
    node: INode,
    params: ISlackMessageSendParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    // Check if sending to channel with ID mode
    if (params.select === 'channel' && params.channelId) {
      const channelIdValue = this.extractChannelId(params.channelId);

      if (channelIdValue.mode === SLACK_CHANNEL_MODES.ID) {
        detectionItems.push(
          SlackDetectionItems.channelDirectId(this.id, node, channelIdValue.value || 'unknown')
        );
      }
    }

    return detectionItems;
  }

  /**
   * Extract channel ID and mode from parameter
   */
  private extractChannelId(channelId: INodeParameterResourceLocator | undefined): {
    mode: string;
    value: string | undefined;
  } {
    if (!channelId) {
      return { mode: SLACK_CHANNEL_MODES.LIST, value: undefined };
    }

    const mode = channelId.mode || SLACK_CHANNEL_MODES.LIST;
    const value = extractResourceValue(channelId);

    // If mode is 'id' but value is empty/undefined, treat as safe (no actual ID specified)
    if (mode === SLACK_CHANNEL_MODES.ID && (!value || value.trim() === '')) {
      return { mode: SLACK_CHANNEL_MODES.LIST, value: undefined };
    }

    return { mode, value };
  }
}
