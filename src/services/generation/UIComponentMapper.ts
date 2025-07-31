/**
 * UI Component Mapper Service
 * Maps database entities and fields to appropriate UI components and patterns
 */

import { DBMLTable, DBMLColumn, DBMLRelationship } from '../dbml/DBMLParser';
import { ComponentSchema, PropSchema, FieldSchema } from '../../schemas/types';

/**
 * UI component suggestion for a database table
 */
export interface UIComponentSuggestion {
  table: string;
  views: Array<{
    type: 'list' | 'detail' | 'form' | 'dashboard' | 'master-detail';
    name: string;
    description: string;
    components: Array<{
      id: string;
      type: string;
      props: Record<string, any>;
      pattern?: string;
      dataBinding?: {
        source: string;
        fields: string[];
        relationships?: string[];
      };
    }>;
    layout: {
      type: 'grid' | 'flex' | 'stack';
      config: Record<string, any>;
    };
  }>;
}

/**
 * Field type to UI component mapping
 */
const FIELD_TYPE_TO_UI_COMPONENT: Record<string, {
  component: string;
  pattern?: string;
  props: Record<string, any>;
}> = {
  // String types
  'varchar': { 
    component: 'TextField', 
    props: { variant: 'outlined', fullWidth: true } 
  },
  'text': { 
    component: 'TextField', 
    props: { variant: 'outlined', multiline: true, rows: 4, fullWidth: true } 
  },
  'string': { 
    component: 'TextField', 
    props: { variant: 'outlined', fullWidth: true } 
  },
  
  // Number types
  'int': { 
    component: 'TextField', 
    props: { type: 'number', variant: 'outlined', fullWidth: true } 
  },
  'integer': { 
    component: 'TextField', 
    props: { type: 'number', variant: 'outlined', fullWidth: true } 
  },
  'decimal': { 
    component: 'TextField', 
    props: { type: 'number', variant: 'outlined', fullWidth: true, inputProps: { step: '0.01' } } 
  },
  'float': { 
    component: 'TextField', 
    props: { type: 'number', variant: 'outlined', fullWidth: true, inputProps: { step: '0.01' } } 
  },
  
  // Boolean types
  'boolean': { 
    component: 'Switch', 
    props: { color: 'primary' } 
  },
  'bool': { 
    component: 'Checkbox', 
    props: { color: 'primary' } 
  },
  
  // Date types
  'date': { 
    component: 'DatePicker', 
    props: { fullWidth: true } 
  },
  'datetime': { 
    component: 'DateTimePicker', 
    props: { fullWidth: true } 
  },
  'timestamp': { 
    component: 'DateTimePicker', 
    props: { fullWidth: true } 
  },
  
  // Special types
  'email': { 
    component: 'TextField', 
    props: { type: 'email', variant: 'outlined', fullWidth: true } 
  },
  'url': { 
    component: 'TextField', 
    props: { type: 'url', variant: 'outlined', fullWidth: true } 
  },
  'phone': { 
    component: 'TextField', 
    props: { type: 'tel', variant: 'outlined', fullWidth: true } 
  },
  
  // File types
  'image': { 
    component: 'ImageUpload', 
    pattern: 'FileUpload',
    props: { accept: 'image/*', fullWidth: true } 
  },
  'file': { 
    component: 'FileUpload', 
    pattern: 'FileUpload',
    props: { fullWidth: true } 
  }
};

/**
 * Table pattern suggestions based on characteristics
 */
const TABLE_PATTERNS: Array<{
  pattern: string;
  description: string;
  conditions: (table: DBMLTable, relationships: DBMLRelationship[]) => boolean;
  components: Array<{
    view: 'list' | 'detail' | 'form';
    component: string;
    props: Record<string, any>;
  }>;
}> = [
  {
    pattern: 'UserManagement',
    description: 'User management with authentication features',
    conditions: (table) => 
      table.name.toLowerCase().includes('user') && 
      table.columns.some(col => col.name.toLowerCase().includes('email')),
    components: [
      { view: 'list', component: 'UserTable', props: { actions: ['edit', 'delete', 'activate'] } },
      { view: 'detail', component: 'UserProfile', props: { showAvatar: true, showStatus: true } },
      { view: 'form', component: 'UserForm', props: { includeRoleSelection: true } }
    ]
  },
  {
    pattern: 'ProductCatalog',
    description: 'Product catalog with pricing and inventory',
    conditions: (table) => 
      table.name.toLowerCase().includes('product') && 
      table.columns.some(col => col.name.toLowerCase().includes('price')),
    components: [
      { view: 'list', component: 'ProductGrid', props: { showImages: true, showPricing: true } },
      { view: 'detail', component: 'ProductDetail', props: { showGallery: true, showSpecs: true } },
      { view: 'form', component: 'ProductForm', props: { includePricing: true, includeInventory: true } }
    ]
  },
  {
    pattern: 'OrderManagement',
    description: 'Order processing and tracking',
    conditions: (table) => 
      table.name.toLowerCase().includes('order') && 
      table.columns.some(col => col.name.toLowerCase().includes('status')),
    components: [
      { view: 'list', component: 'OrderTable', props: { showStatus: true, showTotal: true } },
      { view: 'detail', component: 'OrderDetail', props: { showTimeline: true, showItems: true } },
      { view: 'form', component: 'OrderForm', props: { includeShipping: true } }
    ]
  }
];

/**
 * UI Component Mapper class
 */
export class UIComponentMapper {
  
  /**
   * Generate UI component suggestions for DBML tables
   */
  static generateSuggestions(
    tables: DBMLTable[],
    relationships: DBMLRelationship[]
  ): UIComponentSuggestion[] {
    const mapper = new UIComponentMapper();
    return tables.map(table => mapper.generateTableSuggestion(table, relationships));
  }

  /**
   * Map a database column to appropriate UI component
   */
  static mapColumnToComponent(column: DBMLColumn): {
    component: string;
    pattern?: string;
    props: Record<string, any>;
  } {
    const mapping = FIELD_TYPE_TO_UI_COMPONENT[column.type] || {
      component: 'TextField',
      props: { variant: 'outlined', fullWidth: true }
    };

    // Enhance props based on column constraints
    const enhancedProps = { ...mapping.props };

    if (column.isNotNull) {
      enhancedProps.required = true;
    }

    if (column.isPrimaryKey) {
      enhancedProps.disabled = true;
      enhancedProps.helperText = 'Auto-generated ID';
    }

    if (column.references) {
      return {
        component: 'Select',
        props: {
          ...enhancedProps,
          helperText: `References ${column.references.table}.${column.references.column}`
        }
      };
    }

    return {
      ...mapping,
      props: enhancedProps
    };
  }

  /**
   * Generate form schema from database table
   */
  static generateFormSchema(table: DBMLTable): ComponentSchema {
    const mapper = new UIComponentMapper();
    return mapper.createFormSchema(table);
  }

  /**
   * Generate data display schema from database table
   */
  static generateDisplaySchema(table: DBMLTable): ComponentSchema {
    const mapper = new UIComponentMapper();
    return mapper.createDisplaySchema(table);
  }

  /**
   * Generate list/table schema from database table
   */
  static generateListSchema(table: DBMLTable, relationships: DBMLRelationship[]): ComponentSchema {
    const mapper = new UIComponentMapper();
    return mapper.createListSchema(table, relationships);
  }

  private generateTableSuggestion(
    table: DBMLTable,
    relationships: DBMLRelationship[]
  ): UIComponentSuggestion {
    // Find matching patterns
    const matchingPatterns = TABLE_PATTERNS.filter(pattern => 
      pattern.conditions(table, relationships)
    );

    // Generate base views
    const views = [
      this.generateListView(table, relationships),
      this.generateDetailView(table, relationships),
      this.generateFormView(table, relationships)
    ];

    // Add dashboard view if suitable
    if (this.isDashboardSuitable(table, relationships)) {
      views.push(this.generateDashboardView(table, relationships));
    }

    // Add master-detail view if has relationships
    if (this.hasMasterDetailPotential(table, relationships)) {
      views.push(this.generateMasterDetailView(table, relationships));
    }

    return {
      table: table.name,
      views
    };
  }

  private generateListView(table: DBMLTable, relationships: DBMLRelationship[]) {
    const displayColumns = this.getDisplayColumns(table);
    
    return {
      type: 'list' as const,
      name: `${table.name}List`,
      description: `List view for ${table.name} with filtering and sorting`,
      components: [
        {
          id: `${table.name}_search`,
          type: 'SearchBar',
          props: {
            placeholder: `Search ${table.name.toLowerCase()}...`,
            fullWidth: true
          },
          dataBinding: {
            source: table.name,
            fields: displayColumns.slice(0, 3).map(col => col.name)
          }
        },
        {
          id: `${table.name}_filters`,
          type: 'FilterPanel',
          props: {
            filters: this.generateFilterConfig(table)
          }
        },
        {
          id: `${table.name}_table`,
          type: 'DataTable',
          pattern: 'DataTable',
          props: {
            columns: displayColumns.map(col => ({
              field: col.name,
              headerName: this.formatFieldName(col.name),
              type: this.getTableColumnType(col),
              sortable: true,
              filterable: true
            })),
            pagination: true,
            pageSize: 25,
            showActions: true,
            actions: ['view', 'edit', 'delete']
          },
          dataBinding: {
            source: table.name,
            fields: displayColumns.map(col => col.name),
            relationships: this.getTableRelationships(table.name, relationships)
          }
        }
      ],
      layout: {
        type: 'stack',
        config: {
          spacing: 3,
          direction: 'column'
        }
      }
    };
  }

  private generateDetailView(table: DBMLTable, relationships: DBMLRelationship[]) {
    const allColumns = table.columns;
    
    return {
      type: 'detail' as const,
      name: `${table.name}Detail`,
      description: `Detailed view for ${table.name} record`,
      components: [
        {
          id: `${table.name}_header`,
          type: 'PageHeader',
          pattern: 'PageHeader',
          props: {
            title: `${this.formatFieldName(table.name)} Details`,
            showBreadcrumbs: true,
            actions: [
              { label: 'Edit', action: 'edit', color: 'primary' },
              { label: 'Delete', action: 'delete', color: 'error' }
            ]
          }
        },
        {
          id: `${table.name}_info`,
          type: 'InfoCard',
          pattern: 'DataDisplayCard',
          props: {
            title: 'Basic Information',
            variant: 'outlined',
            fields: allColumns.map(col => ({
              label: this.formatFieldName(col.name),
              field: col.name,
              type: this.getDisplayType(col)
            }))
          },
          dataBinding: {
            source: table.name,
            fields: allColumns.map(col => col.name)
          }
        },
        // Add related data sections if relationships exist
        ...this.generateRelatedDataComponents(table.name, relationships)
      ],
      layout: {
        type: 'stack',
        config: {
          spacing: 3,
          direction: 'column'
        }
      }
    };
  }

  private generateFormView(table: DBMLTable, relationships: DBMLRelationship[]) {
    const editableColumns = table.columns.filter(col => !col.isPrimaryKey);
    
    return {
      type: 'form' as const,
      name: `${table.name}Form`,
      description: `Form for creating/editing ${table.name}`,
      components: [
        {
          id: `${table.name}_form_header`,
          type: 'PageHeader',
          pattern: 'PageHeader',
          props: {
            title: `${this.formatFieldName(table.name)} Form`,
            showBreadcrumbs: true
          }
        },
        {
          id: `${table.name}_form`,
          type: 'FormContainer',
          props: {
            fields: editableColumns.map(col => {
              const componentMapping = UIComponentMapper.mapColumnToComponent(col);
              return {
                name: col.name,
                label: this.formatFieldName(col.name),
                component: componentMapping.component,
                props: componentMapping.props,
                validation: this.getFieldValidation(col)
              };
            }),
            submitButton: {
              label: 'Save',
              color: 'primary'
            },
            cancelButton: {
              label: 'Cancel',
              color: 'secondary'
            }
          },
          dataBinding: {
            source: table.name,
            fields: editableColumns.map(col => col.name)
          }
        }
      ],
      layout: {
        type: 'stack',
        config: {
          spacing: 3,
          direction: 'column'
        }
      }
    };
  }

  private generateDashboardView(table: DBMLTable, relationships: DBMLRelationship[]) {
    const numericColumns = table.columns.filter(col => 
      ['int', 'integer', 'decimal', 'float', 'double'].includes(col.type)
    );

    return {
      type: 'dashboard' as const,
      name: `${table.name}Dashboard`,
      description: `Dashboard overview for ${table.name} analytics`,
      components: [
        {
          id: `${table.name}_stats`,
          type: 'StatsGrid',
          props: {
            stats: [
              { label: `Total ${this.formatFieldName(table.name)}`, field: 'count', type: 'number' },
              ...numericColumns.slice(0, 3).map(col => ({
                label: `Total ${this.formatFieldName(col.name)}`,
                field: col.name,
                type: 'sum'
              }))
            ]
          }
        },
        {
          id: `${table.name}_chart`,
          type: 'LineChart',
          props: {
            title: `${this.formatFieldName(table.name)} Trends`,
            xAxis: 'date',
            yAxis: numericColumns[0]?.name || 'count'
          }
        }
      ],
      layout: {
        type: 'grid',
        config: {
          columns: 12,
          spacing: 3
        }
      }
    };
  }

  private generateMasterDetailView(table: DBMLTable, relationships: DBMLRelationship[]) {
    const relatedTables = this.getRelatedTables(table.name, relationships);
    
    return {
      type: 'master-detail' as const,
      name: `${table.name}MasterDetail`,
      description: `Master-detail view for ${table.name} with related data`,
      components: [
        {
          id: `${table.name}_master`,
          type: 'MasterPanel',
          props: {
            title: this.formatFieldName(table.name),
            searchable: true,
            sortable: true
          }
        },
        {
          id: `${table.name}_detail`,
          type: 'DetailPanel',
          props: {
            tabs: relatedTables.map(relTable => ({
              label: this.formatFieldName(relTable),
              component: 'RelatedDataTable',
              props: {
                source: relTable,
                parentField: this.getRelationshipField(table.name, relTable, relationships)
              }
            }))
          }
        }
      ],
      layout: {
        type: 'grid',
        config: {
          columns: 12,
          spacing: 2,
          areas: [
            { id: `${table.name}_master`, gridColumn: 'span 4' },
            { id: `${table.name}_detail`, gridColumn: 'span 8' }
          ]
        }
      }
    };
  }

  // Helper methods

  private getDisplayColumns(table: DBMLTable): DBMLColumn[] {
    // Prioritize common display fields and non-primary key fields
    const priority = ['name', 'title', 'description', 'email', 'status', 'created_at'];
    
    const sortedColumns = table.columns.sort((a, b) => {
      const aPriority = priority.indexOf(a.name.toLowerCase());
      const bPriority = priority.indexOf(b.name.toLowerCase());
      
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      
      return a.name.localeCompare(b.name);
    });

    // Return top 6 columns for display
    return sortedColumns.slice(0, 6);
  }

  private formatFieldName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private getTableColumnType(column: DBMLColumn): string {
    if (['int', 'integer', 'decimal', 'float', 'double'].includes(column.type)) {
      return 'number';
    }
    if (['date', 'datetime', 'timestamp'].includes(column.type)) {
      return 'date';
    }
    if (['boolean', 'bool'].includes(column.type)) {
      return 'boolean';
    }
    return 'string';
  }

  private getDisplayType(column: DBMLColumn): string {
    if (['date', 'datetime', 'timestamp'].includes(column.type)) {
      return 'date';
    }
    if (['boolean', 'bool'].includes(column.type)) {
      return 'boolean';
    }
    if (column.type === 'email') {
      return 'email';
    }
    if (column.type === 'url') {
      return 'url';
    }
    return 'text';
  }

  private generateFilterConfig(table: DBMLTable) {
    return table.columns
      .filter(col => ['string', 'varchar', 'boolean', 'date'].includes(col.type))
      .slice(0, 4)
      .map(col => ({
        field: col.name,
        label: this.formatFieldName(col.name),
        type: this.getTableColumnType(col)
      }));
  }

  private getFieldValidation(column: DBMLColumn): Record<string, any> {
    const validation: Record<string, any> = {};

    if (column.isNotNull || column.isPrimaryKey) {
      validation.required = true;
    }

    if (column.type.includes('varchar')) {
      const lengthMatch = column.type.match(/\((\d+)\)/);
      if (lengthMatch) {
        validation.maxLength = parseInt(lengthMatch[1]);
      }
    }

    if (column.type === 'email') {
      validation.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    }

    return validation;
  }

  private getTableRelationships(tableName: string, relationships: DBMLRelationship[]): string[] {
    return relationships
      .filter(rel => rel.fromTable === tableName || rel.toTable === tableName)
      .map(rel => rel.fromTable === tableName ? rel.toTable : rel.fromTable);
  }

  private getRelatedTables(tableName: string, relationships: DBMLRelationship[]): string[] {
    return relationships
      .filter(rel => rel.fromTable === tableName || rel.toTable === tableName)
      .map(rel => rel.fromTable === tableName ? rel.toTable : rel.fromTable);
  }

  private getRelationshipField(fromTable: string, toTable: string, relationships: DBMLRelationship[]): string {
    const rel = relationships.find(r => 
      (r.fromTable === fromTable && r.toTable === toTable) ||
      (r.fromTable === toTable && r.toTable === fromTable)
    );
    return rel?.fromColumn || 'id';
  }

  private generateRelatedDataComponents(tableName: string, relationships: DBMLRelationship[]) {
    const relatedTables = this.getRelatedTables(tableName, relationships);
    
    return relatedTables.slice(0, 3).map((relatedTable, index) => ({
      id: `${tableName}_${relatedTable}_section`,
      type: 'RelatedDataSection',
      props: {
        title: `Related ${this.formatFieldName(relatedTable)}`,
        collapsible: true,
        defaultExpanded: index === 0
      },
      dataBinding: {
        source: relatedTable,
        fields: ['id', 'name', 'title'].filter(f => f), // Common fields
        relationships: [tableName]
      }
    }));
  }

  private isDashboardSuitable(table: DBMLTable, relationships: DBMLRelationship[]): boolean {
    const hasNumericFields = table.columns.some(col => 
      ['int', 'integer', 'decimal', 'float', 'double'].includes(col.type)
    );
    const hasDateFields = table.columns.some(col => 
      ['date', 'datetime', 'timestamp'].includes(col.type)
    );
    const hasRelationships = relationships.some(rel => 
      rel.fromTable === table.name || rel.toTable === table.name
    );

    return hasNumericFields || hasDateFields || hasRelationships;
  }

  private hasMasterDetailPotential(table: DBMLTable, relationships: DBMLRelationship[]): boolean {
    return relationships.some(rel => 
      (rel.fromTable === table.name && rel.type === 'one-to-many') ||
      (rel.toTable === table.name && rel.type === 'many-to-one')
    );
  }

  private createFormSchema(table: DBMLTable): ComponentSchema {
    return {
      id: `${table.name}Form`,
      name: `${this.formatFieldName(table.name)} Form`,
      type: 'form',
      category: 'forms',
      description: `Form component for ${table.name}`,
      props: table.columns
        .filter(col => !col.isPrimaryKey)
        .map(col => {
          const componentMapping = UIComponentMapper.mapColumnToComponent(col);
          return {
            name: col.name,
            type: componentMapping.component === 'TextField' ? 'string' : 'object',
            required: col.isNotNull,
            description: `${col.type} field for ${col.name}`
          };
        })
    };
  }

  private createDisplaySchema(table: DBMLTable): ComponentSchema {
    return {
      id: `${table.name}Display`,
      name: `${this.formatFieldName(table.name)} Display`,
      type: 'display',
      category: 'cards',
      description: `Display component for ${table.name}`,
      props: table.columns.map(col => ({
        name: col.name,
        type: 'string',
        required: false,
        description: `Display field for ${col.name}`
      }))
    };
  }

  private createListSchema(table: DBMLTable, relationships: DBMLRelationship[]): ComponentSchema {
    return {
      id: `${table.name}List`,
      name: `${this.formatFieldName(table.name)} List`,
      type: 'display',
      category: 'lists',
      description: `List component for ${table.name}`,
      props: [
        {
          name: 'columns',
          type: 'object',
          required: true,
          description: 'Table columns configuration'
        },
        {
          name: 'data',
          type: 'object',
          required: true,
          description: 'Table data source'
        },
        {
          name: 'pagination',
          type: 'boolean',
          required: false,
          default: true,
          description: 'Enable pagination'
        }
      ]
    };
  }
}