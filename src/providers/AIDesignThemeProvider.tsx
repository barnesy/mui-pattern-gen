import React, { ReactNode, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AIDesignModeProvider, useAIDesignMode } from '../contexts/AIDesignModeContext';
import { AIDesignModeOverlay } from '../components/AIDesignMode/AIDesignModeOverlay';
import { generateComponentReference, getDisplayReference, getGridPosition } from '../utils/componentReference';
import '../styles/aiDesignMode.css';

interface AIDesignThemeProviderProps {
  theme: Theme;
  children: ReactNode;
}

// Component that adds AI design mode event handlers
const AIDesignModeInjector: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isEnabled, setHoveredComponent, setSelectedComponent, selectedComponent, hoveredComponent } = useAIDesignMode();

  // Add data attributes to all MUI components when AI mode is enabled
  useEffect(() => {
    if (!isEnabled) {
      // Clean up data attributes when disabled
      document.querySelectorAll('[data-ai-mode]').forEach(el => {
        el.removeAttribute('data-ai-mode');
        el.removeAttribute('data-ai-selected');
        el.removeAttribute('data-ai-hovered');
      });
      return;
    }

    // Add data-ai-mode to all MUI components except AppBar and selection controls
    const updateDataAttributes = () => {
      document.querySelectorAll('[class*="Mui"]').forEach(el => {
        // Skip if element is AppBar or inside AppBar
        if (!el.classList.contains('MuiAppBar-root') && 
            !el.classList.contains('MuiToolbar-root') &&
            !el.closest('.MuiAppBar-root') &&
            // Skip selection controls
            !el.classList.contains('MuiCheckbox-root') &&
            !el.classList.contains('MuiRadio-root') &&
            !el.classList.contains('MuiSwitch-root') &&
            !el.classList.contains('MuiFormControlLabel-root')) {
          // Only set attribute if it doesn't already have it
          if (!el.hasAttribute('data-ai-mode')) {
            el.setAttribute('data-ai-mode', 'true');
          }
        }
      });
    };

    updateDataAttributes();
    
    // Update on DOM changes with debouncing
    let updateTimeout: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(updateDataAttributes, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(updateTimeout);
      observer.disconnect();
    };
  }, [isEnabled]);

  // Update selected/hovered attributes
  useEffect(() => {
    if (!isEnabled) return;

    // Clear all selected/hovered attributes
    document.querySelectorAll('[data-ai-selected], [data-ai-hovered]').forEach(el => {
      el.removeAttribute('data-ai-selected');
      el.removeAttribute('data-ai-hovered');
    });

    // Add selected attribute
    if (selectedComponent?.element) {
      selectedComponent.element.setAttribute('data-ai-selected', 'true');
    }

    // Add hovered attribute
    if (hoveredComponent?.element && hoveredComponent.element !== selectedComponent?.element) {
      hoveredComponent.element.setAttribute('data-ai-hovered', 'true');
    }
  }, [isEnabled, selectedComponent, hoveredComponent]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip if we're over any overlay element, ignored element, or the AppBar
      if (target.closest('[data-ai-ignore="true"], .debug-panel, .MuiPopper-root, .MuiTooltip-popper, .MuiModal-root, [role="tooltip"], [role="dialog"], [aria-label="toggle AI Design Mode"], .MuiAppBar-root')) {
        setHoveredComponent(null);
        return;
      }
      
      // Also skip if we're over the AI overlay itself
      if (target.closest('[style*="z-index: 9999"]')) {
        return;
      }
      
      const muiComponent = findMUIComponent(target);
      
      if (muiComponent && !muiComponent.closest('[aria-label="toggle AI Design Mode"]') && !muiComponent.closest('.MuiAppBar-root')) {
        const componentInfo = extractComponentInfo(muiComponent);
        if (componentInfo) {
          setHoveredComponent({
            ...componentInfo,
            element: muiComponent,
            rect: muiComponent.getBoundingClientRect(),
          });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!relatedTarget || !findMUIComponent(relatedTarget)) {
        setHoveredComponent(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip if clicking on overlay elements, ignored elements, or the AppBar
      if (target.closest('[data-ai-ignore="true"], .debug-panel, .MuiPopper-root, .MuiTooltip-popper, .MuiModal-root, [role="tooltip"], [role="dialog"], [aria-label="toggle AI Design Mode"], .MuiAppBar-root')) {
        return;
      }
      
      // Also skip if clicking on the AI overlay itself
      if (target.closest('[style*="z-index: 9999"]')) {
        return;
      }
      
      const muiComponent = findMUIComponent(target);
      
      if (muiComponent) {
        // Don't select the AI toggle FAB or components in the AppBar
        if (muiComponent.closest('[aria-label="toggle AI Design Mode"]') || muiComponent.closest('.MuiAppBar-root')) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const componentInfo = extractComponentInfo(muiComponent);
        if (componentInfo) {
          setSelectedComponent({
            ...componentInfo,
            element: muiComponent,
            rect: muiComponent.getBoundingClientRect(),
          });
        }
      } else {
        // Click on non-MUI component clears selection
        setSelectedComponent(null);
      }
    };

    // Find MUI component by looking for MUI class names
    const findMUIComponent = (element: HTMLElement): HTMLElement | null => {
      let current: HTMLElement | null = element;
      
      // Skip structural and overlay components
      const skipComponents = [
        'MuiAppBar',
        'MuiToolbar', 
        'MuiDrawer',
        'MuiContainer',
        'MuiGrid',
        'MuiBox',
        'MuiStack',
        'MuiDivider',
        'MuiList',
        'MuiPopper',
        'MuiTooltip',
        'MuiModal',
        'MuiBackdrop',
        'MuiDialog',
        'MuiPopover',
        'MuiMenu',
        'MuiSnackbar',
        // Skip selection controls to prevent layout issues
        'MuiCheckbox',
        'MuiRadio',
        'MuiSwitch',
        'MuiFormControlLabel',
      ];
      
      while (current && current !== document.body) {
        const classList = Array.from(current.classList);
        const muiClass = classList.find(className => className.startsWith('Mui'));
        
        if (muiClass) {
          // Skip if it's a component we should ignore
          const shouldSkip = skipComponents.some(comp => 
            classList.some(cls => cls.startsWith(comp))
          );
          
          if (!shouldSkip) {
            return current;
          }
        }
        
        // Also check for common MUI component patterns
        const role = current.getAttribute('role');
        if (role && ['button', 'navigation', 'presentation', 'tablist', 'tab'].includes(role)) {
          // Check if it has MUI styling
          const computedStyle = window.getComputedStyle(current);
          if (computedStyle.fontFamily?.includes('Roboto') || 
              computedStyle.fontFamily?.includes('DM Sans') ||
              current.querySelector('[class*="Mui"]')) {
            return current;
          }
        }
        
        current = current.parentElement;
      }
      
      return null;
    };

    // Extract component information from element
    const extractComponentInfo = (element: HTMLElement) => {
      const classList = Array.from(element.classList);
      const muiClass = classList.find(className => className.startsWith('Mui'));
      
      if (!muiClass) return null;

      // Extract component name from class (e.g., MuiButton-root -> Button)
      let componentName = muiClass.replace(/^Mui/, '').replace(/-.*$/, '');
      
      // Special handling for icons
      if (componentName === 'SvgIcon') {
        // Try to get the actual icon name from data attributes or parent elements
        const titleElement = element.querySelector('title');
        if (titleElement && titleElement.textContent) {
          componentName = titleElement.textContent;
        } else {
          // Check for parent button or icon button
          const parentButton = element.closest('.MuiIconButton-root, .MuiFab-root');
          if (parentButton) {
            componentName = parentButton.classList.contains('MuiFab-root') ? 'Fab' : 'IconButton';
            return extractComponentInfo(parentButton as HTMLElement);
          }
        }
      }
      
      // Extract props from data attributes and classes
      const props: Record<string, any> = {};
      
      // Check for common MUI props
      if (element.hasAttribute('disabled')) props.disabled = true;
      if (classList.includes('Mui-disabled')) props.disabled = true;
      if (classList.includes('Mui-error')) props.error = true;
      if (classList.includes('Mui-focused')) props.focused = true;
      
      // Extract variant, size, color from classes
      const variantMatch = classList.find(c => c.includes('-variant'));
      if (variantMatch) {
        const variant = variantMatch.split('-').pop();
        props.variant = variant;
      }
      
      const sizeMatch = classList.find(c => c.includes('size') && c.includes(componentName));
      if (sizeMatch) {
        const size = sizeMatch.split('size').pop()?.toLowerCase();
        props.size = size;
      }
      
      const colorMatch = classList.find(c => c.includes('color') && c.includes(componentName));
      if (colorMatch) {
        const color = colorMatch.split('color').pop()?.toLowerCase();
        props.color = color;
      }

      // Get text content for certain components
      if (['Button', 'Chip', 'Typography'].includes(componentName)) {
        props.children = element.textContent;
      }

      // Generate reference info
      const referenceInfo = generateComponentReference(element, componentName, props);
      const displayReference = getDisplayReference(componentName, props, referenceInfo.path);
      const gridPosition = getGridPosition(element);

      return {
        name: componentName,
        props,
        variant: props.variant,
        size: props.size,
        color: props.color,
        reference: referenceInfo.fullReference,
        displayReference,
        gridPosition,
      };
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isEnabled, setHoveredComponent, setSelectedComponent]);

  return <>{children}</>;
};

// Main provider component
export const AIDesignThemeProvider: React.FC<AIDesignThemeProviderProps> = ({ 
  theme, 
  children 
}) => {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <AIDesignModeProvider>
        <AIDesignModeInjector>
          {children}
          <AIDesignModeOverlay />
        </AIDesignModeInjector>
      </AIDesignModeProvider>
    </MUIThemeProvider>
  );
};