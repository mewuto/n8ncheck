/**
 * Slack node checker constants
 */

export const SLACK_CHECKER_ID = 'slack-node-checker';

// ============================================================================
// Resources
// ============================================================================
export const SLACK_RESOURCES = {
  CHANNEL: 'channel',
  FILE: 'file',
  MESSAGE: 'message',
  REACTION: 'reaction',
  STAR: 'star',
  USER: 'user',
  USER_GROUP: 'userGroup',
} as const;

// ============================================================================
// Message Operations
// ============================================================================
export const MESSAGE_OPERATIONS = {
  DELETE: 'delete',
  GET_PERMALINK: 'getPermalink',
  SEARCH: 'search',
  SEND: 'post',
  SEND_AND_WAIT: 'sendAndWait',
  UPDATE: 'update',
} as const;

// ============================================================================
// Channel Operations
// ============================================================================
export const CHANNEL_OPERATIONS = {
  ARCHIVE: 'archive',
  CLOSE: 'close',
  CREATE: 'create',
  GET: 'get',
  GET_ALL: 'getAll',
  HISTORY: 'history',
  INVITE: 'invite',
  JOIN: 'join',
  KICK: 'kick',
  LEAVE: 'leave',
  MEMBER: 'member',
  OPEN: 'open',
  RENAME: 'rename',
  REPLIES: 'replies',
  SET_PURPOSE: 'setPurpose',
  SET_TOPIC: 'setTopic',
  UNARCHIVE: 'unarchive',
} as const;

// ============================================================================
// File Operations
// ============================================================================
export const FILE_OPERATIONS = {
  GET: 'get',
  GET_ALL: 'getAll',
  UPLOAD: 'upload',
} as const;

// ============================================================================
// Reaction Operations
// ============================================================================
export const REACTION_OPERATIONS = {
  ADD: 'add',
  GET: 'get',
  REMOVE: 'remove',
} as const;

// ============================================================================
// User Operations
// ============================================================================
export const USER_OPERATIONS = {
  GET_ALL: 'getAll',
  GET_PRESENCE: 'getPresence',
  GET_PROFILE: 'getProfile',
  INFO: 'info',
  UPDATE_PROFILE: 'updateProfile',
} as const;

// ============================================================================
// User Group Operations
// ============================================================================
export const USER_GROUP_OPERATIONS = {
  CREATE: 'create',
  DISABLE: 'disable',
  ENABLE: 'enable',
  GET_ALL: 'getAll',
  UPDATE: 'update',
} as const;

// ============================================================================
// Star Operations
// ============================================================================
export const STAR_OPERATIONS = {
  ADD: 'add',
  DELETE: 'delete',
  GET_ALL: 'getAll',
} as const;

// ============================================================================
// Message Configuration
// ============================================================================
export const MESSAGE_FORMATS = {
  TEXT: 'text',
  BLOCK: 'block',
  ATTACHMENT: 'attachment',
} as const;

export const MESSAGE_SEND_TO = {
  CHANNEL: 'channel',
  USER: 'user',
} as const;

// ============================================================================
// Channel Configuration
// ============================================================================
export const CHANNEL_VISIBILITY = {
  PUBLIC: 'public_channel',
  PRIVATE: 'private_channel',
} as const;

// ============================================================================
// Resource Locator Configuration
// ============================================================================
export const RESOURCE_LOCATOR_MODES = {
  LIST: 'list',
  ID: 'id',
  NAME: 'name',
  URL: 'url',
} as const;

// ============================================================================
// Backward compatibility
// ============================================================================
export const SLACK_CHANNEL_MODES = {
  LIST: 'list',
  ID: 'id',
} as const;
