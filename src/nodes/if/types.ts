import type { FilterValue } from 'n8n-workflow';
import type { IBaseExtractedValues } from '../../core/extracted-values.types';

/**
 * If node typed parameters based on official n8n IfV2 node definition
 */
export interface IfTypedParameters {
  /** Filter conditions with detailed structure for routing logic */
  conditions?: FilterValue;
  /** Additional options collection */
  options?: {
    /**
     * Whether to ignore letter case when evaluating conditions
     * Default: true
     */
    ignoreCase?: boolean;
  };
}

export interface IIfExtractedValues extends IBaseExtractedValues {
  conditions?: FilterValue;
  options?: {
    ignoreCase?: boolean;
  };
}
