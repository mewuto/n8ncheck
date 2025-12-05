# n8ncheck - Development Guide

Security vulnerability checker for n8n workflows.

## Project Overview

This tool performs security analysis on n8n workflow files:
- **Node-level Security Checks**: Validates individual node configurations
- **Workflow-level Scenario Checks**: Analyzes node relationships and patterns
- **Multiple Output Formats**: Console, JSON, and GitHub PR comment formats

## Development Commands

### Basic Analysis

```bash
# Console output (default)
npm run dev analyze workflow.json

# JSON output to file
npm run dev analyze workflow.json -- -f json -o tmp/output/output.json

# PR comment format (recommended for testing)
npm run dev analyze workflow.json -- -f pr-comment
npm run dev:pr-comment workflow.json
```

### Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build TypeScript to JavaScript |
| `npm run dev` | Run in development mode with ts-node |
| `npm test` | Run test suite |
| `npm run lint` | Run Biome lint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run fmt` | Format code with Biome |
| `npm run fmt:check` | Check formatting without modifying files |
| `npm run fix` | Auto-fix formatting and linting issues |

## Coding Guidelines

### Language
- All messages and logs in this repository must be written in English
- Comments in the codebase must be in English
- Commit messages must be in English

### TypeScript Best Practices
- Avoid using `any`, `unknown`, or `as` type assertions
- If type definitions are unclear, ask the implementer
- No dynamic imports allowed
- Only create functions that are used - keep implementation minimal
- Always run `npm run build` after code changes and fix any errors

### Development Philosophy
- This implementation is not in production yet
- Always aim for the ideal state
- Breaking changes are acceptable (no migration concerns)

## Testing

### Run Tests

```bash
npm test
```

### Test Format (Recommended)

Use PR comment format for testing:

```bash
npm run dev analyze workflow.json -- -f pr-comment
```

## Build Verification

After making code changes:

```bash
npm run build
npm run typecheck
npm run lint
npm test
```

All commands should complete without errors.

