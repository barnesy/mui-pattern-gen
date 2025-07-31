/**
 * DBML Parser Service
 * Parses DBML (Database Markup Language) files to extract entities, fields, and relationships
 * for prototype generation
 */

import { DBMLPrototypeSchema } from '../../types/prototype';
import { FieldSchema, DataShape } from '../../schemas/types';

/**
 * Parsed DBML table column information
 */
export interface DBMLColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  defaultValue?: string;
  constraints: string[];
  references?: {
    table: string;
    column: string;
  };
}

/**
 * Parsed DBML table information
 */
export interface DBMLTable {
  name: string;
  columns: DBMLColumn[];
  indexes?: Array<{
    name?: string;
    columns: string[];
    unique?: boolean;
  }>;
  note?: string;
}

/**
 * Parsed DBML relationship information
 */
export interface DBMLRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

/**
 * Complete parsed DBML structure
 */
export interface ParsedDBML {
  tables: DBMLTable[];
  relationships: DBMLRelationship[];
  enums?: Array<{
    name: string;
    values: string[];
  }>;
  notes?: string[];
}

/**
 * Database type to UI field type mapping
 */
const DB_TYPE_TO_FIELD_TYPE: Record<string, { type: FieldSchema['type']; format?: FieldSchema['format'] }> = {
  // String types
  'varchar': { type: 'string' },
  'text': { type: 'string' },
  'char': { type: 'string' },
  'string': { type: 'string' },
  
  // Number types
  'int': { type: 'number' },
  'integer': { type: 'number' },
  'bigint': { type: 'number' },
  'smallint': { type: 'number' },
  'decimal': { type: 'number' },
  'numeric': { type: 'number' },
  'float': { type: 'number' },
  'double': { type: 'number' },
  'real': { type: 'number' },
  
  // Boolean types
  'boolean': { type: 'boolean' },
  'bool': { type: 'boolean' },
  
  // Date types
  'date': { type: 'date' },
  'datetime': { type: 'date', format: 'datetime' },
  'timestamp': { type: 'date', format: 'datetime' },
  'time': { type: 'date' },
  
  // Special types
  'email': { type: 'string', format: 'email' },
  'url': { type: 'string', format: 'url' },
  'phone': { type: 'string', format: 'phone' },
  'currency': { type: 'number', format: 'currency' },
  'percentage': { type: 'number', format: 'percentage' },
  
  // JSON/Object types
  'json': { type: 'object' },
  'jsonb': { type: 'object' },
};

/**
 * DBML Parser class
 */
export class DBMLParser {
  
  /**
   * Parse DBML content into structured data
   */
  static parse(dbmlContent: string): ParsedDBML {
    const parser = new DBMLParser();
    return parser.parseContent(dbmlContent);
  }

  /**
   * Convert parsed DBML to prototype schema
   */
  static toPrototypeSchema(parsed: ParsedDBML): DBMLPrototypeSchema {
    const parser = new DBMLParser();
    return {
      type: 'dbml',
      data: {
        dbml: '', // Original DBML content would be stored here
        tables: parsed.tables.map((table) => ({
          name: table.name,
          columns: table.columns.map((col) => ({
            name: col.name,
            type: col.type,
            constraints: col.constraints
          }))
        }))
      }
    };
  }

  /**
   * Generate component data shapes from DBML tables
   */
  static generateDataShapes(parsed: ParsedDBML): Record<string, DataShape> {
    const parser = new DBMLParser();
    return parser.generateDataShapesFromTables(parsed.tables);
  }

  /**
   * Generate view suggestions based on table structure
   */
  static generateViewSuggestions(parsed: ParsedDBML): Array<{
    table: string;
    views: Array<{
      type: 'list' | 'detail' | 'form' | 'dashboard';
      name: string;
      description: string;
      suggestedComponents: string[];
    }>;
  }> {
    const parser = new DBMLParser();
    return parser.generateViewSuggestionsFromTables(parsed.tables, parsed.relationships);
  }

  private parseContent(content: string): ParsedDBML {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result: ParsedDBML = {
      tables: [],
      relationships: [],
      enums: [],
      notes: []
    };

    let currentTable: DBMLTable | null = null;
    let insideTable = false;
    let braceDepth = 0;

    for (const line of lines) {
      // Skip comments
      if (line.startsWith('//') || line.startsWith('/*')) {
        continue;
      }

      // Parse table definitions
      if (line.toLowerCase().startsWith('table ')) {
        const match = line.match(/table\s+(\w+)\s*\{?/i);
        if (match) {
          currentTable = {
            name: match[1],
            columns: [],
            indexes: []
          };
          insideTable = true;
          if (line.includes('{')) {
            braceDepth = 1;
          }
        }
        continue;
      }

      // Handle table opening brace
      if (insideTable && line === '{') {
        braceDepth = 1;
        continue;
      }

      // Handle table closing brace
      if (insideTable && line === '}') {
        braceDepth = 0;
        if (currentTable) {
          result.tables.push(currentTable);
          currentTable = null;
        }
        insideTable = false;
        continue;
      }

      // Parse columns inside table
      if (insideTable && currentTable && braceDepth > 0) {
        const column = this.parseColumn(line);
        if (column) {
          currentTable.columns.push(column);
        }
        continue;
      }

      // Parse references/relationships
      if (line.toLowerCase().includes('ref:')) {
        const relationship = this.parseRelationship(line);
        if (relationship) {
          result.relationships.push(relationship);
        }
        continue;
      }

      // Parse enums
      if (line.toLowerCase().startsWith('enum ')) {
        const enumDef = this.parseEnum(line, lines);
        if (enumDef) {
          result.enums!.push(enumDef);
        }
        continue;
      }
    }

    return result;
  }

  private parseColumn(line: string): DBMLColumn | null {
    // Simple column parsing - handles basic format: name type [constraints]
    const columnMatch = line.match(/^(\w+)\s+(\w+)(?:\(.*?\))?\s*(.*)?$/);
    if (!columnMatch) {
      return null;
    }

    const [, name, type, constraintsStr = ''] = columnMatch;
    const constraints: string[] = [];
    let isPrimaryKey = false;
    let isNotNull = false;
    let isUnique = false;
    let defaultValue: string | undefined;
    let references: DBMLColumn['references'];

    // Parse constraints
    if (constraintsStr) {
      if (constraintsStr.includes('[pk]') || constraintsStr.includes('primary key')) {
        isPrimaryKey = true;
        constraints.push('primary_key');
      }
      if (constraintsStr.includes('not null')) {
        isNotNull = true;
        constraints.push('not_null');
      }
      if (constraintsStr.includes('unique')) {
        isUnique = true;
        constraints.push('unique');
      }

      // Parse default value
      const defaultMatch = constraintsStr.match(/default:\s*([^,\]]+)/);
      if (defaultMatch) {
        defaultValue = defaultMatch[1].trim();
      }

      // Parse references
      const refMatch = constraintsStr.match(/ref:\s*>\s*(\w+)\.(\w+)/);
      if (refMatch) {
        references = {
          table: refMatch[1],
          column: refMatch[2]
        };
      }
    }

    return {
      name,
      type: type.toLowerCase(),
      isPrimaryKey,
      isNotNull,
      isUnique,
      defaultValue,
      constraints,
      references
    };
  }

  private parseRelationship(line: string): DBMLRelationship | null {
    // Parse relationship format: Ref: table1.column1 > table2.column2
    const refMatch = line.match(/ref:\s*(\w+)\.(\w+)\s*([<>-]+)\s*(\w+)\.(\w+)/i);
    if (!refMatch) {
      return null;
    }

    const [, fromTable, fromColumn, operator, toTable, toColumn] = refMatch;
    
    let type: DBMLRelationship['type'];
    if (operator === '>') {
      type = 'many-to-one';
    } else if (operator === '<') {
      type = 'one-to-many';
    } else if (operator === '-') {
      type = 'one-to-one';
    } else if (operator === '<>') {
      type = 'many-to-many';
    } else {
      type = 'one-to-many'; // default
    }

    return {
      type,
      fromTable,
      fromColumn,
      toTable,
      toColumn
    };
  }

  private parseEnum(line: string, allLines: string[]): { name: string; values: string[] } | null {
    const enumMatch = line.match(/enum\s+(\w+)\s*\{?/i);
    if (!enumMatch) {
      return null;
    }

    const enumName = enumMatch[1];
    const values: string[] = [];

    // Simple enum parsing - assumes single line format for now
    const valuesMatch = line.match(/\{([^}]+)\}/);
    if (valuesMatch) {
      const valuesStr = valuesMatch[1];
      values.push(...valuesStr.split(',').map(v => v.trim().replace(/['"]/g, '')));
    }

    return { name: enumName, values };
  }

  private generateDataShapesFromTables(tables: DBMLTable[]): Record<string, DataShape> {
    const shapes: Record<string, DataShape> = {};

    for (const table of tables) {
      const fields: Record<string, FieldSchema> = {};
      const required: string[] = [];

      for (const column of table.columns) {
        const fieldType = this.mapColumnToFieldType(column);
        fields[column.name] = fieldType;

        if (column.isNotNull || column.isPrimaryKey) {
          required.push(column.name);
        }
      }

      shapes[table.name] = {
        type: 'object',
        fields,
        required
      };
    }

    return shapes;
  }

  private mapColumnToFieldType(column: DBMLColumn): FieldSchema {
    const mapping = DB_TYPE_TO_FIELD_TYPE[column.type] || { type: 'string' };
    
    const field: FieldSchema = {
      type: mapping.type,
      required: column.isNotNull || column.isPrimaryKey,
      description: `${column.type} field${column.isPrimaryKey ? ' (Primary Key)' : ''}`
    };

    if (mapping.format) {
      field.format = mapping.format;
    }

    if (column.defaultValue) {
      field.default = column.defaultValue;
    }

    // Add validation constraints based on database type
    if (column.type.includes('varchar') || column.type.includes('char')) {
      const lengthMatch = column.type.match(/\((\d+)\)/);
      if (lengthMatch) {
        field.maxLength = parseInt(lengthMatch[1]);
      }
    }

    return field;
  }

  private generateViewSuggestionsFromTables(
    tables: DBMLTable[], 
    relationships: DBMLRelationship[]
  ): Array<{
    table: string;
    views: Array<{
      type: 'list' | 'detail' | 'form' | 'dashboard';
      name: string;
      description: string;
      suggestedComponents: string[];
    }>;
  }> {
    return tables.map(table => ({
      table: table.name,
      views: [
        {
          type: 'list' as const,
          name: `${table.name}List`,
          description: `List view for ${table.name} records`,
          suggestedComponents: ['DataTable', 'SearchBar', 'Pagination', 'FilterPanel']
        },
        {
          type: 'detail' as const,
          name: `${table.name}Detail`,
          description: `Detail view for ${table.name} record`,
          suggestedComponents: ['InfoCard', 'LabelValuePair', 'ActionButtons']
        },
        {
          type: 'form' as const,
          name: `${table.name}Form`,
          description: `Form for creating/editing ${table.name}`,
          suggestedComponents: ['FormContainer', 'TextFields', 'SubmitButton', 'ValidationMessages']
        },
        // Add dashboard view if table has numeric fields or relationships
        ...(this.hasDashboardPotential(table, relationships) ? [{
          type: 'dashboard' as const,
          name: `${table.name}Dashboard`,
          description: `Dashboard overview for ${table.name} analytics`,
          suggestedComponents: ['StatsCards', 'Charts', 'MetricWidgets', 'FilterControls']
        }] : [])
      ]
    }));
  }

  private hasDashboardPotential(table: DBMLTable, relationships: DBMLRelationship[]): boolean {
    // Check if table has numeric fields (for metrics)
    const hasNumericFields = table.columns.some(col => 
      ['int', 'integer', 'bigint', 'decimal', 'numeric', 'float', 'double'].includes(col.type)
    );

    // Check if table has relationships (for aggregations)
    const hasRelationships = relationships.some(rel => 
      rel.fromTable === table.name || rel.toTable === table.name
    );

    // Check if table has date fields (for time-based analytics)
    const hasDateFields = table.columns.some(col => 
      ['date', 'datetime', 'timestamp'].includes(col.type)
    );

    return hasNumericFields || hasRelationships || hasDateFields;
  }
}

/**
 * Validation utilities for DBML parsing
 */
export class DBMLValidator {
  
  /**
   * Validate DBML syntax and structure
   */
  static validate(dbmlContent: string): {
    valid: boolean;
    errors: Array<{
      line: number;
      message: string;
      severity: 'error' | 'warning';
    }>;
  } {
    const errors: Array<{ line: number; message: string; severity: 'error' | 'warning' }> = [];
    const lines = dbmlContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;

      // Check for basic syntax errors
      if (line.includes('table') && !line.includes('{') && !lines[i + 1]?.trim().includes('{')) {
        errors.push({
          line: lineNumber,
          message: 'Table definition missing opening brace',
          severity: 'error'
        });
      }

      // Check for unmatched braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      if (openBraces !== closeBraces && line.includes('{') && line.includes('}')) {
        errors.push({
          line: lineNumber,
          message: 'Unmatched braces on same line',
          severity: 'warning'
        });
      }
    }

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  }

  /**
   * Check if DBML content appears to be valid
   */
  static isValidDBML(content: string): boolean {
    const validation = this.validate(content);
    return validation.valid;
  }
}