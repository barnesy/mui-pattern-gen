import React, { useEffect, useState } from 'react';
import { ComponentSchema, PropSchema } from '../../schemas/types';
import { componentRegistry } from '../../schemas/registry';

// Import all pending patterns
import { PageHeader } from '../../patterns/pending/PageHeader';
import { pageHeaderControls } from '../../patterns/pending/PageHeader.config';
import { EmptyStateCard } from '../../patterns/pending/EmptyStateCard';
import { emptyStateCardControls } from '../../patterns/pending/EmptyStateCard.config';
import { LabelValuePair } from '../../patterns/pending/LabelValuePair';
import { labelValuePairControls } from '../../patterns/pending/LabelValuePair.config';
import { PureDataDisplayCard } from './PureDataDisplayCard';
import { dataDisplayCardControls } from '../../patterns/pending/DataDisplayCard.config';
import { labelValuePairSchema } from '../../schemas/subComponentSchemas';

// Pattern registry mapping
const patternComponents = {
  PageHeader,
  EmptyStateCard,
  LabelValuePair,
  DataDisplayCard: PureDataDisplayCard, // Use pure version
};

const patternConfigs = {
  PageHeader: pageHeaderControls,
  EmptyStateCard: emptyStateCardControls,
  LabelValuePair: labelValuePairControls,
  DataDisplayCard: dataDisplayCardControls,
};

/**
 * Convert pattern control to schema prop
 */
function controlToProp(control: any): PropSchema {
  let type: PropSchema['type'] = 'string';
  let options: Array<{ label: string; value: any }> | undefined;

  // Map control types to schema prop types
  switch (control.type) {
    case 'text':
      type = 'string';
      break;
    case 'number':
    case 'slider':
      type = 'number';
      break;
    case 'boolean':
      type = 'boolean';
      break;
    case 'select':
    case 'variant':
    case 'typography':
      type = 'enum';
      options = control.options;
      break;
    case 'padding':
    case 'margin':
    case 'spacing':
      type = 'object';
      break;
    default:
      type = 'string';
  }

  return {
    name: control.name,
    type,
    label: control.label || control.name,
    description: control.helperText,
    default: control.defaultValue,
    group: control.group || 'General',
    required: false,
    options,
    metadata: {
      originalType: control.type,
      isComponent: control.isComponent,
      componentGroup: control.componentGroup,
    },
  };
}

/**
 * Create schema from pattern config
 */
function createSchemaFromPattern(
  name: string,
  controls: any[],
  category: string = 'patterns'
): ComponentSchema {
  return {
    id: name,
    name: name.replace(/([A-Z])/g, ' $1').trim(),
    type: 'display',
    category,
    description: `Pattern component: ${name}`,
    props: controls.map(controlToProp),
  };
}

export interface PatternLoaderProps {
  onPatternsLoaded: (schemas: ComponentSchema[]) => void;
}

/**
 * Component that loads patterns and registers them
 */
export const PatternLoader: React.FC<PatternLoaderProps> = ({ onPatternsLoaded }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) {return;}

    const schemas: ComponentSchema[] = [];

    // Register all pattern components
    Object.entries(patternComponents).forEach(([name, component]) => {
      // Register component
      componentRegistry.set(name, component);

      // Create schema from config
      const config = patternConfigs[name as keyof typeof patternConfigs];
      if (config) {
        const schema = createSchemaFromPattern(name, config, 'patterns');
        schemas.push(schema);
      }
    });

    // Add sub-component schemas
    schemas.push(labelValuePairSchema);

    // Register LabelValuePair as both pattern and sub-component
    componentRegistry.set('LabelValuePair', LabelValuePair);

    // Also create schemas for common layout patterns
    const layoutSchemas: ComponentSchema[] = [
      {
        id: 'Container',
        name: 'Container',
        type: 'layout',
        category: 'layout',
        description: 'Responsive container for page content',
        props: [
          {
            name: 'maxWidth',
            type: 'enum',
            label: 'Max Width',
            default: 'lg',
            options: [
              { label: 'Extra Small', value: 'xs' },
              { label: 'Small', value: 'sm' },
              { label: 'Medium', value: 'md' },
              { label: 'Large', value: 'lg' },
              { label: 'Extra Large', value: 'xl' },
              { label: 'None', value: false },
            ],
            group: 'Layout',
          },
          {
            name: 'disableGutters',
            type: 'boolean',
            label: 'Disable Gutters',
            default: false,
            group: 'Layout',
          },
        ],
      },
      {
        id: 'Grid',
        name: 'Grid Container',
        type: 'layout',
        category: 'layout',
        description: 'Grid layout container',
        props: [
          {
            name: 'spacing',
            type: 'number',
            label: 'Spacing',
            default: 2,
            group: 'Layout',
          },
          {
            name: 'direction',
            type: 'enum',
            label: 'Direction',
            default: 'row',
            options: [
              { label: 'Row', value: 'row' },
              { label: 'Column', value: 'column' },
            ],
            group: 'Layout',
          },
        ],
      },
      {
        id: 'Stack',
        name: 'Stack',
        type: 'layout',
        category: 'layout',
        description: 'Stack layout for vertical or horizontal arrangements',
        props: [
          {
            name: 'direction',
            type: 'enum',
            label: 'Direction',
            default: 'column',
            options: [
              { label: 'Row', value: 'row' },
              { label: 'Column', value: 'column' },
            ],
            group: 'Layout',
          },
          {
            name: 'spacing',
            type: 'number',
            label: 'Spacing',
            default: 2,
            group: 'Layout',
          },
          {
            name: 'alignItems',
            type: 'enum',
            label: 'Align Items',
            default: 'stretch',
            options: [
              { label: 'Start', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'flex-end' },
              { label: 'Stretch', value: 'stretch' },
            ],
            group: 'Layout',
          },
        ],
      },
      {
        id: 'Divider',
        name: 'Divider',
        type: 'layout',
        category: 'layout',
        description: 'Visual divider between sections',
        props: [
          {
            name: 'orientation',
            type: 'enum',
            label: 'Orientation',
            default: 'horizontal',
            options: [
              { label: 'Horizontal', value: 'horizontal' },
              { label: 'Vertical', value: 'vertical' },
            ],
            group: 'Appearance',
          },
          {
            name: 'variant',
            type: 'enum',
            label: 'Variant',
            default: 'fullWidth',
            options: [
              { label: 'Full Width', value: 'fullWidth' },
              { label: 'Inset', value: 'inset' },
              { label: 'Middle', value: 'middle' },
            ],
            group: 'Appearance',
          },
        ],
      },
    ];

    schemas.push(...layoutSchemas);

    // Notify parent
    onPatternsLoaded(schemas);
    setLoaded(true);
  }, [loaded, onPatternsLoaded]);

  return null;
};
