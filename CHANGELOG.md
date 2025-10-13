# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-11

### Added
- Initial plugin release
- Codanna MCP server configurations (CLI, SSE, HTTPS transports)
- Two slash commands for code intelligence:
  - `/ask` - Look up a symbol and ask Claude a specific question about it
  - `/find` - Smart semantic search for code with full context
- Node.js context provider scripts for executing Codanna commands
- Symbol formatting utilities (markdown, JSON, compact)
- JSON schema validation for Codanna responses
- Plugin manifest (`.claude-plugin/plugin.json`) for Claude Code integration

