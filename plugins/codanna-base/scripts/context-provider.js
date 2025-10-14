#!/usr/bin/env node

const CodannaExecutor = require('./lib/executor');
const SchemaValidator = require('./lib/validator');
const SymbolFormatter = require('./formatters/symbol');
const SemanticFormatter = require('./formatters/semantic');

/**
 * Context Provider CLI for Claude slash commands
 *
 * Usage:
 *   node context-provider.js symbol <name> [--format=markdown|json|compact] [--lang=rust|python|typescript|...]
 *   node context-provider.js callers <function-name> [--lang=...]
 *   node context-provider.js calls <function-name> [--lang=...]
 *   node context-provider.js search <query> [--limit=5] [--lang=...]
 *   node context-provider.js describe <symbol-name> [--lang=...]
 *   node context-provider.js find <query> [--limit=5] [--lang=...] [--format=markdown|json|compact]
 */

class ContextProvider {
  constructor() {
    this.executor = new CodannaExecutor();
    this.validator = new SchemaValidator();
    this.symbolLocationCache = new Map();
  }

  /**
   * Attempt to resolve and cache the file path for a symbol using MCP lookups.
   */
  ensureSymbolLocation(symbol) {
    if (!symbol) {
      return;
    }

    if (symbol.file_path) {
      this.cacheSymbolLocation(symbol, symbol.file_path);
      return;
    }

    const cacheKey = this.getSymbolCacheKey(symbol);
    if (cacheKey && this.symbolLocationCache.has(cacheKey)) {
      symbol.file_path = this.symbolLocationCache.get(cacheKey);
      return;
    }

    if (symbol.file_id === undefined || symbol.file_id === null || !symbol.name) {
      return;
    }

    try {
      const matches = this.executor.findSymbolWithFilters({
        name: symbol.name,
        file_id: symbol.file_id,
        limit: 5
      });

      if (!Array.isArray(matches) || matches.length === 0) {
        return;
      }

      const match = matches.find(entry => entry.symbol?.id === symbol.id) || matches[0];
      if (match && match.file_path) {
        symbol.file_path = match.file_path;
        this.cacheSymbolLocation(symbol, match.file_path);
      }
    } catch (error) {
      // Swallow lookup errors to keep formatting resilient
    }
  }

  /**
   * Cache symbol file path using multiple keys for reuse.
   */
  cacheSymbolLocation(symbol, filePath) {
    const cacheKeys = [];
    if (symbol.id !== undefined && symbol.id !== null) {
      cacheKeys.push(`id:${symbol.id}`);
    }
    if (symbol.file_id !== undefined && symbol.file_id !== null) {
      cacheKeys.push(`file:${symbol.file_id}`);
    }
    if (symbol.name && symbol.file_id !== undefined && symbol.file_id !== null) {
      cacheKeys.push(`name:${symbol.name}|file:${symbol.file_id}`);
    }

    cacheKeys.forEach((key) => {
      if (!this.symbolLocationCache.has(key)) {
        this.symbolLocationCache.set(key, filePath);
      }
    });
  }

  /**
   * Build a cache key for a symbol lookup.
   */
  getSymbolCacheKey(symbol) {
    if (symbol.id !== undefined && symbol.id !== null) {
      return `id:${symbol.id}`;
    }
    if (symbol.file_id !== undefined && symbol.file_id !== null && symbol.name) {
      return `name:${symbol.name}|file:${symbol.file_id}`;
    }
    if (symbol.file_id !== undefined && symbol.file_id !== null) {
      return `file:${symbol.file_id}`;
    }
    return null;
  }

  /**
   * Enrich relationships in a response with file locations when missing.
   */
  enrichRelationships(response) {
    if (!response) {
      return;
    }

    const items = [];
    if (response.item) {
      items.push(response.item);
    }
    if (Array.isArray(response.items)) {
      items.push(...response.items);
    }

    items.forEach((item) => {
      if (!item || !item.relationships) {
        return;
      }

      if (item.symbol && item.file_path) {
        item.symbol.file_path = item.file_path;
        this.cacheSymbolLocation(item.symbol, item.file_path);
      }

      const sections = ['implements', 'implemented_by', 'defines', 'calls', 'called_by'];
      sections.forEach((section) => {
        const entries = item.relationships[section];
        if (!Array.isArray(entries)) {
          return;
        }

        entries.forEach((entry) => {
          const symbol = Array.isArray(entry) ? entry[0] : entry;
          if (!symbol) {
            return;
          }
          this.ensureSymbolLocation(symbol);
        });
      });
    });
  }

  /**
   * Handle symbol lookup command
   */
  async handleSymbol(symbolName, options = {}) {
    // Add language filter if specified
    let args = symbolName;
    if (options.lang) {
      args = `name:${symbolName} lang:${options.lang}`;
    }

    const response = this.executor.findSymbol(args);

    // Enhanced not found message with language filter context (except for JSON format)
    const format = options.format || 'markdown';
    if (response.status === 'not_found' && options.lang && format !== 'json') {
      return `Symbol '${symbolName}' not found in language '${options.lang}'.\nTry without --lang filter or check if the language is indexed.`;
    }

    // Validate response
    this.validator.validateOrThrow(response, 'symbol');
    this.enrichRelationships(response);

    // Format output
    switch (format) {
      case 'json':
        return SymbolFormatter.formatJson(response);
      case 'compact':
        return SymbolFormatter.formatCompact(response);
      case 'markdown':
      default:
        return SymbolFormatter.format(response);
    }
  }

  /**
   * Handle callers lookup command
   */
  async handleCallers(functionName, options = {}) {
    const response = this.executor.findCallers(functionName);

    if (response.status === 'not_found') {
      return `No callers found for: ${functionName}`;
    }

    const lines = [`# Callers of ${functionName}`, ''];

    if (response.items && response.items.length > 0) {
      response.items.forEach(item => {
        const { symbol, file_path } = item;
        const location = SymbolFormatter.formatLocation(file_path, symbol.range);
        lines.push(`- **${symbol.name}** (${symbol.kind}) @ ${location}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Handle calls lookup command
   */
  async handleCalls(functionName, options = {}) {
    const response = this.executor.findCalls(functionName);

    if (response.status === 'not_found') {
      return `No calls found for: ${functionName}`;
    }

    const lines = [`# Calls made by ${functionName}`, ''];

    if (response.items && response.items.length > 0) {
      response.items.forEach(item => {
        const { symbol, file_path } = item;
        const location = SymbolFormatter.formatLocation(file_path, symbol.range);
        lines.push(`- **${symbol.name}** (${symbol.kind}) @ ${location}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Handle search command
   */
  async handleSearch(query, options = {}) {
    const limit = options.limit || 5;

    // Build query with optional language filter
    let searchArgs = `query:"${query}" limit:${limit}`;
    if (options.lang) {
      searchArgs += ` lang:${options.lang}`;
    }

    const response = this.executor.execute('retrieve search', searchArgs);

    if (response.status === 'not_found' || response.count === 0) {
      if (options.lang) {
        return `No results found for: "${query}" in language '${options.lang}'.\nTry without --lang filter or check if the language is indexed.`;
      }
      return `No results found for: ${query}`;
    }

    const lines = [`# Search Results: "${query}"`, ''];
    if (options.lang) {
      lines.push(`*Language filter: ${options.lang}*`, '');
    }

    if (response.items && response.items.length > 0) {
      response.items.forEach((item, index) => {
        const { symbol, file_path } = item;
        lines.push(`${index + 1}. **${symbol.name}** (${symbol.kind}) [${symbol.language_id}]`);
        const location = SymbolFormatter.formatLocation(file_path, symbol.range);
        lines.push(`   ${location}`);
        if (symbol.signature) {
          lines.push(`   \`${symbol.signature}\``);
        }
        lines.push('');
      });
    }

    return lines.join('\n');
  }

  /**
   * Handle describe command
   */
  async handleDescribe(symbolName, options = {}) {
    const response = this.executor.describe(symbolName);
    this.enrichRelationships(response);
    return SymbolFormatter.format(response);
  }

  /**
   * Handle semantic search with context (find command)
   */
  async handleFind(query, options = {}) {
    const limit = options.limit ? parseInt(options.limit) : 5;
    const lang = options.lang || null;

    const response = this.executor.semanticSearch(query, limit, lang);

    // Validate response
    this.validator.validateOrThrow(response, 'semantic_search');

    // Format output
    const format = options.format || 'markdown';
    switch (format) {
      case 'json':
        return SemanticFormatter.formatJson(response);
      case 'compact':
        return SemanticFormatter.formatCompact(response);
      case 'markdown':
      default:
        return SemanticFormatter.format(response);
    }
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const command = args[2];
    const target = args[3];
    const options = {};

    // Parse options (--key=value)
    for (let i = 4; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        options[key] = value || true;
      }
    }

    return { command, target, options };
  }

  /**
   * Main entry point
   */
  async run(args) {
    try {
      const { command, target, options } = this.parseArgs(args);

      if (!command || !target) {
        console.error('Usage: context-provider.js <command> <target> [options]');
        console.error('Commands: symbol, callers, calls, search, describe, find');
        process.exit(1);
      }

      let output;
      switch (command) {
        case 'symbol':
          output = await this.handleSymbol(target, options);
          break;
        case 'callers':
          output = await this.handleCallers(target, options);
          break;
        case 'calls':
          output = await this.handleCalls(target, options);
          break;
        case 'search':
          output = await this.handleSearch(target, options);
          break;
        case 'describe':
          output = await this.handleDescribe(target, options);
          break;
        case 'find':
          output = await this.handleFind(target, options);
          break;
        default:
          throw new Error(`Unknown command: ${command}`);
      }

      console.log(output);
      process.exit(0);

    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const provider = new ContextProvider();
  provider.run(process.argv);
}

module.exports = ContextProvider;
