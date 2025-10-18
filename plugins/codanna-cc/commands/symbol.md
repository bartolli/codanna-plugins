---
allowed-tools: Bash(node:*), Bash(sed:*), Grep, Glob
description: Looks up a symbol by name. Returns its location, signature, line range, documentation, calls, callers, implementations, and definitions.
argument-hint: <symbol-name> "<question>"
---

## Environment

CLAUDE_PLUGIN_ROOT = !`node -e "console.log(process.env.CLAUDE_PLUGIN_ROOT)"`

## Context

Symbol to analyze: **$1**

User's question: **$2**

## Your task

Use the Bash tool to fetch symbol information, then answer the user's question.

**Workflow:**
1. Execute: `node ${CLAUDE_PLUGIN_ROOT}/codanna-cc/scripts/context-provider.js symbol $1`
2. Analyze the symbol details returned
3. Answer the question: "$2"

When answering:
- Reference actual code locations (file:line_range)
- Explain relationships (calls, called_by, implements, defines)
- Use the signature and documentation from the symbol
- Be specific about how the symbol is used in the codebase

Focus on what the code actually shows, not general programming principles.
