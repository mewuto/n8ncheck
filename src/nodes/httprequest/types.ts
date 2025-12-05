import type { INodeParameters, NodeParameterValueType } from 'n8n-workflow';
import type { IBaseExtractedValues } from '../../core/extracted-values.types';
import type { IGoogleDrivePermissionValues } from '../google-drive/types';
import type { AuthenticationType, ContentType, HttpMethod } from './constants';

/**
 * HTTP Request typed parameters for security checking
 */
export interface IHttpRequestTypedParameters extends INodeParameters {
  url: string;
  method?: HttpMethod;
  authentication?: AuthenticationType;
  sendBody?: boolean;
  contentType?: ContentType;
  specifyBody?: string;
  sendHeaders?: boolean;
  nodeCredentialType?: string;
  genericAuthType?: string;
  jsonBody?: string;
  body?: string;
  headerParameters?: {
    parameters?: Array<{ name: string; value: string }>;
  };
  queryParameters?: {
    parameters?: Array<{ name: string; value: string }>;
  };
  bodyParameters?: {
    parameters?: Array<{ name: string; value: string }>;
  };
  options?: NodeParameterValueType;
}

export interface IHttpRequestExtractedValues extends IBaseExtractedValues {
  url: string;
  method?: HttpMethod;
  authentication?: AuthenticationType;
  sendBody?: boolean;
  contentType?: ContentType;
  sendHeaders?: boolean;
  nodeCredentialType?: string;
  genericAuthType?: string;
  jsonBody?: string;
  body?: string;
  headerParameters?: {
    parameters?: Array<{ name: string; value: string }>;
  };
  queryParameters?: {
    parameters?: Array<{ name: string; value: string }>;
  };
  bodyParameters?: {
    parameters?: Array<{ name: string; value: string }>;
  };
  googleDrivePermission?: IGoogleDrivePermissionValues;
}
