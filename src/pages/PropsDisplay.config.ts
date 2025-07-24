import { PropControl } from '../components/patterns/PatternPropsPanel';

export const propsDisplayControls: PropControl[] = [
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Props Display Test',
    group: 'General',
  },
  {
    name: 'subtitle',
    type: 'text',
    label: 'Subtitle',
    defaultValue: 'This component shows its current props',
    group: 'General',
  },
  {
    name: 'variant',
    type: 'select',
    label: 'Variant',
    defaultValue: 'debug',
    options: [
      { label: 'Debug', value: 'debug' },
      { label: 'Info', value: 'info' },
      { label: 'Warning', value: 'warning' },
    ],
    group: 'General',
  },
];