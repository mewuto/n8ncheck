import { NODE_TYPES } from '../../constants/node-types';

export const SLACK_USER_VALIDATION_SCENARIO_ID = 'slack-user-validation';

/**
 * External connection nodes that are allowed in Slack user validation workflows
 * These nodes can be present between trigger and validation nodes without failing security check
 */
export const ALLOWED_EXTERNAL_CONNECTION_NODES: string[] = [
  NODE_TYPES.SLACK,
  NODE_TYPES.SLACK_TRIGGER,
];
