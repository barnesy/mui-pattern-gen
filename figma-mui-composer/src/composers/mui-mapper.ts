// Maps MUI component properties to Figma component properties

export interface MUIComponentMapping {
  figmaName: string;
  muiName: string;
  defaultProps?: Record<string, any>;
  propMappings?: Record<string, string>;
  variantMapping?: Record<string, string[]>;
}

// Common MUI to Figma component mappings
export const muiComponentMappings: Record<string, MUIComponentMapping> = {
  Button: {
    figmaName: 'Button',
    muiName: 'Button',
    defaultProps: {
      variant: 'contained',
      size: 'medium',
      color: 'primary'
    },
    variantMapping: {
      variant: ['text', 'outlined', 'contained'],
      size: ['small', 'medium', 'large'],
      color: ['primary', 'secondary', 'error', 'warning', 'info', 'success']
    }
  },
  
  Card: {
    figmaName: 'Card',
    muiName: 'Card',
    defaultProps: {
      variant: 'elevation'
    },
    variantMapping: {
      variant: ['elevation', 'outlined']
    }
  },
  
  TextField: {
    figmaName: 'TextField',
    muiName: 'TextField',
    defaultProps: {
      variant: 'outlined',
      size: 'medium'
    },
    variantMapping: {
      variant: ['standard', 'filled', 'outlined'],
      size: ['small', 'medium']
    }
  },
  
  Typography: {
    figmaName: 'Typography',
    muiName: 'Typography',
    defaultProps: {
      variant: 'body1'
    },
    variantMapping: {
      variant: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline']
    }
  },
  
  Avatar: {
    figmaName: 'Avatar',
    muiName: 'Avatar',
    defaultProps: {
      variant: 'circular'
    },
    variantMapping: {
      variant: ['circular', 'rounded', 'square'],
      size: ['small', 'medium', 'large']
    }
  },
  
  Chip: {
    figmaName: 'Chip',
    muiName: 'Chip',
    defaultProps: {
      variant: 'filled',
      size: 'medium'
    },
    variantMapping: {
      variant: ['filled', 'outlined'],
      size: ['small', 'medium'],
      color: ['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success']
    }
  },
  
  IconButton: {
    figmaName: 'IconButton',
    muiName: 'IconButton',
    defaultProps: {
      size: 'medium',
      color: 'default'
    },
    variantMapping: {
      size: ['small', 'medium', 'large'],
      color: ['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success']
    }
  },
  
  Paper: {
    figmaName: 'Paper',
    muiName: 'Paper',
    defaultProps: {
      elevation: 1,
      variant: 'elevation'
    },
    variantMapping: {
      variant: ['elevation', 'outlined']
    }
  },
  
  AppBar: {
    figmaName: 'AppBar',
    muiName: 'AppBar',
    defaultProps: {
      position: 'static',
      color: 'primary'
    },
    variantMapping: {
      color: ['default', 'primary', 'secondary', 'transparent']
    }
  },
  
  Toolbar: {
    figmaName: 'Toolbar',
    muiName: 'Toolbar',
    defaultProps: {
      variant: 'regular'
    },
    variantMapping: {
      variant: ['regular', 'dense']
    }
  },
  
  Divider: {
    figmaName: 'Divider',
    muiName: 'Divider',
    defaultProps: {
      variant: 'fullWidth'
    },
    variantMapping: {
      variant: ['fullWidth', 'inset', 'middle'],
      orientation: ['horizontal', 'vertical']
    }
  },
  
  List: {
    figmaName: 'List',
    muiName: 'List',
    defaultProps: {
      dense: false
    }
  },
  
  ListItem: {
    figmaName: 'ListItem',
    muiName: 'ListItem',
    defaultProps: {
      alignItems: 'center'
    }
  },
  
  ListItemText: {
    figmaName: 'ListItemText',
    muiName: 'ListItemText',
    defaultProps: {}
  },
  
  ListItemAvatar: {
    figmaName: 'ListItemAvatar',
    muiName: 'ListItemAvatar',
    defaultProps: {}
  },
  
  Switch: {
    figmaName: 'Switch',
    muiName: 'Switch',
    defaultProps: {
      size: 'medium',
      color: 'primary'
    },
    variantMapping: {
      size: ['small', 'medium'],
      color: ['primary', 'secondary', 'default']
    }
  },
  
  Checkbox: {
    figmaName: 'Checkbox',
    muiName: 'Checkbox',
    defaultProps: {
      size: 'medium',
      color: 'primary'
    },
    variantMapping: {
      size: ['small', 'medium'],
      color: ['primary', 'secondary', 'default']
    }
  },
  
  Radio: {
    figmaName: 'Radio',
    muiName: 'Radio',
    defaultProps: {
      size: 'medium',
      color: 'primary'
    },
    variantMapping: {
      size: ['small', 'medium'],
      color: ['primary', 'secondary', 'default']
    }
  },
  
  Select: {
    figmaName: 'Select',
    muiName: 'Select',
    defaultProps: {
      variant: 'outlined',
      size: 'medium'
    },
    variantMapping: {
      variant: ['standard', 'filled', 'outlined'],
      size: ['small', 'medium']
    }
  },
  
  Slider: {
    figmaName: 'Slider',
    muiName: 'Slider',
    defaultProps: {
      size: 'medium',
      color: 'primary'
    },
    variantMapping: {
      size: ['small', 'medium'],
      color: ['primary', 'secondary']
    }
  },
  
  Alert: {
    figmaName: 'Alert',
    muiName: 'Alert',
    defaultProps: {
      severity: 'info',
      variant: 'standard'
    },
    variantMapping: {
      severity: ['error', 'warning', 'info', 'success'],
      variant: ['standard', 'filled', 'outlined']
    }
  },
  
  Snackbar: {
    figmaName: 'Snackbar',
    muiName: 'Snackbar',
    defaultProps: {
      anchorOrigin: { vertical: 'bottom', horizontal: 'left' }
    }
  },
  
  Dialog: {
    figmaName: 'Dialog',
    muiName: 'Dialog',
    defaultProps: {
      maxWidth: 'sm',
      fullWidth: true
    }
  },
  
  Menu: {
    figmaName: 'Menu',
    muiName: 'Menu',
    defaultProps: {}
  },
  
  MenuItem: {
    figmaName: 'MenuItem',
    muiName: 'MenuItem',
    defaultProps: {}
  },
  
  Tabs: {
    figmaName: 'Tabs',
    muiName: 'Tabs',
    defaultProps: {
      variant: 'standard',
      orientation: 'horizontal'
    },
    variantMapping: {
      variant: ['standard', 'scrollable', 'fullWidth']
    }
  },
  
  Tab: {
    figmaName: 'Tab',
    muiName: 'Tab',
    defaultProps: {}
  },
  
  Badge: {
    figmaName: 'Badge',
    muiName: 'Badge',
    defaultProps: {
      color: 'primary',
      variant: 'standard'
    },
    variantMapping: {
      color: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      variant: ['standard', 'dot']
    }
  },
  
  Tooltip: {
    figmaName: 'Tooltip',
    muiName: 'Tooltip',
    defaultProps: {
      arrow: false,
      placement: 'bottom'
    }
  },
  
  CircularProgress: {
    figmaName: 'CircularProgress',
    muiName: 'CircularProgress',
    defaultProps: {
      size: 40,
      color: 'primary'
    },
    variantMapping: {
      color: ['primary', 'secondary', 'inherit']
    }
  },
  
  LinearProgress: {
    figmaName: 'LinearProgress',
    muiName: 'LinearProgress',
    defaultProps: {
      variant: 'indeterminate',
      color: 'primary'
    },
    variantMapping: {
      variant: ['determinate', 'indeterminate', 'buffer', 'query'],
      color: ['primary', 'secondary', 'inherit']
    }
  },
  
  Skeleton: {
    figmaName: 'Skeleton',
    muiName: 'Skeleton',
    defaultProps: {
      variant: 'text',
      animation: 'pulse'
    },
    variantMapping: {
      variant: ['text', 'circular', 'rectangular'],
      animation: ['pulse', 'wave', 'false']
    }
  }
};

// Helper to get Figma-compatible props from MUI props
export function mapMUIPropsToFigma(
  componentName: string,
  muiProps: Record<string, any>
): Record<string, any> {
  const mapping = muiComponentMappings[componentName];
  if (!mapping) return muiProps;
  
  const figmaProps: Record<string, any> = {
    ...mapping.defaultProps,
    ...muiProps
  };
  
  // Apply any custom prop mappings
  if (mapping.propMappings) {
    Object.entries(mapping.propMappings).forEach(([muiProp, figmaProp]) => {
      if (muiProps[muiProp] !== undefined) {
        figmaProps[figmaProp] = muiProps[muiProp];
        delete figmaProps[muiProp];
      }
    });
  }
  
  return figmaProps;
}

// Get the appropriate Figma component name for a MUI component
export function getFigmaComponentName(muiComponentName: string): string {
  const mapping = muiComponentMappings[muiComponentName];
  return mapping?.figmaName || muiComponentName;
}