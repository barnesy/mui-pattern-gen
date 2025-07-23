// Storage for MUI component keys from the Figma library
// These would be populated by running the discovery tool on the MUI Figma file

export interface ComponentKeyEntry {
  key: string;
  name: string;
  type: 'COMPONENT' | 'COMPONENT_SET';
  variants?: string[];
  category?: string;
}

// This will be populated after running discovery on the MUI Figma library
export const MUI_COMPONENT_KEYS: Record<string, ComponentKeyEntry> = {
  // Core components - keys would be populated from actual MUI library
  Button: {
    key: '', // Will be filled by discovery
    name: 'Button',
    type: 'COMPONENT_SET',
    variants: ['contained', 'outlined', 'text'],
    category: 'inputs'
  },
  
  Card: {
    key: '',
    name: 'Card',
    type: 'COMPONENT',
    category: 'surfaces'
  },
  
  TextField: {
    key: '',
    name: 'TextField',
    type: 'COMPONENT_SET',
    variants: ['outlined', 'filled', 'standard'],
    category: 'inputs'
  },
  
  Typography: {
    key: '',
    name: 'Typography',
    type: 'COMPONENT_SET',
    variants: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2'],
    category: 'data-display'
  },
  
  Avatar: {
    key: '',
    name: 'Avatar',
    type: 'COMPONENT_SET',
    variants: ['circular', 'rounded', 'square'],
    category: 'data-display'
  },
  
  // Add more components as discovered
};

// Helper to check if we have keys loaded
export function hasComponentKeys(): boolean {
  return Object.values(MUI_COMPONENT_KEYS).some(entry => entry.key !== '');
}

// Helper to get component key
export function getComponentKey(componentName: string): string | null {
  const entry = MUI_COMPONENT_KEYS[componentName];
  return entry?.key || null;
}

// Save discovered keys
export function saveDiscoveredKeys(discoveredComponents: Record<string, any>) {
  Object.entries(discoveredComponents).forEach(([name, data]) => {
    if (MUI_COMPONENT_KEYS[name]) {
      MUI_COMPONENT_KEYS[name].key = data.key;
      if (data.variants) {
        MUI_COMPONENT_KEYS[name].variants = data.variants;
      }
    } else {
      // Add new component not in our initial list
      MUI_COMPONENT_KEYS[name] = {
        key: data.key,
        name: name,
        type: data.type,
        variants: data.variants
      };
    }
  });
}