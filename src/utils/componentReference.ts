/**
 * Utility functions for generating and parsing component references in AI Design Mode
 */

interface ComponentReferenceInfo {
  path: string;
  selector: string;
  hash: string;
  fullReference: string;
}

/**
 * Generate a unique reference for a component element
 */
export function generateComponentReference(
  element: HTMLElement,
  componentName: string,
  props: Record<string, any>
): ComponentReferenceInfo {
  // Generate hierarchical path
  const path = generateElementPath(element);
  
  // Create selector with key props
  const selector = generateComponentSelector(componentName, props);
  
  // Generate short hash for verification
  const hash = generatePropsHash(props);
  
  // Combine into full reference
  const fullReference = `${path} > ${selector}#${hash}`;
  
  return {
    path,
    selector,
    hash,
    fullReference
  };
}

/**
 * Generate a path from document root to the element
 */
function generateElementPath(element: HTMLElement): string {
  const pathParts: string[] = [];
  let current: HTMLElement | null = element;
  
  while (current && current !== document.body) {
    // Skip wrapper elements
    if (current.id && !current.id.startsWith('mui-')) {
      pathParts.unshift(`#${current.id}`);
      break; // ID is unique enough
    }
    
    // Find component name from classes
    const componentClass = Array.from(current.classList).find(c => c.startsWith('Mui'));
    if (componentClass) {
      const componentType = componentClass.replace(/^Mui/, '').replace(/-.*$/, '');
      
      // Get position among siblings of same type
      const siblings = Array.from(current.parentElement?.children || [])
        .filter(el => el.classList.toString().includes(componentType));
      const index = siblings.indexOf(current);
      
      if (siblings.length > 1) {
        pathParts.unshift(`${componentType}[${index + 1}]`);
      } else {
        pathParts.unshift(componentType);
      }
    }
    
    current = current.parentElement;
  }
  
  // Add page context if available
  const pathname = window.location.pathname;
  if (pathname && pathname !== '/') {
    pathParts.unshift(pathname);
  }
  
  return pathParts.join(' > ');
}

/**
 * Generate a selector string with key props
 */
function generateComponentSelector(
  componentName: string,
  props: Record<string, any>
): string {
  const keyProps = ['variant', 'color', 'size', 'disabled', 'error'];
  const propParts: string[] = [];
  
  keyProps.forEach(key => {
    if (props[key] !== undefined) {
      propParts.push(`${key}=${props[key]}`);
    }
  });
  
  if (propParts.length > 0) {
    return `${componentName}[${propParts.join(',')}]`;
  }
  
  return componentName;
}

/**
 * Generate a short hash from component props
 */
function generatePropsHash(props: Record<string, any>): string {
  const propsString = JSON.stringify(props, Object.keys(props).sort());
  let hash = 0;
  
  for (let i = 0; i < propsString.length; i++) {
    const char = propsString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16).slice(0, 4);
}

/**
 * Parse a component reference string
 */
export function parseComponentReference(reference: string): {
  path: string;
  selector: string;
  hash: string;
} | null {
  const match = reference.match(/^(.+?)\s*>\s*([^#]+)#(.+)$/);
  
  if (!match) {
    return null;
  }
  
  return {
    path: match[1].trim(),
    selector: match[2].trim(),
    hash: match[3].trim()
  };
}

/**
 * Get a simplified display reference for UI
 */
export function getDisplayReference(
  componentName: string,
  props: Record<string, any>,
  path?: string
): string {
  const keyProps = [];
  
  if (props.variant) keyProps.push(`variant:${props.variant}`);
  if (props.color) keyProps.push(`color:${props.color}`);
  if (props.size) keyProps.push(`size:${props.size}`);
  
  let reference = componentName;
  if (keyProps.length > 0) {
    reference += `[${keyProps.join(', ')}]`;
  }
  
  if (path) {
    // Extract last meaningful part of path
    const pathParts = path.split(' > ');
    const context = pathParts[pathParts.length - 2];
    if (context && !context.includes('#')) {
      reference = `${context} > ${reference}`;
    }
  }
  
  return reference;
}

/**
 * Generate grid position for component if applicable
 */
export function getGridPosition(element: HTMLElement): string | null {
  const gridItem = element.closest('.MuiGrid-item');
  if (!gridItem) return null;
  
  const gridContainer = gridItem.closest('.MuiGrid-container');
  if (!gridContainer) return null;
  
  const allItems = Array.from(gridContainer.querySelectorAll('.MuiGrid-item'));
  const index = allItems.indexOf(gridItem as Element);
  
  if (index !== -1) {
    // Estimate row/col based on grid size
    const cols = parseInt(gridItem.className.match(/MuiGrid-grid-xs-(\d+)/)?.[1] || '12');
    const itemsPerRow = Math.floor(12 / cols);
    const row = Math.floor(index / itemsPerRow) + 1;
    const col = (index % itemsPerRow) + 1;
    
    return `grid:${row}x${col}`;
  }
  
  return null;
}