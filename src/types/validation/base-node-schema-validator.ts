import type { INodeParameters, INodeProperties, INodeTypeDescription } from 'n8n-workflow';
import type {
  INodeSchemaValidator,
  IValidationError,
  IValidationResult,
  IValidationWarning,
} from './node-schema-validator.interface';

/**
 * Base schema validator that uses official n8n node type definitions
 * Provides automatic validation against the node's official schema
 */
export class BaseNodeSchemaValidator implements INodeSchemaValidator {
  constructor(protected readonly nodeTypeDescription: INodeTypeDescription) {}

  validate(nodeParameters: INodeParameters): IValidationResult {
    if (!nodeParameters || typeof nodeParameters !== 'object') {
      return {
        valid: false,
        errors: [
          {
            field: 'nodeParameters',
            message: {
              ja: 'ノードパラメータが無効または欠落しています。ノード設定パラメータを含むオブジェクトが期待されます。',
              en: 'Node parameters are invalid or missing. Expected object with node configuration parameters.',
            },
            expected: 'object',
            actual: typeof nodeParameters,
          },
        ],
        warnings: [],
      };
    }

    const errors: IValidationError[] = [];
    const warnings: IValidationWarning[] = [];

    // Validate each parameter against schema
    for (const [paramName, paramValue] of Object.entries(nodeParameters)) {
      const property = this.getSchema().find((p) => p.name === paramName);

      if (!property) {
        // Unknown parameter
        warnings.push({
          field: paramName,
          message: {
            ja: `パラメータ "${paramName}" はノードスキーマで定義されていません。この設定が意図的なものかご確認ください。`,
            en: `Parameter "${paramName}" is not defined in the node schema. Please verify this configuration is intentional.`,
          },
        });
        continue;
      }

      // Skip undefined values for optional fields
      if (paramValue === undefined) {
        // Check if this is a required parameter
        if (property.required === true) {
          errors.push({
            field: paramName,
            message: {
              ja: `必須パラメータ "${paramName}" が不足しています。"${paramName}" フィールドを設定してください。`,
              en: `Required parameter "${paramName}" is missing. Please configure the "${paramName}" field.`,
            },
            expected: property.type,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getSchema(): INodeProperties[] {
    return this.nodeTypeDescription.properties || [];
  }
}
