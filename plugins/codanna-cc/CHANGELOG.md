# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2025-10-21

### Added
- Symbol ID display in all command outputs (`[symbol_id:123]`)
- Symbol ID support in commands: `callers`, `calls`, `describe`
- Symbol ID workflow documentation in README.md

### Changed
- Relationship formatting now includes symbol IDs for all related symbols
- Semantic search results display symbol IDs for main results and relationships
- Updated command documentation to show `symbol_id:ID` syntax

### Removed
- Deleted obsolete plan.md file

## [0.1.2] - 2025-10-17

### Changed
- Aligned plugin manifest with Claude Code plugin schema
- Synchronized version numbers between marketplace.json and plugin.json
- Set `strict: false` in marketplace.json

## [0.1.1] - 2025-10-13

### Changed
- Renamed `/ask` command to `/symbol` for clarity
- updated commands/find.md with correct script paths
- updated scripts/README.md with correct script paths

## [0.1.0] - 2025-10-11

### Added
- Initial plugin release
- Codanna MCP server configurations (CLI, SSE, HTTPS transports)
- Two slash commands for code intelligence:
  - `/symbol` - Look up a symbol and ask Claude a specific question about it
  - `/find` - Smart semantic search for code with full context
- Node.js context provider scripts for executing Codanna commands
- Symbol formatting utilities (markdown, JSON, compact)
- JSON schema validation for Codanna responses
- Plugin manifest (`.claude-plugin/plugin.json`) for Claude Code integration

