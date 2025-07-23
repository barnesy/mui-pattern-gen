// This plugin will compose MUI patterns in Figma using primitives from the MUI library

// Show the plugin UI
figma.showUI(__html__, { width: 400, height: 600 });

// Types for component mapping
interface MUIComponentMap {
  [key: string]: {
    key: string;
    variants?: string[];
    type: 'COMPONENT' | 'COMPONENT_SET';
  };
}

interface PatternDefinition {
  name: string;
  type: 'frame';
  layout?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  children: PatternElement[];
}

interface PatternElement {
  type: string;
  props?: Record<string, any>;
  content?: string;
  children?: PatternElement[];
}

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'discover-components':
        await discoverMUIComponents();
        break;
      
      case 'compose-pattern':
        await composePattern(msg.pattern, msg.theme);
        break;
      
      case 'get-stored-components':
        const components = await figma.clientStorage.getAsync('mui-components');
        figma.ui.postMessage({ type: 'components-loaded', data: components });
        break;
      
      case 'cancel':
        figma.closePlugin();
        break;
    }
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({ 
      type: 'error', 
      message: error instanceof Error ? error.message : 'An error occurred' 
    });
  }
};

// Discover MUI components in the current file
async function discoverMUIComponents() {
  figma.ui.postMessage({ type: 'discovery-started' });
  
  const components = figma.root.findAll(node => 
    node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
  );
  
  const componentMap: MUIComponentMap = {};
  
  components.forEach((component) => {
    if (component.type !== 'COMPONENT' && component.type !== 'COMPONENT_SET') {
      return;
    }
    // Extract component name and category from Figma naming convention
    const name = component.name;
    const cleanName = extractComponentName(name);
    
    if (cleanName && component.key) {
      componentMap[cleanName] = {
        key: component.key,
        type: component.type as 'COMPONENT' | 'COMPONENT_SET',
        variants: component.type === 'COMPONENT_SET' 
          ? extractVariants(component as ComponentSetNode)
          : undefined
      };
    }
  });
  
  // Save to client storage
  await figma.clientStorage.setAsync('mui-components', componentMap);
  
  figma.ui.postMessage({ 
    type: 'discovery-complete', 
    data: componentMap,
    count: Object.keys(componentMap).length 
  });
}

// Extract clean component name from Figma naming
function extractComponentName(name: string): string {
  // Handle common MUI naming patterns
  // e.g., "Button/Contained/Primary" -> "Button"
  const parts = name.split('/');
  const baseName = parts[0].trim();
  
  // Map common MUI component names
  const componentMap: Record<string, string> = {
    'Button': 'Button',
    'Card': 'Card',
    'TextField': 'TextField',
    'Typography': 'Typography',
    'Avatar': 'Avatar',
    'Chip': 'Chip',
    'IconButton': 'IconButton',
    'Paper': 'Paper',
    'AppBar': 'AppBar',
    'Toolbar': 'Toolbar',
    'Divider': 'Divider',
    'List': 'List',
    'ListItem': 'ListItem',
    'ListItemText': 'ListItemText',
    'ListItemAvatar': 'ListItemAvatar'
  };
  
  return componentMap[baseName] || baseName;
}

// Extract variants from a component set
function extractVariants(componentSet: ComponentSetNode): string[] {
  try {
    const variantProps = componentSet.variantGroupProperties;
    const variants: string[] = [];
    
    Object.entries(variantProps).forEach(([prop, values]) => {
      if (prop.toLowerCase() === 'variant' && values.values) {
        variants.push(...values.values);
      }
    });
    
    return variants;
  } catch {
    return [];
  }
}

// Compose a pattern using MUI components
async function composePattern(patternDef: PatternDefinition, theme?: 'light' | 'dark') {
  figma.ui.postMessage({ type: 'composition-started' });
  
  // Load stored MUI components
  const muiComponents = await figma.clientStorage.getAsync('mui-components') as MUIComponentMap;
  
  if (!muiComponents || Object.keys(muiComponents).length === 0) {
    throw new Error('No MUI components found. Please run component discovery first.');
  }
  
  // Create the main frame for the pattern
  const patternFrame = figma.createFrame();
  patternFrame.name = patternDef.name;
  
  // Set layout properties
  if (patternDef.layout) {
    patternFrame.layoutMode = patternDef.layout === 'vertical' ? 'VERTICAL' : 'HORIZONTAL';
    patternFrame.primaryAxisSizingMode = 'AUTO';
    patternFrame.counterAxisSizingMode = 'AUTO';
  }
  
  if (patternDef.padding) {
    patternFrame.paddingLeft = patternDef.padding;
    patternFrame.paddingRight = patternDef.padding;
    patternFrame.paddingTop = patternDef.padding;
    patternFrame.paddingBottom = patternDef.padding;
  }
  
  if (patternDef.spacing) {
    patternFrame.itemSpacing = patternDef.spacing;
  }
  
  // Compose children elements
  for (const element of patternDef.children) {
    const child = await createElement(element, muiComponents);
    if (child) {
      patternFrame.appendChild(child);
    }
  }
  
  // Position the pattern in the viewport
  const viewport = figma.viewport.center;
  patternFrame.x = viewport.x - patternFrame.width / 2;
  patternFrame.y = viewport.y - patternFrame.height / 2;
  
  // Select the created pattern
  figma.currentPage.selection = [patternFrame];
  figma.viewport.scrollAndZoomIntoView([patternFrame]);
  
  figma.ui.postMessage({ type: 'composition-complete' });
}

// Create an element from pattern definition
async function createElement(
  element: PatternElement, 
  muiComponents: MUIComponentMap
): Promise<SceneNode | null> {
  // Handle MUI components
  if (element.type.startsWith('mui:')) {
    const componentName = element.type.replace('mui:', '');
    const componentDef = muiComponents[componentName];
    
    if (!componentDef) {
      console.warn(`MUI component ${componentName} not found`);
      return null;
    }
    
    try {
      // Import the component
      let component: ComponentNode | ComponentSetNode;
      
      if (componentDef.type === 'COMPONENT_SET') {
        component = await figma.importComponentSetByKeyAsync(componentDef.key);
      } else {
        component = await figma.importComponentByKeyAsync(componentDef.key);
      }
      
      // Create instance
      let instance: InstanceNode;
      
      if (component.type === 'COMPONENT') {
        instance = component.createInstance();
      } else {
        // For ComponentSet, get the default variant
        const defaultVariant = component.defaultVariant;
        if (defaultVariant && defaultVariant.type === 'COMPONENT') {
          instance = defaultVariant.createInstance();
        } else {
          // Find first component child
          const firstComponent = component.children.find(child => child.type === 'COMPONENT') as ComponentNode;
          if (firstComponent) {
            instance = firstComponent.createInstance();
          } else {
            console.error('No component found in component set');
            return null;
          }
        }
      }
      
      // Apply props if available
      if (element.props && instance.type === 'INSTANCE') {
        applyPropsToInstance(instance, element.props);
      }
      
      // Handle children if it's a container
      if (element.children && element.children.length > 0) {
        // For now, we'll skip nested children in instances
        // This would require more complex logic to modify instance internals
      }
      
      return instance;
    } catch (error) {
      console.error(`Failed to import component ${componentName}:`, error);
      return null;
    }
  }
  
  // Handle basic frame containers
  if (element.type === 'frame') {
    const frame = figma.createFrame();
    
    // Apply basic properties
    if (element.props) {
      if (element.props.width) frame.resize(element.props.width, frame.height);
      if (element.props.height) frame.resize(frame.width, element.props.height);
    }
    
    // Handle children
    if (element.children) {
      for (const child of element.children) {
        const childNode = await createElement(child, muiComponents);
        if (childNode) {
          frame.appendChild(childNode);
        }
      }
    }
    
    return frame;
  }
  
  return null;
}

// Apply props to component instance
function applyPropsToInstance(instance: InstanceNode, props: Record<string, any>) {
  // Handle variant properties
  if (props.variant && instance.componentProperties) {
    try {
      const propValue: { [key: string]: string | boolean } = {
        'variant': String(props.variant)
      };
      instance.setProperties(propValue);
    } catch (error) {
      console.warn('Could not set variant property:', error);
    }
  }
  
  // Handle other common props
  if (props.size && instance.componentProperties) {
    try {
      const propValue: { [key: string]: string | boolean } = {
        'size': String(props.size)
      };
      instance.setProperties(propValue);
    } catch (error) {
      console.warn('Could not set size property:', error);
    }
  }
  
  if (props.color && instance.componentProperties) {
    try {
      const propValue: { [key: string]: string | boolean } = {
        'color': String(props.color)
      };
      instance.setProperties(propValue);
    } catch (error) {
      console.warn('Could not set color property:', error);
    }
  }
}

// Helper to notify UI of loading state
figma.ui.postMessage({ type: 'plugin-ready' });