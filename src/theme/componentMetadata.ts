// Component metadata for AI Design Mode
export interface ComponentMetadata {
  name: string;
  description: string;
  props: {
    [key: string]: {
      type: string;
      description: string;
      default?: any;
      options?: string[];
    };
  };
  commonVariants?: string[];
  commonSizes?: string[];
  commonColors?: string[];
}

export const componentMetadata: Record<string, ComponentMetadata> = {
  Button: {
    name: 'Button',
    description: 'Buttons allow users to take actions and make choices with a single tap.',
    props: {
      variant: {
        type: 'string',
        description: 'The variant to use',
        default: 'text',
        options: ['text', 'outlined', 'contained'],
      },
      size: {
        type: 'string',
        description: 'The size of the button',
        default: 'medium',
        options: ['small', 'medium', 'large'],
      },
      color: {
        type: 'string',
        description: 'The color of the button',
        default: 'primary',
        options: ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'],
      },
      disabled: {
        type: 'boolean',
        description: 'If true, the button is disabled',
        default: false,
      },
      fullWidth: {
        type: 'boolean',
        description: 'If true, the button will take up the full width of its container',
        default: false,
      },
    },
    commonVariants: ['contained', 'outlined', 'text'],
    commonSizes: ['small', 'medium', 'large'],
    commonColors: ['primary', 'secondary', 'error'],
  },
  TextField: {
    name: 'TextField',
    description: 'Text fields let users enter and edit text.',
    props: {
      variant: {
        type: 'string',
        description: 'The variant to use',
        default: 'outlined',
        options: ['outlined', 'filled', 'standard'],
      },
      size: {
        type: 'string',
        description: 'The size of the text field',
        default: 'medium',
        options: ['small', 'medium'],
      },
      label: {
        type: 'string',
        description: 'The label content',
      },
      placeholder: {
        type: 'string',
        description: 'The short hint displayed in the input',
      },
      disabled: {
        type: 'boolean',
        description: 'If true, the input is disabled',
        default: false,
      },
      error: {
        type: 'boolean',
        description: 'If true, the input will indicate an error',
        default: false,
      },
      helperText: {
        type: 'string',
        description: 'The helper text content',
      },
      fullWidth: {
        type: 'boolean',
        description: 'If true, the input will take up the full width',
        default: false,
      },
    },
    commonVariants: ['outlined', 'filled', 'standard'],
    commonSizes: ['small', 'medium'],
  },
  Card: {
    name: 'Card',
    description: 'Cards contain content and actions about a single subject.',
    props: {
      elevation: {
        type: 'number',
        description: 'Shadow depth',
        default: 1,
      },
      variant: {
        type: 'string',
        description: 'The variant to use',
        default: 'elevation',
        options: ['elevation', 'outlined'],
      },
    },
  },
  Chip: {
    name: 'Chip',
    description: 'Chips are compact elements that represent an input, attribute, or action.',
    props: {
      variant: {
        type: 'string',
        description: 'The variant to use',
        default: 'filled',
        options: ['filled', 'outlined'],
      },
      size: {
        type: 'string',
        description: 'The size of the chip',
        default: 'medium',
        options: ['small', 'medium'],
      },
      color: {
        type: 'string',
        description: 'The color of the chip',
        default: 'default',
        options: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'],
      },
      clickable: {
        type: 'boolean',
        description: 'If true, the chip will appear clickable',
        default: false,
      },
      onDelete: {
        type: 'function',
        description: 'Callback fired when the delete icon is clicked',
      },
    },
    commonVariants: ['filled', 'outlined'],
    commonSizes: ['small', 'medium'],
    commonColors: ['primary', 'secondary', 'default'],
  },
  Alert: {
    name: 'Alert',
    description:
      "An alert displays a short, important message in a way that attracts the user's attention without interrupting the user's task.",
    props: {
      severity: {
        type: 'string',
        description: 'The severity of the alert',
        default: 'success',
        options: ['error', 'warning', 'info', 'success'],
      },
      variant: {
        type: 'string',
        description: 'The variant to use',
        default: 'standard',
        options: ['standard', 'filled', 'outlined'],
      },
      onClose: {
        type: 'function',
        description: 'Callback fired when the component requests to be closed',
      },
    },
  },
  Avatar: {
    name: 'Avatar',
    description:
      'Avatars are found throughout material design with uses in everything from tables to dialog menus.',
    props: {
      variant: {
        type: 'string',
        description: 'The shape of the avatar',
        default: 'circular',
        options: ['circular', 'rounded', 'square'],
      },
      sizes: {
        type: 'object',
        description: 'The size of the avatar (width and height in pixels)',
      },
      src: {
        type: 'string',
        description: 'The src attribute for the img element',
      },
      alt: {
        type: 'string',
        description: 'Used in combination with src to provide alt text',
      },
    },
  },
  Typography: {
    name: 'Typography',
    description:
      'Use typography to present your design and content as clearly and efficiently as possible.',
    props: {
      variant: {
        type: 'string',
        description: 'Applies the theme typography styles',
        default: 'body1',
        options: [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'subtitle1',
          'subtitle2',
          'body1',
          'body2',
          'button',
          'caption',
          'overline',
        ],
      },
      color: {
        type: 'string',
        description: 'The color of the component',
        default: 'initial',
        options: [
          'initial',
          'inherit',
          'primary',
          'secondary',
          'textPrimary',
          'textSecondary',
          'error',
        ],
      },
      align: {
        type: 'string',
        description: 'Set the text-align on the component',
        default: 'inherit',
        options: ['inherit', 'left', 'center', 'right', 'justify'],
      },
      gutterBottom: {
        type: 'boolean',
        description: 'If true, the text will have a bottom margin',
        default: false,
      },
      noWrap: {
        type: 'boolean',
        description: 'If true, the text will not wrap',
        default: false,
      },
    },
  },
  Paper: {
    name: 'Paper',
    description:
      'In Material Design, the physical properties of paper are translated to the screen.',
    props: {
      elevation: {
        type: 'number',
        description: 'Shadow depth, corresponds to dp in the spec',
        default: 1,
      },
      variant: {
        type: 'string',
        description: 'The variant to use',
        default: 'elevation',
        options: ['elevation', 'outlined'],
      },
      square: {
        type: 'boolean',
        description: 'If true, rounded corners are disabled',
        default: false,
      },
    },
  },
  // Add more components as needed
};

// Helper function to get metadata for a component
export const getComponentMetadata = (componentName: string): ComponentMetadata | undefined => {
  return componentMetadata[componentName];
};
