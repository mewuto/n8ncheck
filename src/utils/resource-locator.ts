import type { INodeParameterResourceLocator, NodeParameterValueType } from 'n8n-workflow';

/**
 * Extract the string value from a ResourceLocator or return string as-is
 * Handles both n8n INodeParameterResourceLocator format and plain strings
 */
export function extractResourceValue(
  value: INodeParameterResourceLocator | string | NodeParameterValueType | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }

  // Plain string case
  if (typeof value === 'string') {
    return value;
  }

  // INodeParameterResourceLocator case
  if (typeof value === 'object' && 'value' in value) {
    return typeof value.value === 'string' ? value.value : String(value.value || '');
  }

  return undefined;
}
