// Import If node and create instance to get official definition
import { IfV2 } from 'n8n-nodes-base/dist/nodes/If/V2/IfV2.node';
import type { INodeParameters } from 'n8n-workflow';
import { BaseNodeSchemaValidator } from '../../types/validation/base-node-schema-validator';
import type { IfTypedParameters } from './types';

// Create IfV2 instance with base description to get the official node definition
const ifNodeDefinition = new IfV2({
  displayName: 'If',
  name: 'if',
  icon: 'fa:map-signs',
  iconColor: 'green',
  group: ['transform'],
  description: 'Route items to different branches (true/false)',
  defaultVersion: 2.2,
}).description;

/**
 * If node schema validator using BaseNodeSchemaValidator
 * Validates that custom If node type definitions match n8n's official If node schema
 * Does NOT include business logic security validation
 * Also provides type mapping functionality for type-safe parameter access
 */
export class IfSchemaValidator extends BaseNodeSchemaValidator {
  constructor() {
    // Use the official n8n If V2 description for comprehensive validation
    super(ifNodeDefinition);
  }

  /**
   * Map raw workflow parameters to strict typed If parameters
   * Returns mapping result with validation errors instead of throwing exceptions
   * Note: Does not validate required fields - validation should be done separately
   */
  mapToTypedParams(rawParams: INodeParameters): IfTypedParameters | null {
    return rawParams as IfTypedParameters;
  }
}
