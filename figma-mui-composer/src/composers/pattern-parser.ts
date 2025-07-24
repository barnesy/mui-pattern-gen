// Remove Node.js dependency that doesn't work in browser
// import { PatternInfo } from '../utils/pattern-analyzer';

export interface FigmaPatternDefinition {
  name: string;
  type: 'frame';
  layout?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  children: FigmaElement[];
}

export interface FigmaElement {
  type: string;
  props?: Record<string, any>;
  content?: string;
  children?: FigmaElement[];
}

// Pattern templates based on common MUI patterns
const patternTemplates: Record<string, FigmaPatternDefinition> = {
  UserProfileCard: {
    name: 'UserProfileCard',
    type: 'frame',
    layout: 'vertical',
    padding: 0,
    spacing: 0,
    children: [
      {
        type: 'mui:Card',
        props: { variant: 'outlined' },
        children: [
          {
            type: 'frame',
            props: { layout: 'vertical', padding: 16, spacing: 16 },
            children: [
              {
                type: 'frame',
                props: { layout: 'horizontal', spacing: 16, alignItems: 'center' },
                children: [
                  {
                    type: 'mui:Avatar',
                    props: { size: 'large', variant: 'circular' }
                  },
                  {
                    type: 'frame',
                    props: { layout: 'vertical', spacing: 4 },
                    children: [
                      {
                        type: 'mui:Typography',
                        props: { variant: 'h6' },
                        content: '{name}'
                      },
                      {
                        type: 'mui:Typography',
                        props: { variant: 'body2', color: 'text.secondary' },
                        content: '{role}'
                      }
                    ]
                  }
                ]
              },
              {
                type: 'mui:Divider',
                props: { variant: 'fullWidth' }
              },
              {
                type: 'frame',
                props: { layout: 'horizontal', spacing: 8 },
                children: [
                  {
                    type: 'mui:Button',
                    props: { variant: 'contained', color: 'primary', size: 'small' },
                    content: 'Follow'
                  },
                  {
                    type: 'mui:Button',
                    props: { variant: 'outlined', color: 'primary', size: 'small' },
                    content: 'Message'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  
  LoginForm: {
    name: 'LoginForm',
    type: 'frame',
    layout: 'vertical',
    padding: 0,
    spacing: 0,
    children: [
      {
        type: 'mui:Paper',
        props: { elevation: 3 },
        children: [
          {
            type: 'frame',
            props: { layout: 'vertical', padding: 32, spacing: 24 },
            children: [
              {
                type: 'mui:Typography',
                props: { variant: 'h4', align: 'center' },
                content: 'Sign In'
              },
              {
                type: 'frame',
                props: { layout: 'vertical', spacing: 16 },
                children: [
                  {
                    type: 'mui:TextField',
                    props: {
                      variant: 'outlined',
                      fullWidth: true,
                      label: 'Email',
                      type: 'email'
                    }
                  },
                  {
                    type: 'mui:TextField',
                    props: {
                      variant: 'outlined',
                      fullWidth: true,
                      label: 'Password',
                      type: 'password'
                    }
                  }
                ]
              },
              {
                type: 'mui:Button',
                props: {
                  variant: 'contained',
                  color: 'primary',
                  size: 'large',
                  fullWidth: true
                },
                content: 'Sign In'
              },
              {
                type: 'frame',
                props: { layout: 'horizontal', spacing: 8, justifyContent: 'center' },
                children: [
                  {
                    type: 'mui:Typography',
                    props: { variant: 'body2', color: 'text.secondary' },
                    content: "Don't have an account?"
                  },
                  {
                    type: 'mui:Button',
                    props: { variant: 'text', size: 'small' },
                    content: 'Sign Up'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  
  ContactForm: {
    name: 'ContactForm',
    type: 'frame',
    layout: 'vertical',
    padding: 0,
    spacing: 0,
    children: [
      {
        type: 'mui:Card',
        props: { variant: 'elevation' },
        children: [
          {
            type: 'frame',
            props: { layout: 'vertical', padding: 24, spacing: 24 },
            children: [
              {
                type: 'mui:Typography',
                props: { variant: 'h5' },
                content: 'Contact Us'
              },
              {
                type: 'frame',
                props: { layout: 'vertical', spacing: 16 },
                children: [
                  {
                    type: 'frame',
                    props: { layout: 'horizontal', spacing: 16 },
                    children: [
                      {
                        type: 'mui:TextField',
                        props: {
                          variant: 'outlined',
                          label: 'First Name',
                          fullWidth: true
                        }
                      },
                      {
                        type: 'mui:TextField',
                        props: {
                          variant: 'outlined',
                          label: 'Last Name',
                          fullWidth: true
                        }
                      }
                    ]
                  },
                  {
                    type: 'mui:TextField',
                    props: {
                      variant: 'outlined',
                      label: 'Email',
                      type: 'email',
                      fullWidth: true
                    }
                  },
                  {
                    type: 'mui:TextField',
                    props: {
                      variant: 'outlined',
                      label: 'Message',
                      multiline: true,
                      rows: 4,
                      fullWidth: true
                    }
                  }
                ]
              },
              {
                type: 'frame',
                props: { layout: 'horizontal', justifyContent: 'flex-end' },
                children: [
                  {
                    type: 'mui:Button',
                    props: {
                      variant: 'contained',
                      color: 'primary',
                      size: 'large'
                    },
                    content: 'Send Message'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

// Parse pattern info and generate Figma definition
export function parsePatternToFigma(patternInfo: any): FigmaPatternDefinition {
  // Check if we have a template for this pattern
  const template = patternTemplates[patternInfo.name];
  if (template) {
    return template;
  }
  
  // Otherwise, generate a basic structure based on MUI components used
  return generatePatternStructure(patternInfo);
}

// Generate pattern structure from component analysis
function generatePatternStructure(patternInfo: any): FigmaPatternDefinition {
  const children: FigmaElement[] = [];
  
  // Analyze MUI components and create a reasonable structure
  const hasCard = patternInfo.muiComponents.includes('Card');
  const hasPaper = patternInfo.muiComponents.includes('Paper');
  const hasTypography = patternInfo.muiComponents.includes('Typography');
  const hasButton = patternInfo.muiComponents.includes('Button');
  const hasTextField = patternInfo.muiComponents.includes('TextField');
  
  // Determine container
  let container: FigmaElement | null = null;
  
  if (hasCard) {
    container = {
      type: 'mui:Card',
      props: { variant: 'outlined' },
      children: []
    };
  } else if (hasPaper) {
    container = {
      type: 'mui:Paper',
      props: { elevation: 1 },
      children: []
    };
  }
  
  // Create content frame
  const contentFrame: FigmaElement = {
    type: 'frame',
    props: {
      layout: 'vertical',
      padding: 16,
      spacing: 16
    },
    children: []
  };
  
  // Add components based on what's used
  if (hasTypography) {
    contentFrame.children!.push({
      type: 'mui:Typography',
      props: { variant: 'h6' },
      content: patternInfo.name
    });
  }
  
  if (hasTextField) {
    contentFrame.children!.push({
      type: 'mui:TextField',
      props: {
        variant: 'outlined',
        fullWidth: true,
        label: 'Input Field'
      }
    });
  }
  
  if (hasButton) {
    contentFrame.children!.push({
      type: 'mui:Button',
      props: {
        variant: 'contained',
        color: 'primary'
      },
      content: 'Action'
    });
  }
  
  // Add other components
  patternInfo.muiComponents.forEach((component: string) => {
    if (!['Card', 'Paper', 'Typography', 'Button', 'TextField'].includes(component)) {
      contentFrame.children!.push({
        type: `mui:${component}`,
        props: {}
      });
    }
  });
  
  // Build final structure
  if (container) {
    container.children!.push(contentFrame);
    children.push(container);
  } else {
    children.push(contentFrame);
  }
  
  return {
    name: patternInfo.name,
    type: 'frame',
    layout: 'vertical',
    padding: 0,
    spacing: 0,
    children
  };
}

// Get all available pattern definitions
export function getAllPatternDefinitions(): FigmaPatternDefinition[] {
  return Object.values(patternTemplates);
}

// Add custom pattern definition
export function addPatternDefinition(pattern: FigmaPatternDefinition): void {
  patternTemplates[pattern.name] = pattern;
}