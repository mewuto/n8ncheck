/**
 * JavaScript/TypeScript code node specific constants
 */
export const JSCODE_CHECKER_ID = 'jscode-checker';

// Code languages that n8n supports (using n8n's official format)
export const CODE_LANGUAGES = ['javaScript', 'python'] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

// Network access patterns for detection
export const NETWORK_PATTERNS = [
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /WebSocket/i,
  /Socket/i,
] as const;
