/**
 * Constants for Google Drive checker
 */

export const GOOGLE_DRIVE_CHECKER_ID = 'google-drive-checker';

export const GOOGLE_DRIVE_RESOURCES = {
  FILE: 'file',
  FOLDER: 'folder',
  FILE_FOLDER: 'fileFolder',
  SHARED_DRIVE: 'drive',
} as const;

export type GoogleDriveResource =
  (typeof GOOGLE_DRIVE_RESOURCES)[keyof typeof GOOGLE_DRIVE_RESOURCES];

/**
 * File resource operations (based on n8n File.resource)
 */
export const GOOGLE_DRIVE_FILE_OPERATIONS = {
  COPY: 'copy',
  CREATE_FROM_TEXT: 'createFromText',
  DELETE: 'deleteFile',
  DOWNLOAD: 'download',
  MOVE: 'move',
  SHARE: 'share',
  UPDATE: 'update',
  UPLOAD: 'upload',
} as const;

export type GoogleDriveFileOperation =
  (typeof GOOGLE_DRIVE_FILE_OPERATIONS)[keyof typeof GOOGLE_DRIVE_FILE_OPERATIONS];

/**
 * Folder resource operations (based on n8n Folder.resource)
 */
export const GOOGLE_DRIVE_FOLDER_OPERATIONS = {
  CREATE: 'create',
  DELETE: 'deleteFolder',
  SHARE: 'share',
} as const;

export type GoogleDriveFolderOperation =
  (typeof GOOGLE_DRIVE_FOLDER_OPERATIONS)[keyof typeof GOOGLE_DRIVE_FOLDER_OPERATIONS];

/**
 * FileFolder resource operations (based on n8n FileFolder.resource)
 */
export const GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS = {
  SEARCH: 'search',
} as const;

export type GoogleDriveFileFolderOperation =
  (typeof GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS)[keyof typeof GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS];

/**
 * Shared Drive resource operations (based on n8n Drive.resource)
 */
export const GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS = {
  CREATE: 'create',
  DELETE: 'deleteDrive',
  GET: 'get',
  LIST: 'list',
  UPDATE: 'update',
} as const;

export type GoogleDriveSharedDriveOperation =
  (typeof GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS)[keyof typeof GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS];

/**
 * Union of all operations for backwards compatibility
 */
export type GoogleDriveOperation =
  | GoogleDriveFileOperation
  | GoogleDriveFolderOperation
  | GoogleDriveFileFolderOperation
  | GoogleDriveSharedDriveOperation;

/**
 * Permission types for Google Drive
 */
export const GOOGLE_DRIVE_PERMISSION_TYPES = {
  USER: 'user',
  GROUP: 'group',
  DOMAIN: 'domain',
  ANYONE: 'anyone',
} as const;

export type GoogleDrivePermissionType =
  (typeof GOOGLE_DRIVE_PERMISSION_TYPES)[keyof typeof GOOGLE_DRIVE_PERMISSION_TYPES];

/**
 * Permission roles for Google Drive (from n8n UI definition)
 */
export const GOOGLE_DRIVE_PERMISSION_ROLES = {
  COMMENTER: 'commenter',
  FILE_ORGANIZER: 'fileOrganizer',
  ORGANIZER: 'organizer',
  OWNER: 'owner',
  READER: 'reader',
  WRITER: 'writer',
} as const;

export type GoogleDrivePermissionRole =
  (typeof GOOGLE_DRIVE_PERMISSION_ROLES)[keyof typeof GOOGLE_DRIVE_PERMISSION_ROLES];
