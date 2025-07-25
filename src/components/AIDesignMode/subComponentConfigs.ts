import { PropControl } from '../patterns/PatternPropsPanel';

// Configuration for LabelValuePair sub-components
export const labelValuePairControls: PropControl[] = [
  {
    name: 'label',
    type: 'text',
    label: 'Label',
    defaultValue: 'Label',
    group: 'Content',
  },
  {
    name: 'value',
    type: 'text',
    label: 'Value',
    defaultValue: 'Value',
    group: 'Content',
  },
  {
    name: 'variant',
    type: 'select',
    label: 'Variant',
    defaultValue: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Stacked', value: 'stacked' },
      { label: 'Inline', value: 'inline' },
    ],
    group: 'Appearance',
  },
  {
    name: 'size',
    type: 'select',
    label: 'Size',
    defaultValue: 'medium',
    options: [
      { label: 'Small', value: 'small' },
      { label: 'Medium', value: 'medium' },
      { label: 'Large', value: 'large' },
    ],
    group: 'Appearance',
  },
  {
    name: 'valueColor',
    type: 'select',
    label: 'Value Color',
    defaultValue: 'text.primary',
    options: [
      { label: 'Default', value: 'text.primary' },
      { label: 'Secondary', value: 'text.secondary' },
      { label: 'Primary', value: 'primary.main' },
      { label: 'Success', value: 'success.main' },
      { label: 'Warning', value: 'warning.main' },
      { label: 'Error', value: 'error.main' },
    ],
    group: 'Appearance',
  },
  {
    name: 'helpText',
    type: 'text',
    label: 'Help Text',
    defaultValue: '',
    helperText: 'Additional help text shown below the value',
    group: 'Content',
  },
  {
    name: 'showTrend',
    type: 'boolean',
    label: 'Show Trend',
    defaultValue: false,
    group: 'Features',
  },
  {
    name: 'trend',
    type: 'select',
    label: 'Trend Direction',
    defaultValue: 'up',
    options: [
      { label: 'Up', value: 'up' },
      { label: 'Down', value: 'down' },
      { label: 'Flat', value: 'flat' },
    ],
    group: 'Features',
  },
  {
    name: 'trendValue',
    type: 'text',
    label: 'Trend Value',
    defaultValue: '+5%',
    helperText: 'e.g., +5%, -10%, etc.',
    group: 'Features',
  },
];

// Map of sub-component types to their configurations
export const subComponentConfigs: Record<string, PropControl[]> = {
  LabelValuePair: labelValuePairControls,
  // Add more sub-component configs here as needed
};

// Get configuration for a sub-component type
export function getSubComponentConfig(componentType: string): PropControl[] | null {
  return subComponentConfigs[componentType] || null;
}