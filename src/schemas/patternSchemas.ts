import { ComponentSchema } from './types';

/**
 * Convert existing pattern configurations to component schemas
 */
export function createSchemaFromPatternConfig(
  patternName: string,
  controls: any[]
): ComponentSchema {
  const schema: ComponentSchema = {
    id: patternName,
    name: patternName.replace(/([A-Z])/g, ' $1').trim(),
    type: 'display',
    category: detectCategory(patternName),
    description: `Pattern component: ${patternName}`,
    props: [],
  };

  // Convert pattern controls to schema props
  controls.forEach((control) => {
    let propType: 'string' | 'number' | 'boolean' | 'enum' | 'object' = 'string';
    let options: Array<{ label: string; value: any }> | undefined;

    // Map control types to schema prop types
    switch (control.type) {
      case 'text':
        propType = 'string';
        break;
      case 'number':
      case 'slider':
        propType = 'number';
        break;
      case 'boolean':
        propType = 'boolean';
        break;
      case 'select':
      case 'variant':
      case 'typography':
        propType = 'enum';
        options = control.options;
        break;
      case 'padding':
      case 'margin':
      case 'spacing':
      case 'size':
        propType = 'object';
        break;
    }

    schema.props.push({
      name: control.name,
      type: propType,
      label: control.label || control.name,
      description: control.helperText,
      default: control.defaultValue,
      group: control.group || 'General',
      required: control.required || false,
      options,
      // Store original control type for reference
      metadata: { originalType: control.type },
    });
  });

  return schema;
}

/**
 * Detect category based on pattern name
 */
function detectCategory(patternName: string): string {
  const name = patternName.toLowerCase();

  if (name.includes('login') || name.includes('register') || name.includes('auth')) {
    return 'auth';
  }
  if (name.includes('card') || name.includes('profile')) {
    return 'cards';
  }
  if (name.includes('form') || name.includes('input')) {
    return 'forms';
  }
  if (name.includes('nav') || name.includes('menu') || name.includes('header')) {
    return 'navigation';
  }
  if (name.includes('list') || name.includes('table') || name.includes('grid')) {
    return 'lists';
  }
  if (name.includes('dashboard') || name.includes('chart') || name.includes('stats')) {
    return 'dashboards';
  }

  return 'display';
}

/**
 * Create schemas for common Material-UI components
 */
export const muiComponentSchemas: ComponentSchema[] = [
  {
    id: 'MuiButton',
    name: 'Button',
    type: 'display',
    category: 'forms',
    description: 'Material-UI Button component',
    props: [
      { name: 'label', type: 'string', label: 'Label', default: 'Button', group: 'General' },
      {
        name: 'variant',
        type: 'enum',
        label: 'Variant',
        default: 'contained',
        options: [
          { label: 'Contained', value: 'contained' },
          { label: 'Outlined', value: 'outlined' },
          { label: 'Text', value: 'text' },
        ],
        group: 'Appearance',
      },
      {
        name: 'color',
        type: 'enum',
        label: 'Color',
        default: 'primary',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Success', value: 'success' },
          { label: 'Error', value: 'error' },
          { label: 'Warning', value: 'warning' },
          { label: 'Info', value: 'info' },
        ],
        group: 'Appearance',
      },
      {
        name: 'size',
        type: 'enum',
        label: 'Size',
        default: 'medium',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ],
        group: 'Appearance',
      },
      { name: 'disabled', type: 'boolean', label: 'Disabled', default: false, group: 'State' },
      { name: 'fullWidth', type: 'boolean', label: 'Full Width', default: false, group: 'Layout' },
    ],
  },
  {
    id: 'MuiCard',
    name: 'Card',
    type: 'display',
    category: 'cards',
    description: 'Material-UI Card component',
    props: [
      { name: 'title', type: 'string', label: 'Title', default: 'Card Title', group: 'Content' },
      { name: 'subtitle', type: 'string', label: 'Subtitle', default: '', group: 'Content' },
      {
        name: 'content',
        type: 'string',
        label: 'Content',
        default: 'Card content goes here',
        group: 'Content',
      },
      { name: 'elevation', type: 'number', label: 'Elevation', default: 1, group: 'Appearance' },
      {
        name: 'showActions',
        type: 'boolean',
        label: 'Show Actions',
        default: true,
        group: 'Features',
      },
      {
        name: 'showMedia',
        type: 'boolean',
        label: 'Show Media',
        default: false,
        group: 'Features',
      },
      { name: 'mediaUrl', type: 'string', label: 'Media URL', default: '', group: 'Content' },
      { name: 'mediaHeight', type: 'number', label: 'Media Height', default: 140, group: 'Layout' },
    ],
  },
  {
    id: 'MuiTextField',
    name: 'Text Field',
    type: 'form',
    category: 'forms',
    description: 'Material-UI TextField component',
    props: [
      { name: 'label', type: 'string', label: 'Label', default: 'Text Field', group: 'General' },
      { name: 'placeholder', type: 'string', label: 'Placeholder', default: '', group: 'General' },
      { name: 'helperText', type: 'string', label: 'Helper Text', default: '', group: 'General' },
      {
        name: 'defaultValue',
        type: 'string',
        label: 'Default Value',
        default: '',
        group: 'General',
      },
      {
        name: 'variant',
        type: 'enum',
        label: 'Variant',
        default: 'outlined',
        options: [
          { label: 'Outlined', value: 'outlined' },
          { label: 'Filled', value: 'filled' },
          { label: 'Standard', value: 'standard' },
        ],
        group: 'Appearance',
      },
      {
        name: 'size',
        type: 'enum',
        label: 'Size',
        default: 'medium',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
        ],
        group: 'Appearance',
      },
      { name: 'required', type: 'boolean', label: 'Required', default: false, group: 'Validation' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', default: false, group: 'State' },
      { name: 'fullWidth', type: 'boolean', label: 'Full Width', default: true, group: 'Layout' },
      { name: 'multiline', type: 'boolean', label: 'Multiline', default: false, group: 'Features' },
      { name: 'rows', type: 'number', label: 'Rows', default: 4, group: 'Layout' },
    ],
  },
  {
    id: 'MuiAlert',
    name: 'Alert',
    type: 'display',
    category: 'utility',
    description: 'Material-UI Alert component',
    props: [
      {
        name: 'message',
        type: 'string',
        label: 'Message',
        default: 'This is an alert message',
        group: 'Content',
      },
      { name: 'title', type: 'string', label: 'Title', default: '', group: 'Content' },
      {
        name: 'severity',
        type: 'enum',
        label: 'Severity',
        default: 'info',
        options: [
          { label: 'Success', value: 'success' },
          { label: 'Info', value: 'info' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
        group: 'Appearance',
      },
      {
        name: 'variant',
        type: 'enum',
        label: 'Variant',
        default: 'standard',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Outlined', value: 'outlined' },
          { label: 'Filled', value: 'filled' },
        ],
        group: 'Appearance',
      },
      { name: 'closable', type: 'boolean', label: 'Closable', default: false, group: 'Features' },
    ],
  },
];

/**
 * Create schemas for all accepted patterns
 */
export function createSchemasForAcceptedPatterns(
  acceptedPatterns: Record<string, string[]>
): ComponentSchema[] {
  const schemas: ComponentSchema[] = [];

  Object.entries(acceptedPatterns).forEach(([category, patterns]) => {
    patterns.forEach((patternName) => {
      // Try to load the pattern config if it exists
      try {
        // This is a placeholder - in real implementation you'd load the actual config
        const schema: ComponentSchema = {
          id: patternName,
          name: patternName.replace(/([A-Z])/g, ' $1').trim(),
          type: 'display',
          category,
          description: `${category} pattern component`,
          props: [
            {
              name: 'variant',
              type: 'string',
              label: 'Variant',
              default: 'default',
              group: 'General',
            },
          ],
        };
        schemas.push(schema);
      } catch (error) {
        console.warn(`Could not create schema for pattern: ${patternName}`, error);
      }
    });
  });

  return schemas;
}
