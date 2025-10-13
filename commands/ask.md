---
description: Look up a symbol and ask Claude a specific question about it
argument-hint: <symbol-name> "<question>"
---

## Context

Symbol to analyze: **$1**

User's question: **$2**

## Your task

Use the Bash tool to fetch symbol information, then answer the user's question.

**Workflow:**
1. Execute: `node .claude/scripts/context-provider.js symbol $1`
2. Analyze the symbol details returned
3. Answer the question: "$2"

When answering:
- Reference actual code locations (file:line)
- Explain relationships (calls, called_by, implements, defines)
- Use the signature and documentation from the symbol
- Be specific about how the symbol is used in the codebase

Focus on what the code actually shows, not general programming principles.
