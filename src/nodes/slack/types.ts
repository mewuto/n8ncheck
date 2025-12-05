import type {
  INodeParameterResourceLocator,
  INodeParameters,
  NodeParameterValueType,
} from 'n8n-workflow';
import type { IBaseExtractedValues } from '../../core/extracted-values.types';
import {
  CHANNEL_OPERATIONS,
  type CHANNEL_VISIBILITY,
  FILE_OPERATIONS,
  type MESSAGE_FORMATS,
  MESSAGE_OPERATIONS,
  type MESSAGE_SEND_TO,
  type REACTION_OPERATIONS,
  type RESOURCE_LOCATOR_MODES,
  SLACK_RESOURCES,
  type STAR_OPERATIONS,
  type USER_GROUP_OPERATIONS,
  USER_OPERATIONS,
} from './constants';

// ============================================================================
// Type definitions from constants
// ============================================================================

export type SlackResource = (typeof SLACK_RESOURCES)[keyof typeof SLACK_RESOURCES];
export type MessageOperation = (typeof MESSAGE_OPERATIONS)[keyof typeof MESSAGE_OPERATIONS];
export type ChannelOperation = (typeof CHANNEL_OPERATIONS)[keyof typeof CHANNEL_OPERATIONS];
export type FileOperation = (typeof FILE_OPERATIONS)[keyof typeof FILE_OPERATIONS];
export type ReactionOperation = (typeof REACTION_OPERATIONS)[keyof typeof REACTION_OPERATIONS];
export type UserOperation = (typeof USER_OPERATIONS)[keyof typeof USER_OPERATIONS];
export type UserGroupOperation = (typeof USER_GROUP_OPERATIONS)[keyof typeof USER_GROUP_OPERATIONS];
export type StarOperation = (typeof STAR_OPERATIONS)[keyof typeof STAR_OPERATIONS];
export type MessageFormat = (typeof MESSAGE_FORMATS)[keyof typeof MESSAGE_FORMATS];
export type ChannelVisibility = (typeof CHANNEL_VISIBILITY)[keyof typeof CHANNEL_VISIBILITY];
export type MessageTarget = (typeof MESSAGE_SEND_TO)[keyof typeof MESSAGE_SEND_TO];
export type ResourceLocatorMode =
  (typeof RESOURCE_LOCATOR_MODES)[keyof typeof RESOURCE_LOCATOR_MODES];

// ============================================================================
// Base Slack parameters
// ============================================================================

export interface ISlackBaseParameters extends INodeParameters {
  resource: SlackResource;
  operation: string;
}

// ============================================================================
// Message resource parameters
// ============================================================================

export interface ISlackMessageSendParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.MESSAGE;
  operation: typeof MESSAGE_OPERATIONS.SEND;
  select?: MessageTarget;
  channelId?: INodeParameterResourceLocator;
  userId?: INodeParameterResourceLocator;
  text?: string;
  messageType?: MessageFormat;
  blocks?: NodeParameterValueType;
  otherOptions?: NodeParameterValueType;
}

export interface ISlackMessageUpdateParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.MESSAGE;
  operation: typeof MESSAGE_OPERATIONS.UPDATE;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
  text?: string;
  messageType?: MessageFormat;
  blocks?: NodeParameterValueType;
  updateOptions?: NodeParameterValueType;
}

export interface ISlackMessageDeleteParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.MESSAGE;
  operation: typeof MESSAGE_OPERATIONS.DELETE;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
}

export interface ISlackMessageSearchParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.MESSAGE;
  operation: typeof MESSAGE_OPERATIONS.SEARCH;
  query?: string;
  sort?: 'score' | 'timestamp';
  sortDirection?: 'asc' | 'desc';
  returnAll?: boolean;
  limit?: number;
}

export interface ISlackMessageSendAndWaitParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.MESSAGE;
  operation: typeof MESSAGE_OPERATIONS.SEND_AND_WAIT;
  select?: MessageTarget;
  channelId?: INodeParameterResourceLocator;
  userId?: INodeParameterResourceLocator;
  text?: string;
  messageType?: MessageFormat;
  blocks?: NodeParameterValueType;
  approvalOptions?: NodeParameterValueType;
}

export interface ISlackMessageGetPermalinkParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.MESSAGE;
  operation: typeof MESSAGE_OPERATIONS.GET_PERMALINK;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
}

export type ISlackMessageParameters =
  | ISlackMessageSendParameters
  | ISlackMessageUpdateParameters
  | ISlackMessageDeleteParameters
  | ISlackMessageSearchParameters
  | ISlackMessageSendAndWaitParameters
  | ISlackMessageGetPermalinkParameters;

// ============================================================================
// Channel resource parameters
// ============================================================================

export interface ISlackChannelCreateParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.CREATE;
  name?: string;
  visibility?: 'public' | 'private';
  additionalFields?: NodeParameterValueType;
}

export interface ISlackChannelGetParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.GET;
  channelId?: INodeParameterResourceLocator;
  includeNumMembers?: boolean;
}

export interface ISlackChannelGetAllParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.GET_ALL;
  types?: ChannelVisibility[];
  excludeArchived?: boolean;
  returnAll?: boolean;
  limit?: number;
}

export interface ISlackChannelHistoryParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.HISTORY;
  channelId?: INodeParameterResourceLocator;
  returnAll?: boolean;
  limit?: number;
  filters?: NodeParameterValueType;
}

export interface ISlackChannelInviteParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.INVITE;
  channelId?: INodeParameterResourceLocator;
  userId?: INodeParameterResourceLocator;
}

export interface ISlackChannelJoinParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.JOIN;
  channelId?: INodeParameterResourceLocator;
}

export interface ISlackChannelKickParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.KICK;
  channelId?: INodeParameterResourceLocator;
  userId?: INodeParameterResourceLocator;
}

export interface ISlackChannelLeaveParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.LEAVE;
  channelId?: INodeParameterResourceLocator;
}

export interface ISlackChannelArchiveParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.ARCHIVE;
  channelId?: INodeParameterResourceLocator;
}

export interface ISlackChannelUnarchiveParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.UNARCHIVE;
  channelId?: INodeParameterResourceLocator;
}

export interface ISlackChannelRenameParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.RENAME;
  channelId?: INodeParameterResourceLocator;
  name?: string;
}

export interface ISlackChannelSetPurposeParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.SET_PURPOSE;
  channelId?: INodeParameterResourceLocator;
  purpose?: string;
}

export interface ISlackChannelSetTopicParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.SET_TOPIC;
  channelId?: INodeParameterResourceLocator;
  topic?: string;
}

export interface ISlackChannelRepliesParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.REPLIES;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
  returnAll?: boolean;
  limit?: number;
}

export interface ISlackChannelMemberParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.MEMBER;
  channelId?: INodeParameterResourceLocator;
  returnAll?: boolean;
  limit?: number;
  resolveData?: boolean;
}

export interface ISlackChannelOpenParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.OPEN;
  channelId?: INodeParameterResourceLocator;
}

export interface ISlackChannelCloseParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.CHANNEL;
  operation: typeof CHANNEL_OPERATIONS.CLOSE;
  channelId?: INodeParameterResourceLocator;
}

export type ISlackChannelParameters =
  | ISlackChannelCreateParameters
  | ISlackChannelGetParameters
  | ISlackChannelGetAllParameters
  | ISlackChannelHistoryParameters
  | ISlackChannelInviteParameters
  | ISlackChannelJoinParameters
  | ISlackChannelKickParameters
  | ISlackChannelLeaveParameters
  | ISlackChannelArchiveParameters
  | ISlackChannelUnarchiveParameters
  | ISlackChannelRenameParameters
  | ISlackChannelSetPurposeParameters
  | ISlackChannelSetTopicParameters
  | ISlackChannelRepliesParameters
  | ISlackChannelMemberParameters
  | ISlackChannelOpenParameters
  | ISlackChannelCloseParameters;

// ============================================================================
// File resource parameters
// ============================================================================

export interface ISlackFileUploadParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.FILE;
  operation: typeof FILE_OPERATIONS.UPLOAD;
  channels?: INodeParameterResourceLocator[];
  binaryProperty?: string;
  fileContent?: string;
  filename?: string;
  title?: string;
  initialComment?: string;
  threadTs?: string;
}

export interface ISlackFileGetParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.FILE;
  operation: typeof FILE_OPERATIONS.GET;
  fileId?: string;
}

export interface ISlackFileGetAllParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.FILE;
  operation: typeof FILE_OPERATIONS.GET_ALL;
  returnAll?: boolean;
  limit?: number;
  filters?: NodeParameterValueType;
}

export type ISlackFileParameters =
  | ISlackFileUploadParameters
  | ISlackFileGetParameters
  | ISlackFileGetAllParameters;

// ============================================================================
// User resource parameters
// ============================================================================

export interface ISlackUserGetAllParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER;
  operation: typeof USER_OPERATIONS.GET_ALL;
  returnAll?: boolean;
  limit?: number;
}

export interface ISlackUserInfoParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER;
  operation: typeof USER_OPERATIONS.INFO;
  userId?: INodeParameterResourceLocator;
}

export interface ISlackUserGetProfileParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER;
  operation: typeof USER_OPERATIONS.GET_PROFILE;
  userId?: INodeParameterResourceLocator;
}

export interface ISlackUserUpdateProfileParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER;
  operation: typeof USER_OPERATIONS.UPDATE_PROFILE;
  userId?: INodeParameterResourceLocator;
  customFields?: NodeParameterValueType;
}

export interface ISlackUserGetPresenceParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER;
  operation: typeof USER_OPERATIONS.GET_PRESENCE;
  userId?: INodeParameterResourceLocator;
}

export type ISlackUserParameters =
  | ISlackUserGetAllParameters
  | ISlackUserInfoParameters
  | ISlackUserGetProfileParameters
  | ISlackUserUpdateProfileParameters
  | ISlackUserGetPresenceParameters;

// ============================================================================
// Reaction resource parameters
// ============================================================================

export interface ISlackReactionAddParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.REACTION;
  operation: typeof REACTION_OPERATIONS.ADD;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
  name?: string;
}

export interface ISlackReactionRemoveParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.REACTION;
  operation: typeof REACTION_OPERATIONS.REMOVE;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
  name?: string;
}

export interface ISlackReactionGetParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.REACTION;
  operation: typeof REACTION_OPERATIONS.GET;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
  full?: boolean;
}

export type ISlackReactionParameters =
  | ISlackReactionAddParameters
  | ISlackReactionRemoveParameters
  | ISlackReactionGetParameters;

// ============================================================================
// UserGroup resource parameters
// ============================================================================

export interface ISlackUserGroupCreateParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER_GROUP;
  operation: typeof USER_GROUP_OPERATIONS.CREATE;
  name?: string;
  handle?: string;
  description?: string;
  channels?: string[];
  includeCount?: boolean;
}

export interface ISlackUserGroupDisableParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER_GROUP;
  operation: typeof USER_GROUP_OPERATIONS.DISABLE;
  userGroupId?: string;
}

export interface ISlackUserGroupEnableParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER_GROUP;
  operation: typeof USER_GROUP_OPERATIONS.ENABLE;
  userGroupId?: string;
}

export interface ISlackUserGroupGetAllParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER_GROUP;
  operation: typeof USER_GROUP_OPERATIONS.GET_ALL;
  returnAll?: boolean;
  limit?: number;
  includeUsers?: boolean;
  includeCount?: boolean;
  includeDisabled?: boolean;
}

export interface ISlackUserGroupUpdateParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.USER_GROUP;
  operation: typeof USER_GROUP_OPERATIONS.UPDATE;
  userGroupId?: string;
  updateFields?: NodeParameterValueType;
}

export type ISlackUserGroupParameters =
  | ISlackUserGroupCreateParameters
  | ISlackUserGroupDisableParameters
  | ISlackUserGroupEnableParameters
  | ISlackUserGroupGetAllParameters
  | ISlackUserGroupUpdateParameters;

// ============================================================================
// Star resource parameters
// ============================================================================

export interface ISlackStarAddParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.STAR;
  operation: typeof STAR_OPERATIONS.ADD;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
  fileId?: string;
  fileComment?: string;
}

export interface ISlackStarDeleteParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.STAR;
  operation: typeof STAR_OPERATIONS.DELETE;
  channelId?: INodeParameterResourceLocator;
  ts?: string;
  fileId?: string;
  fileComment?: string;
}

export interface ISlackStarGetAllParameters extends ISlackBaseParameters {
  resource: typeof SLACK_RESOURCES.STAR;
  operation: typeof STAR_OPERATIONS.GET_ALL;
  returnAll?: boolean;
  limit?: number;
}

export type ISlackStarParameters =
  | ISlackStarAddParameters
  | ISlackStarDeleteParameters
  | ISlackStarGetAllParameters;

// ============================================================================
// Generic parameters for unspecified resources
// ============================================================================

export interface ISlackOtherParameters extends INodeParameters {
  resource: string;
  operation: string;
}

// ============================================================================
// Union of all typed parameters
// ============================================================================

export type ISlackTypedParameters =
  | ISlackMessageParameters
  | ISlackChannelParameters
  | ISlackFileParameters
  | ISlackUserParameters
  | ISlackReactionParameters
  | ISlackUserGroupParameters
  | ISlackStarParameters
  | ISlackOtherParameters;

// ============================================================================
// Type guards
// ============================================================================

export function isISlackMessageParameters(
  params: ISlackTypedParameters
): params is ISlackMessageParameters {
  return params.resource === SLACK_RESOURCES.MESSAGE;
}

export function isISlackMessageSendParameters(
  params: ISlackTypedParameters
): params is ISlackMessageSendParameters {
  return (
    params.resource === SLACK_RESOURCES.MESSAGE && params.operation === MESSAGE_OPERATIONS.SEND
  );
}

export function isISlackMessageUpdateParameters(
  params: ISlackTypedParameters
): params is ISlackMessageUpdateParameters {
  return (
    params.resource === SLACK_RESOURCES.MESSAGE && params.operation === MESSAGE_OPERATIONS.UPDATE
  );
}

export function isISlackMessageDeleteParameters(
  params: ISlackTypedParameters
): params is ISlackMessageDeleteParameters {
  return (
    params.resource === SLACK_RESOURCES.MESSAGE && params.operation === MESSAGE_OPERATIONS.DELETE
  );
}

export function isISlackMessageSearchParameters(
  params: ISlackTypedParameters
): params is ISlackMessageSearchParameters {
  return (
    params.resource === SLACK_RESOURCES.MESSAGE && params.operation === MESSAGE_OPERATIONS.SEARCH
  );
}

export function isISlackMessageSendAndWaitParameters(
  params: ISlackTypedParameters
): params is ISlackMessageSendAndWaitParameters {
  return (
    params.resource === SLACK_RESOURCES.MESSAGE &&
    params.operation === MESSAGE_OPERATIONS.SEND_AND_WAIT
  );
}

export function isISlackChannelParameters(
  params: ISlackTypedParameters
): params is ISlackChannelParameters {
  return params.resource === SLACK_RESOURCES.CHANNEL;
}

export function isISlackChannelCreateParameters(
  params: ISlackTypedParameters
): params is ISlackChannelCreateParameters {
  return (
    params.resource === SLACK_RESOURCES.CHANNEL && params.operation === CHANNEL_OPERATIONS.CREATE
  );
}

export function isISlackChannelInviteParameters(
  params: ISlackTypedParameters
): params is ISlackChannelInviteParameters {
  return (
    params.resource === SLACK_RESOURCES.CHANNEL && params.operation === CHANNEL_OPERATIONS.INVITE
  );
}

export function isISlackChannelKickParameters(
  params: ISlackTypedParameters
): params is ISlackChannelKickParameters {
  return (
    params.resource === SLACK_RESOURCES.CHANNEL && params.operation === CHANNEL_OPERATIONS.KICK
  );
}

export function isISlackFileParameters(
  params: ISlackTypedParameters
): params is ISlackFileParameters {
  return params.resource === SLACK_RESOURCES.FILE;
}

export function isISlackFileUploadParameters(
  params: ISlackTypedParameters
): params is ISlackFileUploadParameters {
  return params.resource === SLACK_RESOURCES.FILE && params.operation === FILE_OPERATIONS.UPLOAD;
}

export function isISlackUserParameters(
  params: ISlackTypedParameters
): params is ISlackUserParameters {
  return params.resource === SLACK_RESOURCES.USER;
}

export function isISlackUserInfoParameters(
  params: ISlackTypedParameters
): params is ISlackUserInfoParameters {
  return params.resource === SLACK_RESOURCES.USER && params.operation === USER_OPERATIONS.INFO;
}

export function isISlackReactionParameters(
  params: ISlackTypedParameters
): params is ISlackReactionParameters {
  return params.resource === SLACK_RESOURCES.REACTION;
}

export function isISlackUserGroupParameters(
  params: ISlackTypedParameters
): params is ISlackUserGroupParameters {
  return params.resource === SLACK_RESOURCES.USER_GROUP;
}

export function isISlackStarParameters(
  params: ISlackTypedParameters
): params is ISlackStarParameters {
  return params.resource === SLACK_RESOURCES.STAR;
}

// ============================================================================
// Resource Locator helper type
// ============================================================================

export interface IParsedResourceLocator {
  mode: ResourceLocatorMode;
  value?: string;
}

// ============================================================================
// Error handling types
// ============================================================================

/** Error handling type */
export type ErrorHandlingType = 'throw' | 'return' | 'none';

// ============================================================================
// Extracted values for security analysis
// ============================================================================

export interface ISlackExtractedValues extends IBaseExtractedValues {
  field?: string;
  value?: string;
  resource?: SlackResource;
  operation?: string;
  select?: MessageTarget;
  channelId?: string;
  channelUrl?: string;
  userId?: string;
}
