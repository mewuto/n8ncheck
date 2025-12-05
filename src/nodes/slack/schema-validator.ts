// Import n8n Slack official definition
import { SlackV2 } from 'n8n-nodes-base/dist/nodes/Slack/V2/SlackV2.node';
import type { INodeParameters } from 'n8n-workflow';
import { BaseNodeSchemaValidator } from '../../types/validation/base-node-schema-validator';
import type { IValidationError } from '../../types/validation/node-schema-validator.interface';
import {
  CHANNEL_OPERATIONS,
  FILE_OPERATIONS,
  MESSAGE_OPERATIONS,
  REACTION_OPERATIONS,
  SLACK_RESOURCES,
  STAR_OPERATIONS,
  USER_GROUP_OPERATIONS,
  USER_OPERATIONS,
} from './constants';
import type { ISlackTypedParameters, SlackResource } from './types';

// Create SlackV2 instance with base description to get the official node definition
const slackNodeDefinition = new SlackV2({
  displayName: 'Slack',
  name: 'slack',
  group: ['transform'],
  description: 'slack',
}).description;

/**
 * Slack schema validator using BaseNodeSchemaValidator
 * Validates that custom Slack type definitions match n8n's official Slack node schema
 * Also provides type mapping functionality for type-safe parameter access
 */
export class SlackSchemaValidator extends BaseNodeSchemaValidator {
  constructor() {
    super(slackNodeDefinition);
  }

  /**
   * Map raw workflow parameters to strict typed Slack parameters
   * Returns mapping result with validation errors instead of throwing exceptions
   * Applies default resource and operation values based on n8n's official definitions
   */
  mapToTypedParams(rawParams: INodeParameters): {
    params: ISlackTypedParameters | null;
    errors: IValidationError[];
  } {
    const errors: IValidationError[] = [];

    // Apply parameter inference and default values based on n8n UI patterns
    const processedParams = this.inferSlackParameters(rawParams);

    // Extract basic parameters (now from processed params)
    const resource = processedParams.resource as string | undefined;
    const operation = processedParams.operation as string | undefined;

    if (!resource || !operation) {
      errors.push({
        field: 'resource/operation',
        message: {
          ja: 'リソースまたは操作が指定されていません',
          en: 'Resource or operation is not specified',
        },
      });
      return { params: null, errors };
    }

    // Type assertion after validation
    return {
      params: processedParams as ISlackTypedParameters,
      errors: [],
    };
  }

  /**
   * Infer and enrich missing Slack parameters based on n8n UI patterns
   *
   * This handles various UI modes:
   * 1. Simplified mode: Only 'select' is present (implies message/create)
   * 2. Resource-only mode: Operation is inferred from resource type
   * 3. Full mode: Both resource and operation are explicitly set
   * 4. Empty mode: Apply n8n official defaults (resource=message, operation=create)
   */
  private inferSlackParameters(params: INodeParameters): INodeParameters {
    const processed = { ...params };

    // Pattern 1 & 2: Apply defaults when resource and operation are missing
    // This covers both simplified mode (select present) and empty mode (no select)
    if (!params.resource && !params.operation) {
      processed.resource = SLACK_RESOURCES.MESSAGE; // n8n official default
      processed.operation = MESSAGE_OPERATIONS.SEND; // message send operation
    }

    // Pattern 3: Resource specified but operation missing
    // Each resource has a default operation
    if (params.resource && !params.operation) {
      const resource = params.resource as SlackResource;
      const defaultOp = this.getDefaultOperation(resource);

      if (defaultOp) {
        processed.operation = defaultOp;
      } else {
        // Fallback to 'post' for unknown resources
        processed.operation = MESSAGE_OPERATIONS.SEND;
      }
    }

    // Pattern 4: Operation specified but resource missing
    // Default to message resource (n8n official default)
    if (!params.resource && params.operation) {
      processed.resource = SLACK_RESOURCES.MESSAGE; // n8n official default
    }

    return processed;
  }

  /**
   * Get default operation for a given resource type based on n8n's official definitions
   * Uses type-safe constants to ensure consistency with actual Slack operations
   */
  private getDefaultOperation(resource: SlackResource): string | null {
    const resourceDefaults: Record<SlackResource, string> = {
      [SLACK_RESOURCES.MESSAGE]: MESSAGE_OPERATIONS.SEND,
      [SLACK_RESOURCES.REACTION]: REACTION_OPERATIONS.ADD,
      [SLACK_RESOURCES.CHANNEL]: CHANNEL_OPERATIONS.GET,
      [SLACK_RESOURCES.FILE]: FILE_OPERATIONS.UPLOAD,
      [SLACK_RESOURCES.STAR]: STAR_OPERATIONS.ADD,
      [SLACK_RESOURCES.USER]: USER_OPERATIONS.GET_PROFILE,
      [SLACK_RESOURCES.USER_GROUP]: USER_GROUP_OPERATIONS.GET_ALL,
    };

    return resourceDefaults[resource] || null;
  }
}
