import { PropControl } from '../../components/patterns/PatternPropsPanel';

export const emptyStateCardControls: PropControl[] = [
  // Variant control
  {
    name: 'variant',
    type: 'variant',
    label: 'Variant',
    defaultValue: 'empty',
    options: [
      { label: 'Empty', value: 'empty' },
      { label: 'Error', value: 'error' },
      { label: 'No Results', value: 'no-results' },
      { label: 'No Data', value: 'no-data' },
    ],
    group: 'General',
  },

  // Text props
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: '',
    helperText: 'Leave empty to use default title for variant',
    group: 'General',
  },
  {
    name: 'description',
    type: 'text',
    label: 'Description',
    defaultValue: '',
    helperText: 'Leave empty to use default description for variant',
    group: 'General',
  },
  {
    name: 'actionLabel',
    type: 'text',
    label: 'Action Button Label',
    defaultValue: '',
    helperText: 'Leave empty to use default label for variant',
    group: 'General',
  },

  // Component toggles
  {
    name: 'showIcon',
    type: 'boolean',
    label: 'Show Icon',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Content',
    helperText: 'Display icon for empty state',
    group: 'Components',
  },
  {
    name: 'showAction',
    type: 'boolean',
    label: 'Show Action Button',
    defaultValue: true,
    isComponent: true,
    componentGroup: 'Actions',
    helperText: 'Display action button',
    group: 'Components',
  },

  // Appearance
  {
    name: 'elevation',
    type: 'slider',
    label: 'Card Elevation',
    defaultValue: 0,
    min: 0,
    max: 24,
    step: 1,
    helperText: 'Shadow depth of the card',
    group: 'Appearance',
  },
  {
    name: 'iconSize',
    type: 'select',
    label: 'Icon Size',
    defaultValue: 'medium',
    options: [
      { label: 'Small (48px)', value: 'small' },
      { label: 'Medium (64px)', value: 'medium' },
      { label: 'Large (96px)', value: 'large' },
    ],
    group: 'Appearance',
  },

  // Typography controls
  {
    name: 'titleVariant',
    type: 'typography',
    label: 'Title Typography',
    defaultValue: 'h6',
    options: [
      { label: 'H4', value: 'h4' },
      { label: 'H5', value: 'h5' },
      { label: 'H6', value: 'h6' },
      { label: 'Subtitle 1', value: 'subtitle1' },
      { label: 'Subtitle 2', value: 'subtitle2' },
    ],
    helperText: 'Select title typography style',
    group: 'Typography',
  },
  {
    name: 'descriptionVariant',
    type: 'typography',
    label: 'Description Typography',
    defaultValue: 'body2',
    options: [
      { label: 'Body 1', value: 'body1' },
      { label: 'Body 2', value: 'body2' },
      { label: 'Caption', value: 'caption' },
    ],
    helperText: 'Select description typography style',
    group: 'Typography',
  },

  // REQUIRED: Spacing controls
  {
    name: 'padding',
    type: 'padding',
    label: 'Padding',
    defaultValue: { top: 32, right: 24, bottom: 32, left: 24 },
    helperText: 'Internal spacing around content',
    group: 'Layout',
  },
  {
    name: 'margin',
    type: 'margin',
    label: 'Margin',
    defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
    helperText: 'External spacing around card',
    group: 'Layout',
  },
];
