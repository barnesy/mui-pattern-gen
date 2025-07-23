import { PropControl } from '../../components/patterns/PatternPropsPanel';

export const labelValuePairControls: PropControl[] = [
  // Variant control
  {
    name: 'variant',
    type: 'variant',
    label: 'Variant',
    defaultValue: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Inline', value: 'inline' },
      { label: 'Stacked', value: 'stacked' },
      { label: 'Minimal', value: 'minimal' },
    ],
    group: 'General',
  },

  // Text props
  {
    name: 'label',
    type: 'text',
    label: 'Label',
    defaultValue: 'Revenue',
    group: 'General',
  },
  {
    name: 'value',
    type: 'text',
    label: 'Value',
    defaultValue: '$125,430',
    group: 'General',
  },

  // Size
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

  // Colors
  {
    name: 'labelColor',
    type: 'select',
    label: 'Label Color',
    defaultValue: 'text.secondary',
    options: [
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Text Primary', value: 'text.primary' },
      { label: 'Text Secondary', value: 'text.secondary' },
      { label: 'Text Disabled', value: 'text.disabled' },
    ],
    group: 'Appearance',
  },
  {
    name: 'valueColor',
    type: 'select',
    label: 'Value Color',
    defaultValue: 'text.primary',
    options: [
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Success', value: 'success' },
      { label: 'Error', value: 'error' },
      { label: 'Warning', value: 'warning' },
      { label: 'Info', value: 'info' },
      { label: 'Text Primary', value: 'text.primary' },
      { label: 'Text Secondary', value: 'text.secondary' },
    ],
    group: 'Appearance',
  },

  // Value weight
  {
    name: 'valueWeight',
    type: 'select',
    label: 'Value Weight',
    defaultValue: 'medium',
    options: [
      { label: 'Normal', value: 'normal' },
      { label: 'Medium', value: 'medium' },
      { label: 'Bold', value: 'bold' },
    ],
    group: 'Appearance',
  },

  // Alignment
  {
    name: 'align',
    type: 'select',
    label: 'Alignment',
    defaultValue: 'left',
    options: [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ],
    group: 'Layout',
  },

  // Features
  {
    name: 'chip',
    type: 'boolean',
    label: 'Display as Chip',
    defaultValue: false,
    group: 'Features',
  },
  {
    name: 'loading',
    type: 'boolean',
    label: 'Loading State',
    defaultValue: false,
    group: 'Features',
  },

  // Chip color
  {
    name: 'chipColor',
    type: 'select',
    label: 'Chip Color',
    defaultValue: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Success', value: 'success' },
      { label: 'Error', value: 'error' },
      { label: 'Warning', value: 'warning' },
      { label: 'Info', value: 'info' },
    ],
    group: 'Features',
  },

  // Trend
  {
    name: 'trend',
    type: 'select',
    label: 'Trend Direction',
    defaultValue: '',
    options: [
      { label: 'None', value: '' },
      { label: 'Up', value: 'up' },
      { label: 'Down', value: 'down' },
      { label: 'Flat', value: 'flat' },
    ],
    group: 'Trend',
  },
  {
    name: 'trendValue',
    type: 'text',
    label: 'Trend Value',
    defaultValue: '+12.5%',
    helperText: 'Shows when trend is set',
    group: 'Trend',
  },

  // Additional
  {
    name: 'helpText',
    type: 'text',
    label: 'Help Text',
    defaultValue: 'Total revenue for the current quarter',
    helperText: 'Tooltip shown on hover',
    group: 'Additional',
  },

  // Spacing
  {
    name: 'spacing',
    type: 'slider',
    label: 'Spacing',
    defaultValue: 0.5,
    min: 0,
    max: 3,
    step: 0.5,
    helperText: 'Space between label and value',
    group: 'Layout',
  },
];