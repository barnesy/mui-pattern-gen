import React, { ReactNode, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AIDesignModeProvider, useAIDesignMode } from '../contexts/AIDesignModeContext';
import '../styles/aiDesignMode.css';

interface AIDesignThemeProviderProps {
  theme: Theme;
  children: ReactNode;
}

// Component that adds AI design mode event handlers for patterns only
const AIDesignModeInjector: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    isEnabled, 
    setHoveredPattern, 
    setSelectedPattern, 
    selectedPattern, 
    hoveredPattern,
    registerPatternInstance,
    unregisterPatternInstance 
  } = useAIDesignMode();

  // Add data attributes to pattern components when AI mode is enabled
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

    // Add data-ai-mode to pattern components only
    const updateDataAttributes = () => {
      document.querySelectorAll('[data-pattern-name]').forEach(el => {
        // Only set attribute if it doesn't already have it
        if (!el.hasAttribute('data-ai-mode')) {
          el.setAttribute('data-ai-mode', 'true');
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

  // Update selected/hovered attributes for patterns
  useEffect(() => {
    if (!isEnabled) return;

    // Clear all selected/hovered attributes
    document.querySelectorAll('[data-ai-selected], [data-ai-hovered]').forEach(el => {
      el.removeAttribute('data-ai-selected');
      el.removeAttribute('data-ai-hovered');
    });

    // Add selected attribute
    if (selectedPattern?.element) {
      selectedPattern.element.setAttribute('data-ai-selected', 'true');
    }

    // Add hovered attribute
    if (hoveredPattern?.element && hoveredPattern.element !== selectedPattern?.element) {
      hoveredPattern.element.setAttribute('data-ai-hovered', 'true');
    }
  }, [isEnabled, selectedPattern, hoveredPattern]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip if hovering over AI-ignore elements or any MUI overlay component
      if (target.closest('[data-ai-ignore="true"]')) {
        setHoveredPattern(null);
        return;
      }
      
      // Check if hover is on a MUI portal/overlay
      const isPortalHover = !!(
        target.closest('.MuiPopper-root') ||
        target.closest('.MuiModal-root') ||
        target.closest('[role="presentation"]')
      );
      
      if (isPortalHover) {
        return; // Don't change hover state for portal elements
      }
      
      const patternElement = target.closest('[data-pattern-name]') as HTMLElement;
      
      if (patternElement) {
        const patternInfo = extractPatternInfo(patternElement);
        if (patternInfo) {
          setHoveredPattern({
            ...patternInfo,
            element: patternElement,
            rect: patternElement.getBoundingClientRect(),
          });
        }
      } else {
        setHoveredPattern(null);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!relatedTarget || !relatedTarget.closest('[data-pattern-name]')) {
        setHoveredPattern(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip if clicking on AI-ignore elements or any MUI overlay component
      if (target.closest('[data-ai-ignore="true"]')) {
        return;
      }
      
      // Check if click is from a MUI portal/overlay (Select dropdown, Menu, etc)
      const isPortalClick = !!(
        target.closest('.MuiPopper-root') ||
        target.closest('.MuiModal-root') ||
        target.closest('[role="presentation"]') ||
        // Select dropdowns often have this structure
        (target.closest('.MuiPaper-root') && !target.closest('[data-pattern-name]'))
      );
      
      if (isPortalClick) {
        return;
      }
      
      // First check for sub-component selection
      const subComponentElement = target.closest('[data-subcomponent-id]') as HTMLElement;
      if (subComponentElement) {
        e.preventDefault();
        e.stopPropagation();
        
        const subComponentId = subComponentElement.getAttribute('data-subcomponent-id');
        const subComponentName = subComponentElement.getAttribute('data-subcomponent-name') || '';
        const subComponentType = subComponentElement.getAttribute('data-subcomponent-type') || '';
        const parentInstanceId = subComponentElement.getAttribute('data-parent-instance') || '';
        const propsAttr = subComponentElement.getAttribute('data-subcomponent-props');
        
        let props = {};
        try {
          if (propsAttr) {
            props = JSON.parse(propsAttr);
          }
        } catch (err) {
          console.error('Failed to parse sub-component props:', err);
        }
        
        // Set selected pattern with sub-component info
        setSelectedPattern({
          name: subComponentName,
          status: 'subcomponent' as any,
          category: subComponentType,
          instanceId: subComponentId,
          parentInstanceId,
          props,
          element: subComponentElement,
          rect: subComponentElement.getBoundingClientRect(),
          isSubComponent: true,
        });
        
        setSelectedInstanceId(subComponentId);
        return;
      }
      
      const patternElement = target.closest('[data-pattern-name]') as HTMLElement;
      
      if (patternElement) {
        e.preventDefault();
        e.stopPropagation();
        
        const patternInfo = extractPatternInfo(patternElement);
        if (patternInfo) {
          setSelectedPattern({
            ...patternInfo,
            element: patternElement,
            rect: patternElement.getBoundingClientRect(),
          });
        }
      } else {
        // Click on non-pattern component clears selection
        setSelectedPattern(null);
      }
    };

    // Extract pattern information from element
    const extractPatternInfo = (element: HTMLElement) => {
      const patternName = element.getAttribute('data-pattern-name');
      const status = element.getAttribute('data-pattern-status') as 'pending' | 'accepted';
      const category = element.getAttribute('data-pattern-category') || '';
      const instanceId = element.getAttribute('data-pattern-instance') || '';
      const propsStr = element.getAttribute('data-pattern-props');
      
      if (!patternName) return null;

      let props = {};
      try {
        props = propsStr ? JSON.parse(propsStr) : {};
      } catch (e) {
        console.error('Failed to parse pattern props:', e);
      }

      // Determine if pattern has config
      const hasConfig = status === 'pending' || category !== 'pending';
      const configPath = status === 'pending' 
        ? `../patterns/pending/${patternName}.config`
        : `../patterns/${category}/${patternName}.config`;

      return {
        name: patternName,
        status,
        category,
        instanceId,
        props,
        hasConfig,
        configPath,
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
  }, [isEnabled, setHoveredPattern, setSelectedPattern]);

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
        </AIDesignModeInjector>
      </AIDesignModeProvider>
    </MUIThemeProvider>
  );
};