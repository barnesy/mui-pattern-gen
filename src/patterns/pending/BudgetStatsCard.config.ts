import { PropControl } from '../../components/patterns/PatternPropsPanel';

export const budgetStatsCardControls: PropControl[] = [
  // Variant control
  {
    name: 'variant',
    type: 'variant',
    label: 'Variant',
    defaultValue: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Minimal', value: 'minimal' },
      { label: 'Detailed', value: 'detailed' }
    ],
    group: 'General',
  },
  
  // Text props
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Monthly Budget',
    group: 'General',
  },
  {
    name: 'currency',
    type: 'text',
    label: 'Currency Symbol',
    defaultValue: '$',
    helperText: 'Currency symbol to display',
    group: 'General',
  },
  {
    name: 'period',
    type: 'text',
    label: 'Comparison Period',
    defaultValue: 'vs last month',
    group: 'General',
  },
  
  // Number props
  {
    name: 'value',
    type: 'number',
    label: 'Current Value',
    defaultValue: 4250,
    group: 'Values',
  },
  {
    name: 'budget',
    type: 'number',
    label: 'Total Budget',
    defaultValue: 5000,
    group: 'Values',
  },
  {
    name: 'spent',
    type: 'number',
    label: 'Amount Spent',
    defaultValue: 3250,
    group: 'Values',
  },
  {
    name: 'remaining',
    type: 'number',
    label: 'Amount Remaining',
    defaultValue: 1750,
    group: 'Values',
  },
  
  // Change tracking
  {
    name: 'change',
    type: 'slider',
    label: 'Change Percentage',
    defaultValue: 12.5,
    min: -100,
    max: 100,
    step: 0.5,
    helperText: 'Percentage change from previous period',
    group: 'Trend',
  },
  {
    name: 'changeType',
    type: 'select',
    label: 'Change Type',
    defaultValue: 'increase',
    options: [
      { label: 'Increase', value: 'increase' },
      { label: 'Decrease', value: 'decrease' },
      { label: 'Neutral', value: 'neutral' }
    ],
    group: 'Trend',
  },
  
  // Boolean props
  {
    name: 'showProgress',
    type: 'boolean',
    label: 'Show Progress Bar',
    defaultValue: true,
    helperText: 'Display budget progress bar',
    group: 'Features',
  },
  {
    name: 'showTrend',
    type: 'boolean',
    label: 'Show Trend',
    defaultValue: true,
    helperText: 'Display trend indicators',
    group: 'Features',
  },
  {
    name: 'showDetails',
    type: 'boolean',
    label: 'Show Details',
    defaultValue: true,
    helperText: 'Show category breakdown in detailed variant',
    group: 'Features',
  },
  
  // Appearance
  {
    name: 'accentColor',
    type: 'select',
    label: 'Accent Color',
    defaultValue: 'primary',
    options: [
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Success', value: 'success' },
      { label: 'Warning', value: 'warning' },
      { label: 'Error', value: 'error' },
      { label: 'Info', value: 'info' }
    ],
    group: 'Appearance',
  },
  {
    name: 'elevation',
    type: 'slider',
    label: 'Card Elevation',
    defaultValue: 1,
    min: 0,
    max: 24,
    step: 1,
    helperText: 'Shadow depth of the card',
    group: 'Appearance',
  },
];