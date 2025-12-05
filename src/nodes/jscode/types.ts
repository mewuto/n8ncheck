import type { INodeParameters } from 'n8n-workflow';
import type { IBaseExtractedValues } from '../../core/extracted-values.types';
import type { CodeLanguage } from './constants';

/**
 * Typed parameters for Code operation
 * Provides strict typing for code node parameters
 */
export interface IJSCodeTypedParameters extends INodeParameters {
  language?: CodeLanguage;
  jsCode?: string;
  pythonCode?: string;
}

export interface IJSCodeExtractedValues extends IBaseExtractedValues {
  language: CodeLanguage;
  jsCode?: string;
}
