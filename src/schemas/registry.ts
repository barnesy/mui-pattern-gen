import React from 'react';
import { ComponentSchema, DataShape, FieldSchema } from './types';

/**
 * Component registry for mapping schema IDs to React components
 */
export const componentRegistry = new Map<string, React.ComponentType<any>>();

/**
 * Register a component with the schema system
 */
export function registerComponent(
  id: string,
  component: React.ComponentType<any>,
  schema?: ComponentSchema
) {
  componentRegistry.set(id, component);

  if (schema) {
    componentSchemas.set(id, schema);
  }
}

/**
 * Register multiple components at once
 */
export function registerComponents(components: Record<string, React.ComponentType<any>>) {
  Object.entries(components).forEach(([id, component]) => {
    registerComponent(id, component);
  });
}

/**
 * Component schema registry
 */
export const componentSchemas = new Map<string, ComponentSchema>();

/**
 * Common data shapes for reuse
 */
export const commonDataShapes: Record<string, DataShape> = {
  // User data shape
  user: {
    type: 'object',
    fields: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', format: 'email', required: true },
      avatar: { type: 'string', format: 'url' },
      role: { type: 'string', enum: ['admin', 'user', 'guest'] },
      createdAt: { type: 'date' },
    },
    required: ['id', 'name', 'email'],
  },

  // Stats/metrics data shape
  stats: {
    type: 'array',
    itemShape: {
      type: 'object',
      fields: {
        label: { type: 'string', required: true },
        value: { type: 'number', required: true },
        unit: { type: 'string' },
        trend: { type: 'string', enum: ['up', 'down', 'flat'] },
        trendValue: { type: 'string' },
        color: { type: 'string' },
      },
      required: ['label', 'value'],
    },
  },

  // Table data shape
  tableData: {
    type: 'object',
    fields: {
      columns: {
        type: 'array',
        required: true,
        itemType: {
          type: 'object',
          properties: {
            key: { type: 'string', required: true },
            label: { type: 'string', required: true },
            type: { type: 'string', enum: ['text', 'number', 'date', 'boolean'] },
            sortable: { type: 'boolean' },
          },
        },
      },
      rows: {
        type: 'array',
        required: true,
        itemType: { type: 'object' },
      },
    },
    required: ['columns', 'rows'],
  },

  // List data shape
  listItems: {
    type: 'array',
    itemShape: {
      type: 'object',
      fields: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        subtitle: { type: 'string' },
        description: { type: 'string' },
        avatar: { type: 'string', format: 'url' },
        icon: { type: 'string' },
        actions: { type: 'array' },
        metadata: { type: 'object' },
      },
      required: ['id', 'title'],
    },
  },

  // Form data shape
  formData: {
    type: 'object',
    fields: {
      fields: {
        type: 'array',
        required: true,
        itemType: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            label: { type: 'string', required: true },
            type: {
              type: 'string',
              enum: ['text', 'number', 'email', 'password', 'select', 'checkbox', 'radio', 'date'],
              required: true,
            },
            required: { type: 'boolean' },
            placeholder: { type: 'string' },
            helperText: { type: 'string' },
            options: { type: 'array' },
            validation: { type: 'object' },
          },
        },
      },
      values: { type: 'object' },
      errors: { type: 'object' },
    },
    required: ['fields'],
  },

  // Navigation data shape
  navigation: {
    type: 'array',
    itemShape: {
      type: 'object',
      fields: {
        id: { type: 'string', required: true },
        label: { type: 'string', required: true },
        path: { type: 'string' },
        icon: { type: 'string' },
        children: { type: 'array' },
        badge: { type: 'string' },
        disabled: { type: 'boolean' },
      },
      required: ['id', 'label'],
    },
  },

  // Timeline/workflow data shape
  timeline: {
    type: 'array',
    itemShape: {
      type: 'object',
      fields: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        description: { type: 'string' },
        timestamp: { type: 'date', required: true },
        status: {
          type: 'string',
          enum: ['completed', 'active', 'pending', 'error'],
          required: true,
        },
        icon: { type: 'string' },
        metadata: { type: 'object' },
      },
      required: ['id', 'title', 'timestamp', 'status'],
    },
  },
};

/**
 * Component schema templates for common patterns
 */
export const componentTemplates: Record<string, Partial<ComponentSchema>> = {
  displayCard: {
    type: 'display',
    props: [
      { name: 'title', type: 'string', required: true },
      { name: 'subtitle', type: 'string' },
      {
        name: 'variant',
        type: 'enum',
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Compact', value: 'compact' },
          { label: 'Detailed', value: 'detailed' },
        ],
      },
      { name: 'elevation', type: 'number', default: 1 },
      { name: 'showActions', type: 'boolean', default: true },
    ],
  },

  dataTable: {
    type: 'display',
    dataShape: commonDataShapes.tableData,
    props: [
      { name: 'title', type: 'string' },
      { name: 'sortable', type: 'boolean', default: true },
      { name: 'paginated', type: 'boolean', default: true },
      { name: 'pageSize', type: 'number', default: 10 },
      { name: 'selectable', type: 'boolean', default: false },
      { name: 'dense', type: 'boolean', default: false },
    ],
  },

  form: {
    type: 'form',
    dataShape: commonDataShapes.formData,
    props: [
      { name: 'title', type: 'string' },
      { name: 'submitLabel', type: 'string', default: 'Submit' },
      { name: 'cancelLabel', type: 'string', default: 'Cancel' },
      {
        name: 'layout',
        type: 'enum',
        options: [
          { label: 'Vertical', value: 'vertical' },
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Grid', value: 'grid' },
        ],
      },
      { name: 'onSubmit', type: 'function' },
      { name: 'onCancel', type: 'function' },
    ],
  },

  navigation: {
    type: 'navigation',
    dataShape: commonDataShapes.navigation,
    props: [
      {
        name: 'variant',
        type: 'enum',
        options: [
          { label: 'Drawer', value: 'drawer' },
          { label: 'Top Bar', value: 'topbar' },
          { label: 'Tabs', value: 'tabs' },
          { label: 'Breadcrumb', value: 'breadcrumb' },
        ],
      },
      { name: 'collapsible', type: 'boolean', default: true },
      { name: 'showIcons', type: 'boolean', default: true },
    ],
  },
};

/**
 * Get a component schema by ID
 */
export function getComponentSchema(id: string): ComponentSchema | undefined {
  return componentSchemas.get(id);
}

/**
 * Get all registered component schemas
 */
export function getAllComponentSchemas(): ComponentSchema[] {
  return Array.from(componentSchemas.values());
}

/**
 * Validate if a component is registered
 */
export function isComponentRegistered(id: string): boolean {
  return componentRegistry.has(id);
}

/**
 * Get suggested component type based on data shape
 */
export function suggestComponentType(data: any): string[] {
  const suggestions: string[] = [];

  // Check if data is an array
  if (Array.isArray(data)) {
    if (data.length > 0) {
      const firstItem = data[0];

      // Check for table-like data
      if (typeof firstItem === 'object' && Object.keys(firstItem).length > 3) {
        suggestions.push('dataTable');
      }

      // Check for timeline data
      if (firstItem.timestamp || firstItem.date || firstItem.status) {
        suggestions.push('timeline');
      }

      // Check for stats data
      if (firstItem.label && firstItem.value) {
        suggestions.push('statsGrid');
      }

      // Generic list
      suggestions.push('list');
    }
  }

  // Check if data is an object
  else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);

    // Check for form-like data
    if (keys.includes('fields') || keys.includes('values')) {
      suggestions.push('form');
    }

    // Check for user data
    if (keys.includes('name') && keys.includes('email')) {
      suggestions.push('userCard');
    }

    // Generic display card
    suggestions.push('displayCard');
  }

  return suggestions;
}

/**
 * Create a component schema from a template
 */
export function createSchemaFromTemplate(
  templateName: string,
  overrides: Partial<ComponentSchema>
): ComponentSchema {
  const template = componentTemplates[templateName];

  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  return {
    id: overrides.id || `${templateName}-${Date.now()}`,
    name: overrides.name || templateName,
    type: template.type || 'display',
    ...template,
    ...overrides,
    props: [...(template.props || []), ...(overrides.props || [])],
  } as ComponentSchema;
}
