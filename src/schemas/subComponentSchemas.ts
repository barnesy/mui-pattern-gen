import { ComponentSchema } from './types';

/**
 * Schema definitions for sub-components used within patterns
 */

export const labelValuePairSchema: ComponentSchema = {
  id: 'LabelValuePair',
  name: 'Label Value Pair',
  type: 'display',
  category: 'subcomponents',
  description: 'Display a label and value with optional trend indicator',
  props: [
    {
      name: 'label',
      type: 'string',
      label: 'Label',
      default: 'Label',
      required: true,
      group: 'General',
    },
    {
      name: 'value',
      type: 'string',
      label: 'Value',
      default: 'Value',
      required: true,
      group: 'General',
    },
    {
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      default: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Inline', value: 'inline' },
        { label: 'Stacked', value: 'stacked' },
        { label: 'Minimal', value: 'minimal' },
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
    {
      name: 'valueColor',
      type: 'enum',
      label: 'Value Color',
      default: 'text.primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
        { label: 'Default', value: 'text.primary' },
        { label: 'Muted', value: 'text.secondary' },
      ],
      group: 'Appearance',
    },
    {
      name: 'helpText',
      type: 'string',
      label: 'Help Text',
      default: '',
      group: 'General',
    },
    {
      name: 'showTrend',
      type: 'boolean',
      label: 'Show Trend',
      default: false,
      group: 'Features',
    },
    {
      name: 'trend',
      type: 'enum',
      label: 'Trend Direction',
      default: 'up',
      options: [
        { label: 'Up', value: 'up' },
        { label: 'Down', value: 'down' },
        { label: 'Flat', value: 'flat' },
      ],
      group: 'Features',
    },
    {
      name: 'trendValue',
      type: 'string',
      label: 'Trend Value',
      default: '',
      group: 'Features',
    },
    {
      name: 'chip',
      type: 'boolean',
      label: 'Display as Chip',
      default: false,
      group: 'Features',
    },
  ],
};

export const subComponentSchemas: ComponentSchema[] = [labelValuePairSchema];

/**
 * Get all sub-component schemas
 */
export function getSubComponentSchemas(): ComponentSchema[] {
  return subComponentSchemas;
}
