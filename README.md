# n8ncheck

[![Test](https://github.com/mewuto/n8ncheck/workflows/Test/badge.svg)](https://github.com/mewuto/n8ncheck/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Security vulnerability checker for n8n workflows.

## Features

- **Node-level Security Checks**: Validates individual node configurations for security issues
- **Workflow-level Scenario Checks**: Analyzes node relationships and workflow patterns
- **Multiple Output Formats**: Console, JSON, and GitHub PR comment formats

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm

### Setup

```bash
npm install
npm run build
```

## Usage

### Basic Commands

```bash
# Basic security analysis (console output)
npm run dev analyze workflow.json

# PR comment format for GitHub integration
npm run dev analyze workflow.json -- -f pr-comment
```

### Production Usage

```bash
# Build and run analysis
npm run build
n8ncheck analyze workflow.json

# Or using node directly
node dist/index.js analyze workflow.json
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --format <type>` | Output format: `console`, `pr-comment` | console |
| `-o, --output <file>` | Save output to file | stdout |
| `-g, --graph` | Show detailed graph information | false |

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

## Contributing

We welcome bug fixes and documentation improvements. If you find issues, please submit an issue first.

If you want to submit a PR for bug fixes or documentation, please read the [CONTRIBUTING.md](CONTRIBUTING.md) and follow the instructions beforehand.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 mewuto
