import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IWorkflowBase } from 'n8n-workflow';

/**
 * Load and parse n8n workflow file from JSON
 * This utility is used by both CLI and test environments
 */
export function loadWorkflowFile(filePath: string): IWorkflowBase {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Basic validation
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid workflow file: missing nodes array');
    }

    if (!data.connections) {
      data.connections = {};
    }

    return data as IWorkflowBase;
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      } else if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in file: ${filePath}`);
      } else {
        throw error;
      }
    } else {
      throw new Error(`Unknown error loading file: ${filePath}`);
    }
  }
}
