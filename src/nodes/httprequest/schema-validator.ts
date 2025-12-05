// Import HTTP Request node and create instance to get official definition
import { HttpRequestV3 } from 'n8n-nodes-base/dist/nodes/HttpRequest/V3/HttpRequestV3.node';
import type { INodeParameters } from 'n8n-workflow';
import { BaseNodeSchemaValidator } from '../../types/validation/base-node-schema-validator';
import type { IValidationError } from '../../types/validation/node-schema-validator.interface';
import type { IHttpRequestTypedParameters } from './types';

// Create HttpRequestV3 instance with base description to get the official node definition
const httpRequestNodeDefinition = new HttpRequestV3({
  displayName: 'HTTP Request',
  name: 'httpRequest',
  group: ['output'],
  description: 'HTTP request',
}).description;

/**
 * HTTP Request schema validator using BaseNodeSchemaValidator
 * Validates that custom HTTP Request type definitions match n8n's official HTTP Request node schema
 * Does NOT include business logic security validation
 * Also provides type mapping functionality for type-safe parameter access
 */
export class HttpRequestSchemaValidator extends BaseNodeSchemaValidator {
  constructor() {
    // Use the official n8n HTTP Request V3 description for comprehensive validation
    super(httpRequestNodeDefinition);
  }

  /**
   * Map raw workflow parameters to strict typed HTTP Request parameters
   * Returns mapping result with validation errors instead of throwing exceptions
   * Note: Does not validate required fields - validation should be done separately
   */
  mapToTypedParams(rawParams: INodeParameters): {
    params: IHttpRequestTypedParameters | null;
    errors: IValidationError[];
  } {
    // Direct type assertion since parameter keys are identical
    const typedParams = rawParams as IHttpRequestTypedParameters;

    return { params: typedParams, errors: [] };
  }
}
