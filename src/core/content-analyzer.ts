/**
 * Core analyzer for n8n expressions and dynamic content detection
 * Provides centralized logic for detecting dynamic content construction patterns
 */

/**
 * Check for dynamic construction using n8n expressions and template literals
 */
export function hasDynamicConstruction(content: string): boolean {
  if (!content) return false;

  // Check for n8n expression patterns and template literals
  const expressionPatterns = [
    /\{\{.*\}\}/, // n8n expressions like {{ $json.url }}
    /\$\{.*\}/, // template literals like ${process.env.API_URL}
    /^=\{.*\}/, // n8n new expression format like ={ "data": $json.field }
    /^=.*\$/, // n8n expression with = prefix like =$json.field
  ];

  return expressionPatterns.some((pattern) => pattern.test(content));
}

/**
 * Check if text contains "prod" string (case-insensitive)
 */
export function containsProdString(text: string): boolean {
  return text.toLowerCase().includes('prod');
}

/**
 * Find production string and return surrounding context
 */
export function findProdStringWithContext(
  text: string,
  contextLines: number = 1
): {
  found: boolean;
  lineNumber?: number;
  contextCode?: string;
} {
  if (!text) return { found: false };

  const lines = text.split('\n');

  if (!containsProdString(text)) {
    return { found: false };
  }

  // Find the line containing "prod"
  for (let i = 0; i < lines.length; i++) {
    if (containsProdString(lines[i])) {
      const startLine = Math.max(0, i - contextLines);
      const endLine = Math.min(lines.length - 1, i + contextLines);

      const contextLines_array = lines.slice(startLine, endLine + 1);
      const contextCode = contextLines_array
        .map((line, index) => {
          const actualLineNumber = startLine + index + 1;
          const isTargetLine = startLine + index === i;
          return `${isTargetLine ? '→ ' : '  '}${actualLineNumber.toString().padStart(2)}: ${line}`;
        })
        .join('\n');

      return {
        found: true,
        lineNumber: i + 1,
        contextCode,
      };
    }
  }

  return { found: false };
}

/**
 * Check if text contains "dev" string (case-insensitive)
 */
export function containsDevString(text: string): boolean {
  return text.toLowerCase().includes('dev');
}

/**
 * Check if text contains network access patterns
 */
export function containsNetworkAccess(text: string): boolean {
  const networkPatterns = [/fetch\s*\(/i, /XMLHttpRequest/i, /WebSocket/i, /Socket/i];
  return networkPatterns.some((pattern) => pattern.test(text));
}

/**
 * Find network access and return surrounding context
 */
export function findNetworkAccessWithContext(
  text: string,
  contextLines: number = 1
): {
  found: boolean;
  lineNumber?: number;
  contextCode?: string;
} {
  if (!text) return { found: false };

  const lines = text.split('\n');

  if (!containsNetworkAccess(text)) {
    return { found: false };
  }

  // Find the line containing network access
  for (let i = 0; i < lines.length; i++) {
    if (containsNetworkAccess(lines[i])) {
      const startLine = Math.max(0, i - contextLines);
      const endLine = Math.min(lines.length - 1, i + contextLines);

      const contextLines_array = lines.slice(startLine, endLine + 1);
      const contextCode = contextLines_array
        .map((line, index) => {
          const actualLineNumber = startLine + index + 1;
          const isTargetLine = startLine + index === i;
          return `${isTargetLine ? '→ ' : '  '}${actualLineNumber.toString().padStart(2)}: ${line}`;
        })
        .join('\n');

      return {
        found: true,
        lineNumber: i + 1,
        contextCode,
      };
    }
  }

  return { found: false };
}

/**
 * Safely parse JSON with n8n expression support
 * Removes = prefix if present before parsing
 */
export function safeJsonParse<T = unknown>(jsonString: string): T {
  if (!jsonString) {
    throw new Error('Empty JSON string');
  }

  // Remove n8n expression prefix if present
  const cleanJson = jsonString.startsWith('=') ? jsonString.substring(1) : jsonString;

  return JSON.parse(cleanJson) as T;
}
