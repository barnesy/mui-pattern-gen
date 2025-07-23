import { PropControl } from '../../components/patterns/PatternPropsPanel';

export const loginFormControls: PropControl[] = [
  // General
  {
    name: 'variant',
    type: 'variant',
    label: 'Variant',
    defaultValue: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Minimal', value: 'minimal' },
      { label: 'Social First', value: 'social-first' },
    ],
    group: 'General',
  },
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Welcome back',
    group: 'General',
  },
  {
    name: 'subtitle',
    type: 'text',
    label: 'Subtitle',
    defaultValue: 'Sign in to your account',
    group: 'General',
  },
  {
    name: 'error',
    type: 'text',
    label: 'Error Message',
    defaultValue: '',
    helperText: 'Leave empty to hide error alert',
    group: 'General',
  },
  {
    name: 'loading',
    type: 'boolean',
    label: 'Loading State',
    defaultValue: false,
    group: 'General',
  },

  // Features
  {
    name: 'showSocialLogins',
    type: 'boolean',
    label: 'Show Social Logins',
    defaultValue: true,
    group: 'Features',
  },
  {
    name: 'showRememberMe',
    type: 'boolean',
    label: 'Show Remember Me',
    defaultValue: true,
    group: 'Features',
  },
  {
    name: 'showSignUpLink',
    type: 'boolean',
    label: 'Show Sign Up Link',
    defaultValue: true,
    group: 'Features',
  },
];