// Layout engine for converting MUI layout patterns to Figma auto-layout

export interface LayoutConfig {
  direction: 'horizontal' | 'vertical';
  spacing: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  alignment: {
    primary: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    counter: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH';
  };
}

// Convert MUI Box/Stack props to Figma auto-layout
export function muiLayoutToFigma(muiProps: Record<string, any>): Partial<FrameNode> {
  const figmaFrame: Partial<FrameNode> = {};
  
  // Handle direction
  if (muiProps.direction || muiProps.flexDirection) {
    const direction = muiProps.direction || muiProps.flexDirection;
    figmaFrame.layoutMode = direction === 'row' || direction === 'row-reverse' 
      ? 'HORIZONTAL' 
      : 'VERTICAL';
  }
  
  // Handle spacing
  if (muiProps.spacing !== undefined) {
    // MUI spacing is typically in 8px units
    figmaFrame.itemSpacing = muiProps.spacing * 8;
  }
  
  if (muiProps.gap !== undefined) {
    figmaFrame.itemSpacing = typeof muiProps.gap === 'number' ? muiProps.gap : 8;
  }
  
  // Handle padding
  if (muiProps.padding || muiProps.p) {
    const padding = muiProps.padding || muiProps.p;
    if (typeof padding === 'number') {
      figmaFrame.paddingTop = padding * 8;
      figmaFrame.paddingRight = padding * 8;
      figmaFrame.paddingBottom = padding * 8;
      figmaFrame.paddingLeft = padding * 8;
    }
  }
  
  // Handle individual padding
  if (muiProps.pt || muiProps.paddingTop) {
    figmaFrame.paddingTop = (muiProps.pt || muiProps.paddingTop) * 8;
  }
  if (muiProps.pr || muiProps.paddingRight) {
    figmaFrame.paddingRight = (muiProps.pr || muiProps.paddingRight) * 8;
  }
  if (muiProps.pb || muiProps.paddingBottom) {
    figmaFrame.paddingBottom = (muiProps.pb || muiProps.paddingBottom) * 8;
  }
  if (muiProps.pl || muiProps.paddingLeft) {
    figmaFrame.paddingLeft = (muiProps.pl || muiProps.paddingLeft) * 8;
  }
  
  // Handle alignment
  if (muiProps.justifyContent) {
    figmaFrame.primaryAxisAlignItems = mapJustifyContent(muiProps.justifyContent);
  }
  
  if (muiProps.alignItems) {
    figmaFrame.counterAxisAlignItems = mapAlignItems(muiProps.alignItems) as 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  }
  
  // Handle sizing
  if (muiProps.width === '100%' || muiProps.fullWidth) {
    figmaFrame.primaryAxisSizingMode = 'FIXED';
    figmaFrame.layoutAlign = 'STRETCH';
  } else {
    figmaFrame.primaryAxisSizingMode = 'AUTO';
  }
  
  if (muiProps.height === '100%') {
    figmaFrame.counterAxisSizingMode = 'FIXED';
  } else {
    figmaFrame.counterAxisSizingMode = 'AUTO';
  }
  
  return figmaFrame;
}

// Map MUI justifyContent to Figma primaryAxisAlignItems
function mapJustifyContent(value: string): 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN' {
  const mappings: Record<string, 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'> = {
    'flex-start': 'MIN',
    'start': 'MIN',
    'center': 'CENTER',
    'flex-end': 'MAX',
    'end': 'MAX',
    'space-between': 'SPACE_BETWEEN',
    'space-around': 'SPACE_BETWEEN',
    'space-evenly': 'SPACE_BETWEEN'
  };
  
  return mappings[value] || 'MIN';
}

// Map MUI alignItems to Figma counterAxisAlignItems
function mapAlignItems(value: string): 'MIN' | 'CENTER' | 'MAX' | 'BASELINE' {
  const mappings: Record<string, 'MIN' | 'CENTER' | 'MAX' | 'BASELINE'> = {
    'flex-start': 'MIN',
    'start': 'MIN',
    'center': 'CENTER',
    'flex-end': 'MAX',
    'end': 'MAX',
    'stretch': 'CENTER', // Approximation - Figma doesn't have STRETCH for counterAxis
    'baseline': 'BASELINE'
  };
  
  return mappings[value] || 'CENTER';
}

// Convert MUI Grid to Figma
export function muiGridToFigma(gridProps: Record<string, any>): Partial<FrameNode> {
  const figmaFrame: Partial<FrameNode> = {
    layoutMode: 'HORIZONTAL',
    layoutWrap: 'WRAP'
  };
  
  // Handle spacing
  if (gridProps.spacing !== undefined) {
    figmaFrame.itemSpacing = gridProps.spacing * 8;
  }
  
  // Grid container properties
  if (gridProps.container) {
    figmaFrame.primaryAxisSizingMode = 'FIXED';
    figmaFrame.layoutAlign = 'STRETCH';
  }
  
  return figmaFrame;
}

// Calculate responsive breakpoints
export function calculateResponsiveLayout(
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  baseLayout: LayoutConfig
): LayoutConfig {
  const breakpointWidths = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  };
  
  // Adjust layout based on breakpoint
  const layout = { ...baseLayout };
  
  // Mobile adjustments
  if (breakpoint === 'xs' || breakpoint === 'sm') {
    // Stack vertically on mobile
    if (layout.direction === 'horizontal') {
      layout.direction = 'vertical';
    }
    // Reduce padding on mobile
    layout.padding = {
      top: layout.padding.top / 2,
      right: layout.padding.right / 2,
      bottom: layout.padding.bottom / 2,
      left: layout.padding.left / 2
    };
  }
  
  return layout;
}

// Apply theme spacing to Figma
export function applyMUISpacing(value: number | string): number {
  if (typeof value === 'number') {
    // MUI theme spacing is typically 8px units
    return value * 8;
  }
  
  // Handle string values like '16px' or '2rem'
  if (typeof value === 'string') {
    if (value.endsWith('px')) {
      return parseInt(value);
    }
    if (value.endsWith('rem')) {
      return parseFloat(value) * 16; // 1rem = 16px
    }
  }
  
  return 8; // Default spacing
}