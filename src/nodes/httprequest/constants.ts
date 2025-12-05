/**
 * HTTP Request Node Constants
 */

export const HTTPREQUEST_CHECKER_ID = 'httprequest-checker';

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;
export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export const AUTHENTICATION_TYPES = {
  NONE: 'none',
  PREDEFINED: 'predefinedCredentialType',
  GENERIC: 'genericCredentialType',
} as const;
export type AuthenticationType = (typeof AUTHENTICATION_TYPES)[keyof typeof AUTHENTICATION_TYPES];

export const CONTENT_TYPES = {
  JSON: 'json',
  FORM_URLENCODED: 'form-urlencoded',
  FORM_DATA: 'multipart-form-data',
  RAW: 'raw',
  BINARY_DATA: 'binaryData',
} as const;
export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];
