import { PropControl } from '../../components/patterns/PatternPropsPanel';

export const pageHeaderControls: PropControl[] = [
  // Variant control
  {
    name: 'variant',
    type: 'variant',
    label: 'Variant',
    defaultValue: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Minimal', value: 'minimal' },
      { label: 'Transparent', value: 'transparent' },
    ],
    group: 'General',
  },

  // Text props
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Page Title',
    group: 'General',
  },
  {
    name: 'subtitle',
    type: 'text',
    label: 'Subtitle',
    defaultValue: 'This is a page description that provides context about the content below',
    group: 'General',
  },

  // Status
  {
    name: 'status',
    type: 'text',
    label: 'Status Label',
    defaultValue: 'Published',
    helperText: 'Leave empty to hide status chip',
    group: 'Status',
  },
  {
    name: 'statusColor',
    type: 'select',
    label: 'Status Color',
    defaultValue: 'success',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Success', value: 'success' },
      { label: 'Error', value: 'error' },
      { label: 'Warning', value: 'warning' },
      { label: 'Info', value: 'info' },
    ],
    group: 'Status',
  },

  // Features
  {
    name: 'showBreadcrumbs',
    type: 'boolean',
    label: 'Show Breadcrumbs',
    defaultValue: true,
    group: 'Features',
  },

  // Primary Action
  {
    name: 'primaryAction.label',
    type: 'text',
    label: 'Primary Action Label',
    defaultValue: 'Edit Page',
    group: 'Actions',
  },

  // Appearance
  {
    name: 'elevation',
    type: 'slider',
    label: 'Elevation',
    defaultValue: 0,
    min: 0,
    max: 8,
    step: 1,
    helperText: 'Shadow depth (only applies to default variant)',
    group: 'Appearance',
  },
];