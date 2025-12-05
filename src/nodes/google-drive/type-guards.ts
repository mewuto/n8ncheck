import {
  GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS,
  GOOGLE_DRIVE_FILE_OPERATIONS,
  GOOGLE_DRIVE_FOLDER_OPERATIONS,
  GOOGLE_DRIVE_RESOURCES,
  GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS,
} from './constants';
import type {
  IGoogleDriveFileCopyParameters,
  IGoogleDriveFileCreateFromTextParameters,
  IGoogleDriveFileDeleteParameters,
  IGoogleDriveFileDownloadParameters,
  IGoogleDriveFileFolderSearchParameters,
  IGoogleDriveFileMoveParameters,
  IGoogleDriveFileShareParameters,
  IGoogleDriveFileUpdateParameters,
  IGoogleDriveFileUploadParameters,
  IGoogleDriveFolderCreateParameters,
  IGoogleDriveFolderDeleteParameters,
  IGoogleDriveFolderShareParameters,
  IGoogleDriveSharedDriveCreateParameters,
  IGoogleDriveSharedDriveDeleteParameters,
  IGoogleDriveSharedDriveGetParameters,
  IGoogleDriveSharedDriveListParameters,
  IGoogleDriveSharedDriveUpdateParameters,
  IGoogleDriveTypedParameters,
} from './types';

/**
 * Type guard functions for specific Google Drive operations
 */

export function isFileShareOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileShareParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE &&
    params.operation === GOOGLE_DRIVE_FILE_OPERATIONS.SHARE
  );
}

export function isFolderShareOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFolderShareParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FOLDER &&
    params.operation === GOOGLE_DRIVE_FOLDER_OPERATIONS.SHARE
  );
}

export function isFileUploadOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileUploadParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE &&
    params.operation === GOOGLE_DRIVE_FILE_OPERATIONS.UPLOAD
  );
}

export function isFileDownloadOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileDownloadParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE &&
    params.operation === GOOGLE_DRIVE_FILE_OPERATIONS.DOWNLOAD
  );
}

export function isFileCopyOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileCopyParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE &&
    params.operation === GOOGLE_DRIVE_FILE_OPERATIONS.COPY
  );
}

export function isFileDeleteOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileDeleteParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE &&
    params.operation === GOOGLE_DRIVE_FILE_OPERATIONS.DELETE
  );
}

export function isFileMoveOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileMoveParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE &&
    params.operation === GOOGLE_DRIVE_FILE_OPERATIONS.MOVE
  );
}

export function isFileUpdateOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileUpdateParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE &&
    params.operation === GOOGLE_DRIVE_FILE_OPERATIONS.UPDATE
  );
}

export function isFileCreateFromTextOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileCreateFromTextParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE &&
    params.operation === GOOGLE_DRIVE_FILE_OPERATIONS.CREATE_FROM_TEXT
  );
}

export function isFolderCreateOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFolderCreateParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FOLDER &&
    params.operation === GOOGLE_DRIVE_FOLDER_OPERATIONS.CREATE
  );
}

export function isFolderDeleteOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFolderDeleteParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FOLDER &&
    params.operation === GOOGLE_DRIVE_FOLDER_OPERATIONS.DELETE
  );
}

export function isFileFolderSearchOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveFileFolderSearchParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.FILE_FOLDER &&
    params.operation === GOOGLE_DRIVE_FILE_FOLDER_OPERATIONS.SEARCH
  );
}

export function isSharedDriveCreateOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveSharedDriveCreateParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE &&
    params.operation === GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.CREATE
  );
}

export function isSharedDriveDeleteOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveSharedDriveDeleteParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE &&
    params.operation === GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.DELETE
  );
}

export function isSharedDriveGetOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveSharedDriveGetParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE &&
    params.operation === GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.GET
  );
}

export function isSharedDriveListOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveSharedDriveListParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE &&
    params.operation === GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.LIST
  );
}

export function isSharedDriveUpdateOperation(
  params: IGoogleDriveTypedParameters
): params is IGoogleDriveSharedDriveUpdateParameters {
  return (
    params.resource === GOOGLE_DRIVE_RESOURCES.SHARED_DRIVE &&
    params.operation === GOOGLE_DRIVE_SHARED_DRIVE_OPERATIONS.UPDATE
  );
}

/**
 * Type guard functions for categorization
 */

export function isDataSourceOperation(params: IGoogleDriveTypedParameters): boolean {
  return (
    isFileDownloadOperation(params) ||
    isFileFolderSearchOperation(params) ||
    isSharedDriveListOperation(params) ||
    isSharedDriveGetOperation(params)
  );
}

export function isOutputOperation(params: IGoogleDriveTypedParameters): boolean {
  return (
    isFileUploadOperation(params) ||
    isFileCreateFromTextOperation(params) ||
    isFileUpdateOperation(params) ||
    isFileCopyOperation(params) ||
    isFileMoveOperation(params) ||
    isFileShareOperation(params) ||
    isFileDeleteOperation(params) ||
    isFolderCreateOperation(params) ||
    isFolderShareOperation(params) ||
    isFolderDeleteOperation(params) ||
    isSharedDriveCreateOperation(params) ||
    isSharedDriveUpdateOperation(params) ||
    isSharedDriveDeleteOperation(params)
  );
}
