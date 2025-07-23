import { PropControl } from '../../components/patterns/PatternPropsPanel';

export const userProfileCardControls: PropControl[] = [
  // Variant control
  {
    name: 'variant',
    type: 'variant',
    label: 'Variant',
    defaultValue: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Compact', value: 'compact' },
      { label: 'Detailed', value: 'detailed' }
    ],
    group: 'General',
  },
  
  // Text props
  {
    name: 'name',
    type: 'text',
    label: 'Name',
    defaultValue: 'John Doe',
    group: 'General',
  },
  {
    name: 'role',
    type: 'text',
    label: 'Role',
    defaultValue: 'Senior Developer',
    group: 'General',
  },
  {
    name: 'bio',
    type: 'text',
    label: 'Bio',
    defaultValue: 'Passionate about creating beautiful and functional user interfaces. Love working with React and modern web technologies.',
    helperText: 'Only shown in detailed variant',
    group: 'General',
  },
  {
    name: 'avatarUrl',
    type: 'text',
    label: 'Avatar URL',
    defaultValue: '',
    helperText: 'Leave empty to use initials',
    group: 'General',
  },
  {
    name: 'location',
    type: 'text',
    label: 'Location',
    defaultValue: 'San Francisco, CA',
    group: 'Contact',
  },
  {
    name: 'email',
    type: 'text',
    label: 'Email',
    defaultValue: 'john.doe@example.com',
    group: 'Contact',
  },
  
  // Boolean props
  {
    name: 'showEmail',
    type: 'boolean',
    label: 'Show Email',
    defaultValue: true,
    group: 'Features',
  },
  {
    name: 'showLocation',
    type: 'boolean',
    label: 'Show Location',
    defaultValue: true,
    group: 'Features',
  },
  {
    name: 'showSkills',
    type: 'boolean',
    label: 'Show Skills',
    defaultValue: true,
    helperText: 'Not shown in compact variant',
    group: 'Features',
  },
  
  // Slider props
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