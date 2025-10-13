---
description: Performs a semantic code search with contextual awareness, analyzing symbols, documentation, and relationships across the codebase.
argument-hint: "<query>"
---

## Search Query Analysis

**User's Original Query**: "$ARGUMENTS"

### Query Optimization

Claude, analyze the query above and improve it for code search:

1. **If vague** (e.g., "that parsing thing") → Make it specific (e.g., "language parser implementation")
2. **If a question** (e.g., "how does parsing work?") → Extract keywords (e.g., "parsing implementation process")
3. **If conversational** (e.g., "the stuff that handles languages") → Use technical terms (e.g., "language handler processor")
4. **If too broad** (e.g., "errors") → Add context (e.g., "error handling exception management")

**YourOptimizedQuery**: _{Claude: Write your improved query here, then use it below}_

Execute this command with your optimized query:

## Your task

Use the Bash tool to perform semantic code search.

**Workflow:**
1. Execute: `node .claude/scripts/codanna/context-provider.js find "$YourOptimizedQuery" --limit=5`
2. Analyze the results with their relevance scores
3. **To see actual implementation** of interesting results:
   - Use the line range from the Location field to read just the relevant code
   - Example: If you see "Location: `src/io/exit_code.rs:108-120`"
   - Use the Read tool with:
      - `file_path`: `src/io/exit_code.rs` (use the working directory from your environment context <env> to construct the absolute
  path)
      - `offset`: 108 (start line)
      - `limit`: 13 (calculated as: 120 - 108 + 1)
   - Formula: `limit = end_line - start_line + 1`
   - Example: `Read(file_path="/full/path/to/src/io/exit_code.rs", offset=108, limit=13)`
4. **When relationships are shown** (called_by, calls, defines, implements):
   - If a relationship looks relevant to answering the query, investigate it
   - Execute: `node .claude/scripts/codanna/context-provider.js symbol <relationship_symbol_name>`
   - Example: If you see "Called by: `initialize_registry`", run: `node .claude/scripts/codanna/context-provider.js symbol initialize_registry`
5. Build a complete picture by following 1-2 key relationships and reading relevant code sections
6. Present findings to the user with context from search results, relationships, and actual code snippets

**The results include:**
- Relevance scores (how well each result matches the query)
- Symbol documentation and signatures
- Relationships (who calls this, what it calls, what it defines)
- System guidance for follow-up investigation

**Tips:**
- To see actual implementation with `sed`: (works native on Unix based environments):
   - Use the line range from the Location field to read just the relevant code
   - Example: If you see "Location: `src/io/exit_code.rs:108-120`"
   - Execute: `sed -n '108,120p' src/io/exit_code.rs` to read lines 108-120
   - This shows the actual code implementation, not just the signature. It works like the Read tool.

- Add `--lang=rust` (or python, typescript, etc.) to narrow results by language
- Follow relationships that appear in multiple results (they're likely important)
- Use the `symbol` command to get full details about interesting relationships
