// Mock implementation of chalk for Jest tests
module.exports = {
  red: (text) => text,
  green: (text) => text,
  yellow: (text) => text,
  blue: (text) => text,
  cyan: (text) => text,
  magenta: (text) => text,
  white: (text) => text,
  gray: (text) => text,
  grey: (text) => text,
  bold: (text) => text,
  dim: (text) => text,
  underline: (text) => text,
  inverse: (text) => text,
  strikethrough: (text) => text,
  italic: (text) => text,
  bgRed: (text) => text,
  bgGreen: (text) => text,
  bgYellow: (text) => text,
  bgBlue: (text) => text,
  bgCyan: (text) => text,
  bgMagenta: (text) => text,
  bgWhite: (text) => text,
};

// Default export for ES modules
module.exports.default = module.exports;
