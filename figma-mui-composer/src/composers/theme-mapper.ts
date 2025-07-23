// Maps MUI theme to Figma styles

export interface MUITheme {
  palette: {
    mode: 'light' | 'dark';
    primary: ColorDefinition;
    secondary: ColorDefinition;
    error: ColorDefinition;
    warning: ColorDefinition;
    info: ColorDefinition;
    success: ColorDefinition;
    grey: Record<number, string>;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    background: {
      default: string;
      paper: string;
    };
    divider: string;
  };
  typography: {
    fontFamily: string;
    h1: TypographyVariant;
    h2: TypographyVariant;
    h3: TypographyVariant;
    h4: TypographyVariant;
    h5: TypographyVariant;
    h6: TypographyVariant;
    subtitle1: TypographyVariant;
    subtitle2: TypographyVariant;
    body1: TypographyVariant;
    body2: TypographyVariant;
    button: TypographyVariant;
    caption: TypographyVariant;
    overline: TypographyVariant;
  };
  spacing: (factor: number) => number;
  shape: {
    borderRadius: number;
  };
  shadows: string[];
}

interface ColorDefinition {
  light: string;
  main: string;
  dark: string;
  contrastText: string;
}

interface TypographyVariant {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: string;
  lineHeight?: number;
  letterSpacing?: string;
}

// Default MUI theme values
export const defaultMUITheme: Partial<MUITheme> = {
  palette: {
    mode: 'light',
    primary: {
      light: '#7986cb',
      main: '#3f51b5',
      dark: '#303f9f',
      contrastText: '#fff'
    },
    secondary: {
      light: '#ff4081',
      main: '#f50057',
      dark: '#c51162',
      contrastText: '#fff'
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#fff'
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    info: {
      light: '#64b5f6',
      main: '#2196f3',
      dark: '#1976d2',
      contrastText: '#fff'
    },
    success: {
      light: '#81c784',
      main: '#4caf50',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)'
    },
    background: {
      default: '#fff',
      paper: '#fff'
    },
    divider: 'rgba(0, 0, 0, 0.12)'
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '6rem',
      lineHeight: 1.167,
      letterSpacing: '-0.01562em'
    },
    h2: {
      fontWeight: 300,
      fontSize: '3.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em'
    },
    h3: {
      fontWeight: 400,
      fontSize: '3rem',
      lineHeight: 1.167,
      letterSpacing: '0em'
    },
    h4: {
      fontWeight: 400,
      fontSize: '2.125rem',
      lineHeight: 1.235,
      letterSpacing: '0.00735em'
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.334,
      letterSpacing: '0em'
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
      letterSpacing: '0.0075em'
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.00938em'
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em'
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em'
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em'
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em'
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.03333em'
    },
    overline: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 2.66,
      letterSpacing: '0.08333em'
    }
  },
  shape: {
    borderRadius: 4
  }
};

// Convert hex color to Figma RGB
export function hexToFigmaRGB(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  };
}

// Convert rgba string to Figma RGBA
export function rgbaToFigmaRGBA(rgba: string): RGBA {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  return {
    r: parseInt(match[1]) / 255,
    g: parseInt(match[2]) / 255,
    b: parseInt(match[3]) / 255,
    a: match[4] ? parseFloat(match[4]) : 1
  };
}

// Apply MUI theme colors to Figma node
export function applyThemeColors(node: SceneNode, theme: Partial<MUITheme>, elementType?: string) {
  if (!theme.palette) return;
  
  // Apply background colors
  if ('fills' in node && node.type === 'FRAME') {
    const fills = [...(node.fills as Paint[])];
    
    // Determine background color based on element type
    let bgColor: RGB | null = null;
    
    if (elementType === 'paper' || elementType === 'card') {
      bgColor = theme.palette.mode === 'dark' 
        ? hexToFigmaRGB('#424242') // dark mode paper
        : hexToFigmaRGB(theme.palette.background?.paper || '#fff');
    } else if (elementType === 'surface') {
      bgColor = hexToFigmaRGB(theme.palette.background?.default || '#fff');
    }
    
    if (bgColor && fills.length > 0 && fills[0].type === 'SOLID') {
      fills[0] = {
        type: 'SOLID',
        color: bgColor
      };
      node.fills = fills;
    }
  }
  
  // Apply text colors
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    const fills = [...(textNode.fills as Paint[])];
    
    if (fills.length > 0 && fills[0].type === 'SOLID') {
      // Determine text color based on variant
      let textColor: RGB;
      
      if (textNode.name.includes('secondary') || textNode.name.includes('body2')) {
        textColor = rgbaToFigmaRGBA(theme.palette.text?.secondary || 'rgba(0, 0, 0, 0.6)');
      } else {
        textColor = rgbaToFigmaRGBA(theme.palette.text?.primary || 'rgba(0, 0, 0, 0.87)');
      }
      
      fills[0] = {
        type: 'SOLID',
        color: textColor
      };
      textNode.fills = fills;
    }
  }
}

// Apply MUI typography to Figma text node
export async function applyThemeTypography(
  node: TextNode, 
  theme: Partial<MUITheme>, 
  variant: keyof MUITheme['typography']
) {
  if (!theme.typography) return;
  
  const typography = theme.typography[variant];
  if (!typography || typeof typography === 'string') return;
  
  try {
    // Load font
    const fontName: FontName = {
      family: theme.typography.fontFamily?.split(',')[0].replace(/['"]/g, '').trim() || 'Roboto',
      style: 'Regular'
    };
    
    // Create a new font object to modify
    let targetFont = { ...fontName };
    
    if (typography.fontWeight) {
      if (typography.fontWeight >= 700) {
        targetFont.style = 'Bold';
      } else if (typography.fontWeight >= 500) {
        targetFont.style = 'Medium';
      }
    }
    
    await figma.loadFontAsync(targetFont);
    node.fontName = targetFont;
    
    // Apply size
    if (typography.fontSize) {
      const size = parseFloat(typography.fontSize);
      node.fontSize = size * 16; // Convert rem to px (assuming 16px base)
    }
    
    // Apply line height
    if (typography.lineHeight) {
      node.lineHeight = {
        value: typography.lineHeight * 100,
        unit: 'PERCENT'
      };
    }
    
    // Apply letter spacing
    if (typography.letterSpacing) {
      const spacing = parseFloat(typography.letterSpacing);
      node.letterSpacing = {
        value: spacing * 16, // Convert em to px
        unit: 'PIXELS'
      };
    }
  } catch (error) {
    console.warn('Failed to apply typography:', error);
  }
}

// Apply theme to component instance
export function applyThemeToInstance(instance: InstanceNode, theme: Partial<MUITheme>) {
  // Apply theme recursively to all children
  function applyToNode(node: SceneNode) {
    // Apply colors based on node type
    if (node.type === 'FRAME' || node.type === 'RECTANGLE') {
      applyThemeColors(node, theme);
    } else if (node.type === 'TEXT') {
      // Determine typography variant from node name
      const variantMap: Record<string, keyof MUITheme['typography']> = {
        'h1': 'h1',
        'h2': 'h2',
        'h3': 'h3',
        'h4': 'h4',
        'h5': 'h5',
        'h6': 'h6',
        'subtitle1': 'subtitle1',
        'subtitle2': 'subtitle2',
        'body1': 'body1',
        'body2': 'body2',
        'button': 'button',
        'caption': 'caption',
        'overline': 'overline'
      };
      
      let variant: keyof MUITheme['typography'] = 'body1';
      for (const [key, value] of Object.entries(variantMap)) {
        if (node.name.toLowerCase().includes(key)) {
          variant = value;
          break;
        }
      }
      
      applyThemeTypography(node as TextNode, theme, variant);
      applyThemeColors(node, theme);
    }
    
    // Recursively apply to children
    if ('children' in node) {
      node.children.forEach(child => applyToNode(child));
    }
  }
  
  applyToNode(instance);
}

// Get theme for dark mode
export function getDarkTheme(): Partial<MUITheme> {
  return {
    ...defaultMUITheme,
    palette: {
      ...defaultMUITheme.palette!,
      mode: 'dark',
      background: {
        default: '#121212',
        paper: '#1e1e1e'
      },
      text: {
        primary: 'rgba(255, 255, 255, 0.87)',
        secondary: 'rgba(255, 255, 255, 0.6)',
        disabled: 'rgba(255, 255, 255, 0.38)'
      },
      divider: 'rgba(255, 255, 255, 0.12)'
    }
  };
}