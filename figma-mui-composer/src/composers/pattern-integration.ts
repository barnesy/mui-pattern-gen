// Integration with the existing MUI Pattern Generator system

import { getAllPatternDefinitions } from './pattern-parser';

interface ExistingPattern {
  name: string;
  category: string;
  path: string;
  hasConfig: boolean;
}

// Scan for patterns in the main project
export async function scanProjectPatterns(): Promise<ExistingPattern[]> {
  // In a real implementation, this would scan the file system
  // For now, we'll return a list of known patterns
  
  const patterns: ExistingPattern[] = [
    // Auth patterns
    {
      name: 'LoginForm',
      category: 'auth',
      path: '../src/patterns/auth/LoginForm.tsx',
      hasConfig: true
    },
    {
      name: 'RegisterForm',
      category: 'auth',
      path: '../src/patterns/auth/RegisterForm.tsx',
      hasConfig: true
    },
    {
      name: 'PasswordReset',
      category: 'auth',
      path: '../src/patterns/auth/PasswordReset.tsx',
      hasConfig: true
    },
    
    // Card patterns
    {
      name: 'UserProfileCard',
      category: 'cards',
      path: '../src/patterns/cards/UserProfileCard.tsx',
      hasConfig: true
    },
    {
      name: 'ProductCard',
      category: 'cards',
      path: '../src/patterns/cards/ProductCard.tsx',
      hasConfig: true
    },
    {
      name: 'StatsCard',
      category: 'cards',
      path: '../src/patterns/cards/StatsCard.tsx',
      hasConfig: true
    },
    
    // Form patterns
    {
      name: 'ContactForm',
      category: 'forms',
      path: '../src/patterns/forms/ContactForm.tsx',
      hasConfig: true
    },
    {
      name: 'SearchForm',
      category: 'forms',
      path: '../src/patterns/forms/SearchForm.tsx',
      hasConfig: true
    },
    {
      name: 'MultiStepForm',
      category: 'forms',
      path: '../src/patterns/forms/MultiStepForm.tsx',
      hasConfig: false
    },
    
    // Navigation patterns
    {
      name: 'Header',
      category: 'navigation',
      path: '../src/patterns/navigation/Header.tsx',
      hasConfig: true
    },
    {
      name: 'Sidebar',
      category: 'navigation',
      path: '../src/patterns/navigation/Sidebar.tsx',
      hasConfig: true
    },
    {
      name: 'Breadcrumbs',
      category: 'navigation',
      path: '../src/patterns/navigation/Breadcrumbs.tsx',
      hasConfig: true
    },
    
    // List patterns
    {
      name: 'DataTable',
      category: 'lists',
      path: '../src/patterns/lists/DataTable.tsx',
      hasConfig: true
    },
    {
      name: 'ImageGallery',
      category: 'lists',
      path: '../src/patterns/lists/ImageGallery.tsx',
      hasConfig: true
    },
    
    // Dashboard patterns
    {
      name: 'StatsWidget',
      category: 'dashboards',
      path: '../src/patterns/dashboards/StatsWidget.tsx',
      hasConfig: true
    },
    {
      name: 'ChartWidget',
      category: 'dashboards',
      path: '../src/patterns/dashboards/ChartWidget.tsx',
      hasConfig: false
    }
  ];
  
  return patterns;
}

// Load pattern configuration
export async function loadPatternConfig(patternName: string): Promise<any> {
  // In a real implementation, this would dynamically import the config
  // For now, return sample configurations
  
  const configs: Record<string, any> = {
    UserProfileCard: {
      controls: [
        {
          name: 'variant',
          type: 'variant',
          label: 'Variant',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Compact', value: 'compact' },
            { label: 'Detailed', value: 'detailed' }
          ]
        },
        {
          name: 'showAvatar',
          type: 'boolean',
          label: 'Show Avatar',
          defaultValue: true
        },
        {
          name: 'showActions',
          type: 'boolean',
          label: 'Show Actions',
          defaultValue: true
        }
      ]
    },
    LoginForm: {
      controls: [
        {
          name: 'variant',
          type: 'variant',
          label: 'Variant',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Card', value: 'card' }
          ]
        },
        {
          name: 'showRememberMe',
          type: 'boolean',
          label: 'Show Remember Me',
          defaultValue: true
        },
        {
          name: 'showSocialLogin',
          type: 'boolean',
          label: 'Show Social Login',
          defaultValue: false
        }
      ]
    },
    ContactForm: {
      controls: [
        {
          name: 'variant',
          type: 'variant',
          label: 'Variant',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Inline', value: 'inline' },
            { label: 'Floating', value: 'floating' }
          ]
        },
        {
          name: 'showSubject',
          type: 'boolean',
          label: 'Show Subject Field',
          defaultValue: true
        },
        {
          name: 'showPhone',
          type: 'boolean',
          label: 'Show Phone Field',
          defaultValue: false
        }
      ]
    }
  };
  
  return configs[patternName] || { controls: [] };
}

// Convert pattern props to Figma element props
export function mapPatternPropsToFigma(
  patternName: string,
  props: Record<string, any>
): Record<string, any> {
  // Map pattern-specific props to Figma-compatible props
  const figmaProps: Record<string, any> = {};
  
  // Handle common props
  if (props.variant) {
    figmaProps.variant = props.variant;
  }
  
  if (props.size) {
    figmaProps.size = props.size;
  }
  
  if (props.color) {
    figmaProps.color = props.color;
  }
  
  // Handle pattern-specific mappings
  switch (patternName) {
    case 'UserProfileCard':
      if (!props.showAvatar) {
        figmaProps.hideAvatar = true;
      }
      if (!props.showActions) {
        figmaProps.hideActions = true;
      }
      break;
      
    case 'LoginForm':
      if (props.variant === 'minimal') {
        figmaProps.minimal = true;
      }
      if (props.showSocialLogin) {
        figmaProps.includeSocial = true;
      }
      break;
      
    case 'ContactForm':
      if (props.variant === 'floating') {
        figmaProps.floatingLabels = true;
      }
      break;
  }
  
  return figmaProps;
}

// Get pattern definition with applied props
export function getPatternWithProps(
  patternName: string,
  props: Record<string, any>
): any {
  const baseDefinition = getAllPatternDefinitions().find(p => p.name === patternName);
  
  if (!baseDefinition) {
    return null;
  }
  
  // Clone the definition
  const definition = JSON.parse(JSON.stringify(baseDefinition));
  
  // Apply props to the definition
  const figmaProps = mapPatternPropsToFigma(patternName, props);
  
  // Modify definition based on props
  if (patternName === 'UserProfileCard' && figmaProps.hideAvatar) {
    // Remove avatar from the structure
    removeElementByType(definition, 'mui:Avatar');
  }
  
  if (patternName === 'UserProfileCard' && figmaProps.hideActions) {
    // Remove action buttons
    removeActionButtons(definition);
  }
  
  return definition;
}

// Helper to remove elements by type
function removeElementByType(definition: any, type: string): void {
  if (definition.children) {
    definition.children = definition.children.filter((child: any) => {
      if (child.type === type) {
        return false;
      }
      removeElementByType(child, type);
      return true;
    });
  }
}

// Helper to remove action buttons
function removeActionButtons(definition: any): void {
  if (definition.children) {
    definition.children.forEach((child: any) => {
      if (child.children) {
        child.children = child.children.filter((subChild: any) => {
          // Remove frames containing buttons
          if (subChild.type === 'frame' && subChild.children) {
            const hasOnlyButtons = subChild.children.every((el: any) => 
              el.type === 'mui:Button'
            );
            return !hasOnlyButtons;
          }
          return true;
        });
      }
      removeActionButtons(child);
    });
  }
}