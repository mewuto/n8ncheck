import type {
  INodeParameterResourceLocator,
  INodeParameters,
  NodeParameterValueType,
} from 'n8n-workflow';
import type { IBaseExtractedValues } from '../../core/extracted-values.types';
import type {
  GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS,
  GOOGLE_DRIVE_FILE_OPERATIONS,
  GOOGLE_DRIVE_FOLDER_OPERATIONS,
  GOOGLE_DRIVE_RESOURCES,
  GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS,
  GoogleDriveOperation,
  GoogleDrivePermissionRole,
  GoogleDrivePermissionType,
  GoogleDriveResource,
} from './constants';

/**
 * Base interface for all Google Drive operations
 */
export interface IGoogleDriveBaseParameters extends INodeParameters {
  resource: GoogleDriveResource;
  operation: GoogleDriveOperation;
}

/**
 * Typed parameters for file share operation
 */
export interface IGoogleDriveFileShareParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE;
  operation: typeof GOOGLE_DRIVE_FILE_OPERATIONS.SHARE;
  fileId: INodeParameterResourceLocator;
  permissionsUi?: NodeParameterValueType;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for folder share operation
 */
export interface IGoogleDriveFolderShareParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FOLDER;
  operation: typeof GOOGLE_DRIVE_FOLDER_OPERATIONS.SHARE;
  folderId: INodeParameterResourceLocator;
  permissionsUi?: NodeParameterValueType;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for file upload operation
 */
export interface IGoogleDriveFileUploadParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE;
  operation: typeof GOOGLE_DRIVE_FILE_OPERATIONS.UPLOAD;
  name: string;
  driveId: INodeParameterResourceLocator;
  folderId?: INodeParameterResourceLocator;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for file download operation
 */
export interface IGoogleDriveFileDownloadParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE;
  operation: typeof GOOGLE_DRIVE_FILE_OPERATIONS.DOWNLOAD;
  fileId: INodeParameterResourceLocator;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for file copy operation
 */
export interface IGoogleDriveFileCopyParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE;
  operation: typeof GOOGLE_DRIVE_FILE_OPERATIONS.COPY;
  fileId: INodeParameterResourceLocator;
  name?: string;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for file delete operation
 */
export interface IGoogleDriveFileDeleteParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE;
  operation: typeof GOOGLE_DRIVE_FILE_OPERATIONS.DELETE;
  fileId: INodeParameterResourceLocator;
}

/**
 * Typed parameters for file move operation
 */
export interface IGoogleDriveFileMoveParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE;
  operation: typeof GOOGLE_DRIVE_FILE_OPERATIONS.MOVE;
  fileId: INodeParameterResourceLocator;
  folderId: INodeParameterResourceLocator;
}

/**
 * Typed parameters for file update operation
 */
export interface IGoogleDriveFileUpdateParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE;
  operation: typeof GOOGLE_DRIVE_FILE_OPERATIONS.UPDATE;
  fileId: INodeParameterResourceLocator;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for file create from text operation
 */
export interface IGoogleDriveFileCreateFromTextParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE;
  operation: typeof GOOGLE_DRIVE_FILE_OPERATIONS.CREATE_FROM_TEXT;
  name: string;
  content: string;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for folder create operation
 */
export interface IGoogleDriveFolderCreateParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FOLDER;
  operation: typeof GOOGLE_DRIVE_FOLDER_OPERATIONS.CREATE;
  name: string;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for folder delete operation
 */
export interface IGoogleDriveFolderDeleteParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FOLDER;
  operation: typeof GOOGLE_DRIVE_FOLDER_OPERATIONS.DELETE;
  folderId: INodeParameterResourceLocator;
}

/**
 * Typed parameters for file/folder search operation
 */
export interface IGoogleDriveFileFolderSearchParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.FILE_FOLDER;
  operation: typeof GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS.SEARCH;
  queryString?: string;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for shared drive create operation
 */
export interface IGoogleDriveSharedDriveCreateParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE;
  operation: typeof GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.CREATE;
  name: string;
}

/**
 * Typed parameters for shared drive delete operation
 */
export interface IGoogleDriveSharedDriveDeleteParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE;
  operation: typeof GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.DELETE;
  driveId: string;
}

/**
 * Typed parameters for shared drive get operation
 */
export interface IGoogleDriveSharedDriveGetParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE;
  operation: typeof GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.GET;
  driveId: string;
}

/**
 * Typed parameters for shared drive list operation
 */
export interface IGoogleDriveSharedDriveListParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE;
  operation: typeof GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.LIST;
  options?: NodeParameterValueType;
}

/**
 * Typed parameters for shared drive update operation
 */
export interface IGoogleDriveSharedDriveUpdateParameters extends IGoogleDriveBaseParameters {
  resource: typeof GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE;
  operation: typeof GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.UPDATE;
  driveId: string;
  options?: NodeParameterValueType;
}

/**
 * Union type for all typed Google Drive parameters
 */
export type IGoogleDriveTypedParameters =
  | IGoogleDriveFileShareParameters
  | IGoogleDriveFileDownloadParameters
  | IGoogleDriveFileCopyParameters
  | IGoogleDriveFileDeleteParameters
  | IGoogleDriveFileMoveParameters
  | IGoogleDriveFileUpdateParameters
  | IGoogleDriveFileCreateFromTextParameters
  | IGoogleDriveFileUploadParameters
  | IGoogleDriveFolderShareParameters
  | IGoogleDriveFolderCreateParameters
  | IGoogleDriveFolderDeleteParameters
  | IGoogleDriveFileFolderSearchParameters
  | IGoogleDriveSharedDriveCreateParameters
  | IGoogleDriveSharedDriveDeleteParameters
  | IGoogleDriveSharedDriveGetParameters
  | IGoogleDriveSharedDriveListParameters
  | IGoogleDriveSharedDriveUpdateParameters;

/**
 * Extracted values for Google Drive nodes
 */
export interface IGoogleDriveExtractedValues extends IBaseExtractedValues {
  resource?: GoogleDriveResource;
  operation?: GoogleDriveOperation;
  permissionsUi?: IGoogleDrivePermissionUI;
  field?: string;
  fileId?: string;
  folderId?: string;
  name?: string;
}

/**
 * Permission UI configuration (single permission, based on actual n8n definition)
 */
export interface IGoogleDrivePermissionUI {
  permissionsValues?: IGoogleDrivePermissionValues;
}

/**
 * Google Drive permission values structure
 */
export interface IGoogleDrivePermissionValues {
  role?: GoogleDrivePermissionRole;
  type?: GoogleDrivePermissionType;
  emailAddress?: string;
  domain?: string;
  allowFileDiscovery?: boolean;
}
