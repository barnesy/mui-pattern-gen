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

  // Text props (marked as content)
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Page Title',
    group: 'General',
    isContent: true,
  },
  {
    name: 'subtitle',
    type: 'text',
    label: 'Subtitle',
    defaultValue: 'This is a page description that provides context about the content below',
    group: 'General',
    isContent: true,
  },

  // Status
  {
    name: 'status',
    type: 'text',
    label: 'Status Label',
    defaultValue: 'Published',
    helperText: 'Leave empty to hide status chip',
    isContent: true,
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

  // Typography controls
  {
    name: 'titleVariant',
    type: 'typography',
    label: 'Title Typography',
    defaultValue: 'h4',
    options: [
      { label: 'H1', value: 'h1' },
      { label: 'H2', value: 'h2' },
      { label: 'H3', value: 'h3' },
      { label: 'H4', value: 'h4' },
      { label: 'H5', value: 'h5' },
      { label: 'H6', value: 'h6' },
    ],
    helperText: 'Select title typography style',
    group: 'Typography',
  },
  {
    name: 'subtitleVariant',
    type: 'typography',
    label: 'Subtitle Typography',
    defaultValue: 'body1',
    options: [
      { label: 'Subtitle 1', value: 'subtitle1' },
      { label: 'Subtitle 2', value: 'subtitle2' },
      { label: 'Body 1', value: 'body1' },
      { label: 'Body 2', value: 'body2' },
      { label: 'Caption', value: 'caption' },
    ],
    helperText: 'Select subtitle typography style',
    group: 'Typography',
  },

  // Spacing controls (at the top of settings)
  {
    name: 'padding',
    type: 'padding',
    label: 'Padding',
    defaultValue: { top: 24, right: 32, bottom: 24, left: 32 },
    helperText: 'Internal spacing of the header',
    group: 'Layout',
  },
  {
    name: 'margin',
    type: 'margin',
    label: 'Margin',
    defaultValue: { top: 0, right: 0, bottom: 24, left: 0 },
    helperText: 'External spacing around the header',
    group: 'Layout',
  },

  // Component toggles
  {
    name: 'showBreadcrumbs',
    type: 'boolean',
    label: 'Show Breadcrumbs',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Navigation',
    helperText: 'Toggle breadcrumb navigation',
    group: 'Components',
  },
  {
    name: 'showSubtitle',
    type: 'boolean',
    label: 'Show Subtitle',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Content',
    helperText: 'Toggle subtitle/description display',
    group: 'Components',
  },
  {
    name: 'showStatus',
    type: 'boolean',
    label: 'Show Status',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Content',
    helperText: 'Toggle status chip display',
    group: 'Components',
  },
  {
    name: 'showMetadata',
    type: 'boolean',
    label: 'Show Metadata',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Content',
    helperText: 'Toggle metadata section',
    group: 'Components',
  },
  {
    name: 'showActions',
    type: 'boolean',
    label: 'Show Actions',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Actions',
    helperText: 'Toggle action buttons',
    group: 'Components',
  },

  // Primary Action
  {
    name: 'primaryAction.label',
    type: 'text',
    label: 'Primary Action Label',
    defaultValue: 'Edit Page',
    group: 'Actions',
    isContent: true,
  },
];