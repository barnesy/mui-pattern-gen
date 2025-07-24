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

  // Text props (marked as content)
  {
    name: 'label',
    type: 'text',
    label: 'Label',
    defaultValue: 'Revenue',
    group: 'General',
    isContent: true,
  },
  {
    name: 'value',
    type: 'text',
    label: 'Value',
    defaultValue: '$125,430',
    group: 'General',
    isContent: true,
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

  // Typography controls
  {
    name: 'labelVariant',
    type: 'typography',
    label: 'Label Typography',
    defaultValue: 'body2',
    options: [
      { label: 'Caption', value: 'caption' },
      { label: 'Body 2', value: 'body2' },
      { label: 'Body 1', value: 'body1' },
      { label: 'Subtitle 2', value: 'subtitle2' },
      { label: 'Subtitle 1', value: 'subtitle1' },
    ],
    helperText: 'Select label typography style',
    group: 'Typography',
  },
  {
    name: 'valueVariant',
    type: 'typography',
    label: 'Value Typography',
    defaultValue: 'body1',
    options: [
      { label: 'Body 2', value: 'body2' },
      { label: 'Body 1', value: 'body1' },
      { label: 'Subtitle 2', value: 'subtitle2' },
      { label: 'Subtitle 1', value: 'subtitle1' },
      { label: 'H6', value: 'h6' },
      { label: 'H5', value: 'h5' },
    ],
    helperText: 'Select value typography style',
    group: 'Typography',
  },

  // Spacing controls (at the top of settings)
  {
    name: 'padding',
    type: 'padding',
    label: 'Padding',
    defaultValue: { top: 8, right: 8, bottom: 8, left: 8 },
    helperText: 'Internal spacing',
    group: 'Layout',
  },
  {
    name: 'margin',
    type: 'margin',
    label: 'Margin',
    defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
    helperText: 'External spacing',
    group: 'Layout',
  },

  // Component toggles
  {
    name: 'showLabel',
    type: 'boolean',
    label: 'Show Label',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Display',
    helperText: 'Toggle label visibility',
    group: 'Components',
  },
  {
    name: 'showValue',
    type: 'boolean',
    label: 'Show Value',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Display',
    helperText: 'Toggle value visibility',
    group: 'Components',
  },
  {
    name: 'showTrend',
    type: 'boolean',
    label: 'Show Trend',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Display',
    helperText: 'Toggle trend indicator visibility',
    group: 'Components',
  },
  {
    name: 'showHelpIcon',
    type: 'boolean',
    label: 'Show Help Icon',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Display',
    helperText: 'Toggle help icon visibility',
    group: 'Components',
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
    isContent: true,
  },

  // Additional
  {
    name: 'helpText',
    type: 'text',
    label: 'Help Text',
    defaultValue: 'Total revenue for the current quarter',
    helperText: 'Tooltip shown on hover',
    group: 'Additional',
    isContent: true,
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