// Import n8n Code node official definition
// This import gets the official n8n Code node description with all properties
import { Code } from 'n8n-nodes-base/dist/nodes/Code/Code.node';
import type { INodeParameters } from 'n8n-workflow';
import { BaseNodeSchemaValidator } from '../../types/validation/base-node-schema-validator';
import type { IValidationError } from '../../types/validation/node-schema-validator.interface';
import type { CodeLanguage } from './constants';
import type { IJSCodeTypedParameters } from './types';

const codeNodeDefinition = new Code().description;

/**
 * JSCode schema validator using BaseNodeSchemaValidator
 * Validates that custom JSCode type definitions match n8n's official Code node schema
 * Also provides type mapping functionality for type-safe parameter access
 */
export class JSCodeSchemaValidator extends BaseNodeSchemaValidator {
  constructor() {
    super(codeNodeDefinition);
  }

  /**
   * Map raw workflow parameters to strict typed JSCode parameters
   * Returns mapping result with validation errors instead of throwing exceptions
   */
  mapToTypedParams(rawParams: INodeParameters): {
    params: IJSCodeTypedParameters | null;
    errors: IValidationError[];
  } {
    const errors: IValidationError[] = [];

    // Determine language and code content
    let language: CodeLanguage | undefined = 'javaScript';
    let jsCode: string | undefined;
    let pythonCode: string | undefined;

    if (rawParams.jsCode) {
      // Check for jsCode (most common case)
      jsCode = rawParams.jsCode as string;
      language = 'javaScript';
    } else if (rawParams.pythonCode) {
      // Check for pythonCode
      pythonCode = rawParams.pythonCode as string;
      language = 'python';
    } else {
      // No code found
      errors.push({
        field: 'code',
        message: {
          en: 'No code found in node parameters',
          ja: 'No code found in node parameters',
        },
      });
    }

    if (errors.length > 0) {
      return { params: null, errors };
    }

    return {
      params: {
        language,
        jsCode,
        pythonCode,
      },
      errors: [],
    };
  }
}
