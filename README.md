# n8ncheck

[![npm version](https://img.shields.io/npm/v/@mewuto/n8ncheck.svg)](https://www.npmjs.com/package/@mewuto/n8ncheck)
[![Test](https://github.com/mewuto/n8ncheck/workflows/Test/badge.svg)](https://github.com/mewuto/n8ncheck/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Security vulnerability checker for n8n workflows.

## Features

- **Node-level Security Checks**: Validates individual node configurations for security issues
- **Workflow-level Scenario Checks**: Analyzes node relationships and workflow patterns
- **Multiple Output Formats**: Console, JSON, and GitHub PR comment formats

## Installation

Install globally from npm:

```bash
npm install -g @mewuto/n8ncheck
```

**Prerequisites**: Node.js >= 20.0.0

## Usage

### Basic Analysis

Analyze an n8n workflow file for security vulnerabilities:

```bash
# Basic security analysis (console output)
n8ncheck analyze workflow.json
```

**Example Output**:
```
=== n8n Workflow Security Analysis ===

Workflow Information:
  Name: HTTP Request Test - Production URL Warning
  Total Nodes: 2
  Analysis Time: 2025/12/6 14:59:33

Security Analysis Summary:
  ✓ Checks Passed: 1
  ⚠ Warnings: 1
  ✗ Errors: 0
  ℹ Notes: 0

⚠️  Security Warnings:
  ⚠ Production environment URL detected
    Node: HTTP Request Prod (http-prod)

Overall Security Assessment:
  Risk Level: MEDIUM

=== End of Analysis ===
```

### Output Formats

Choose different output formats for various use cases:

```bash
# Console output (default) - human-readable format
n8ncheck analyze workflow.json

# JSON format - for programmatic processing
n8ncheck analyze workflow.json -f json -o report.json

# PR comment format - for GitHub Actions integration
n8ncheck analyze workflow.json -f pr-comment
```

### Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --format <type>` | Output format: `console`, `json`, `pr-comment` | `console` |
| `-o, --output <file>` | Save output to file | stdout |
| `-g, --graph` | Show detailed graph information | `false` |

## Security Checks

This tool performs two types of security analysis: individual node validation and workflow-level scenario checks that analyze node relationships and dependencies.

### Node Checks

The following are examples of individual node security checks.

#### HTTP Request Node
- **Production URL Detection**: Detects hardcoded production environment URLs
- **Dynamic URL/Body Construction**: Identifies dynamically constructed URLs and request bodies

#### BigQuery Node
- **Production Project Access**: Detects production project and dataset/table references
- **Dynamic SQL Construction**: Warns about dynamically constructed SQL queries

JavaScript Code, Slack, Google Sheets, Google Drive nodes are also supported with various security checks.

### Scenario Checks

The following are examples of workflow-level scenario checks.

#### Google Sheets Scope Scenario
Detects Google Sheets creation without subsequent permission configuration (Google Drive Share or HTTP Request setup).

#### Slack User Validation Scenario
Validates proper user authentication in Slack-triggered workflows using AST-based JavaScript code analysis.

Additional workflow-level security scenarios are supported.

### Severity Levels

- **🚨 Error**: Critical issues that prevent secure operation
- **⚠️ Warning**: Security concerns requiring review
- **💡 Note**: Configuration notices for administrators
- **✅ None**: No security issues detected (safe)

## Development

### Setup from Source

For development or contributing:

```bash
npm install
npm run build
```

**Prerequisites**:
- Node.js >= 20.0.0
- npm

### Development Commands

```bash
# Run from source without building
npm run dev analyze workflow.json

# Run with PR comment format
npm run dev:pr-comment workflow.json

# Build and run
npm run build
node dist/index.js analyze workflow.json
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build TypeScript to JavaScript |
| `npm run dev` | Run in development mode with ts-node |
| `npm run analyze` | Build and run analysis |
| `npm test` | Run test suite |
| `npm run lint` | Run Biome lint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run fmt` | Format code with Biome |
| `npm run fmt:check` | Check formatting without modifying files |
| `npm run fix` | Auto-fix formatting and linting issues |

### Testing & Code Quality

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 mewuto
