Current State Analysis

What we have:
- /symbol - Uses retrieve symbol (MCP Tier 2: precise lookup)
- /find - Semantic code search with contextual awareness
- Context provider wraps Codanna CLI commands

The /symbol command uses:
- retrieve symbol → Maps to MCP find_symbol (Tier 2)
- Pattern: Workflow instruction (Claude controls execution)
- Use case: "I know the symbol name, answer my specific question"

Analyzing Developer Workflows

Discovery workflow:
/find "authentication logic"
  → semantic_search_with_context (Tier 1)
  → Find code you don't know exists

/symbol AuthHandler "How does token validation work?"
  → find_symbol (Tier 2)
  → Deep dive on known symbol

Refactoring workflow:
/impact Parser
  → analyze_impact (Tier 1)
  → See complete dependency graph

/context Parser  
  → semantic_search_with_context (Tier 1)
  → Full context: docs, dependencies, callers, impact

Debugging workflow:
/trace process_file
  → get_calls + find_callers (Tier 3)
  → Visualize call chain

/symbol suspicious_function "Why might this fail?"
  → find_symbol (Tier 2)
  → Targeted analysis

The Key Insight

MCP Tool Tiers:

Tier 1 (highest quality) - Start here:
- semantic_search_with_context - Full context search
- analyze_impact - Complete dependency graph

Tier 2 - When you know names:
- find_symbol - Exact lookup ← This is what /symbol uses
- search_symbols - Fuzzy search

Tier 3 - Specific patterns:
- get_calls, find_callers - Function invocations only

Recommended Slash Command Set

Based on real developer workflows and tool tiers:

1. /find <query> (TIER 1 - Discovery)

Check if exists, if not create:
Uses: semantic_search_with_context
Purpose: Natural language code search with full context
Example: /find "error handling in parser"
Output: Top matches with docs, dependencies, relationships

2. /symbol <symbol> "<question>" (TIER 2 - Understanding) ✅ Already created

Uses: find_symbol  
Purpose: Targeted Q&A about known symbol
Example: /symbol index_file "What does this do?"
Output: Answer based on symbol details

3. /impact <symbol> (TIER 1 - Analysis)

Uses: analyze_impact MCP tool
Purpose: Complete dependency graph for refactoring
Example: /impact Parser
Output: What calls this, what it uses, what composes it

4. /trace <function> (TIER 3 - Flow Analysis)

Uses: get_calls + find_callers
Purpose: Visualize call graph
Example: /trace process_file
Output: Call chain from entry to this function

5. /context <symbol> (TIER 1 - Comprehensive)

Uses: semantic_search_with_context
Purpose: Everything about a symbol
Example: /context SimpleIndexer  
Output: Docs, impact, dependencies, usage examples

6. /deps <symbol> (Already exists - verify it uses impact analysis)

Check current implementation
Should use: analyze_impact focused on dependencies
Purpose: What does this symbol depend on?

Why This Design?

Each command serves a distinct workflow:

| Command  | Tier | Workflow      | Developer Question              |
|----------|------|---------------|---------------------------------|
| /find    | 1    | Discovery     | "Where is X?"                   |
| /context | 1    | Comprehensive | "Tell me everything"            |
| /impact  | 1    | Refactoring   | "What breaks if I change this?" |
| /symbol  | 2    | Understanding | "I know what it is, explain it" |
| /trace   | 3    | Debugging     | "How does execution flow?"      |
| /deps    | 1    | Analysis      | "What does this need?"          |

Workflow combinations:
Research: /find → /context → /symbol
Refactor: /context → /impact → make changes
Debug: /trace → /symbol → fix
Review: /deps → /impact → approve

What to Build Next

Priority order:

1. /impact - CRITICAL for refactoring, uses Tier 1
2. /context - Comprehensive view, uses Tier 1
3. /trace - Call graph visualization
4. Review /find - Ensure it uses semantic_search_with_context, not just text search
5. Review /deps - Verify it uses impact analysis properly

Why /symbol is perfect as-is:

It's a Tier 2 tool for a specific use case: "I already know the symbol, answer my question." This is valid and useful.
Not every command needs Tier 1 - different tiers serve different purposes.
