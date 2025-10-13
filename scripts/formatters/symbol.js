#!/usr/bin/env node

/**
 * Format symbol data for rich display
 */
class SymbolFormatter {
  /**
   * Format a symbol response into readable output
   * @param {Object} response - Codanna symbol response
   * @returns {string} Formatted output
   */
  static format(response) {
    if (response.status === 'not_found') {
      return `Symbol not found: ${response.metadata?.query || 'unknown'}`;
    }

    if (response.status === 'error') {
      return `Error: ${response.message || 'Unknown error'}`;
    }

    // Handle both single item and items array
    const item = response.item || (response.items && response.items[0]);
    if (!item) {
      return 'No symbol data available';
    }

    const { symbol, file_path, relationships } = item;
    const lines = [];

    // Header
    lines.push('');
    lines.push(`# ${symbol.name}`);
    lines.push('');

    // Symbol metadata
    lines.push(`**Kind:** ${symbol.kind}`);
    lines.push(`**Language:** ${symbol.language_id}`);
    lines.push(`**Visibility:** ${symbol.visibility}`);
    lines.push('');

    // Location
    lines.push(`**Location:** ${file_path}:${symbol.range.start_line}`);
    lines.push(`**Module:** ${symbol.module_path || 'N/A'}`);
    lines.push('');

    // Signature
    if (symbol.signature) {
      lines.push('**Signature:**');
      lines.push('```');
      lines.push(symbol.signature);
      lines.push('```');
      lines.push('');
    }

    // Documentation
    if (symbol.doc_comment) {
      lines.push('**Documentation:**');
      lines.push(symbol.doc_comment);
      lines.push('');
    }

    // Relationships - handle null relationships gracefully
    if (relationships) {
      const hasRelationships = Object.values(relationships).some(r => r && Array.isArray(r) && r.length > 0);

      if (hasRelationships) {
        lines.push('## Relationships');
        lines.push('');

        if (Array.isArray(relationships.implements) && relationships.implements.length > 0) {
          lines.push('**Implements:**');
          relationships.implements.forEach((item) => {
            const impl = Array.isArray(item) ? item[0] : item;
            lines.push(`  - ${impl.name} (${impl.kind})`);
          });
          lines.push('');
        }

        if (Array.isArray(relationships.implemented_by) && relationships.implemented_by.length > 0) {
          lines.push('**Implemented by:**');
          relationships.implemented_by.forEach((item) => {
            const impl = Array.isArray(item) ? item[0] : item;
            lines.push(`  - ${impl.name} (${impl.kind})`);
          });
          lines.push('');
        }

        if (Array.isArray(relationships.calls) && relationships.calls.length > 0) {
          lines.push('**Calls:**');
          relationships.calls.forEach((item) => {
            const callee = Array.isArray(item) ? item[0] : item;
            lines.push(`  - ${callee.name} (${callee.kind})`);
          });
          lines.push('');
        }

        if (Array.isArray(relationships.called_by) && relationships.called_by.length > 0) {
          lines.push('**Called by:**');
          relationships.called_by.forEach((item) => {
            const [caller, calleeRef] = Array.isArray(item) ? item : [item, ''];
            lines.push(`  - ${caller.name} (${caller.kind})${calleeRef ? ` → ${calleeRef}` : ''}`);
          });
          lines.push('');
        }

        if (Array.isArray(relationships.defines) && relationships.defines.length > 0) {
          lines.push('**Defines:**');
          relationships.defines.forEach((item) => {
            const defined = Array.isArray(item) ? item[0] : item;
            lines.push(`  - ${defined.name} (${defined.kind})`);
          });
          lines.push('');
        }
      }
    }

    // Scope context
    if (symbol.scope_context) {
      lines.push('---');
      lines.push(`*Scope: ${symbol.scope_context}*`);
    }

    return lines.join('\n');
  }

  /**
   * Format for compact display (one-line summary)
   * @param {Object} response - Codanna symbol response
   * @returns {string} Compact summary
   */
  static formatCompact(response) {
    if (response.status !== 'success') {
      return `${response.status}: ${response.metadata?.query || 'unknown'}`;
    }

    const item = response.item || (response.items && response.items[0]);
    if (!item) return 'No symbol data';

    const { symbol, file_path } = item;
    const location = `${file_path}:${symbol.range.start_line}`;
    return `${symbol.kind} ${symbol.name} @ ${location}`;
  }

  /**
   * Format as JSON (pretty-printed)
   * @param {Object} response - Codanna symbol response
   * @returns {string} Pretty JSON
   */
  static formatJson(response) {
    return JSON.stringify(response, null, 2);
  }
}

module.exports = SymbolFormatter;
