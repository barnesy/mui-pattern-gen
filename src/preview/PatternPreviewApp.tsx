import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { palette as lightPalette } from '../theme/palette';
import { darkPalette } from '../theme/darkPalette';
import { typography } from '../theme/typography';

// Message types
interface UpdatePropsMessage {
  type: 'UPDATE_PROPS';
  props: Record<string, any>;
}

interface UpdateThemeMessage {
  type: 'UPDATE_THEME';
  theme: 'light' | 'dark';
}

interface UpdateDensityMessage {
  type: 'UPDATE_DENSITY';
  density: 'comfortable' | 'compact' | 'spacious';
}

type PreviewMessage = UpdatePropsMessage | UpdateThemeMessage | UpdateDensityMessage;

function PatternPreviewApp() {
  const [component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [props, setProps] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Get component name, path, and initial theme from URL
  const params = new URLSearchParams(window.location.search);
  const componentName = params.get('component');
  const componentPath = params.get('path');
  const initialTheme = params.get('theme') as 'light' | 'dark' || 'light';
  
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(initialTheme);
  const [density, setDensity] = useState<'comfortable' | 'compact' | 'spacious'>('comfortable');

  // Create theme with density
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: themeMode === 'light' ? lightPalette : darkPalette,
        typography,
        spacing: density === 'compact' ? 6 : density === 'spacious' ? 10 : 8,
        shape: {
          borderRadius: 4,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                padding: density === 'compact' ? '4px 12px' : 
                        density === 'spacious' ? '8px 20px' : 
                        '6px 16px',
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              size: density === 'compact' ? 'small' : 'medium',
            },
          },
          MuiSelect: {
            defaultProps: {
              size: density === 'compact' ? 'small' : 'medium',
            },
          },
          MuiChip: {
            defaultProps: {
              size: density === 'compact' ? 'small' : 'medium',
            },
          },
          MuiIconButton: {
            defaultProps: {
              size: density === 'compact' ? 'small' : 'medium',
            },
          },
        },
      }),
    [themeMode, density]
  );

  // Remove any background colors to let parent control styling
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
  }, []);

  // Load component
  useEffect(() => {
    if (!componentName) return;

    const loadComponent = async () => {
      try {
        let module;
        
        if (componentPath) {
          // Try the provided path
          try {
            module = await import(/* @vite-ignore */ componentPath);
          } catch (err) {
            // If custom path fails, try default pending path
            console.warn(`Failed to load from ${componentPath}, trying pending directory`);
            module = await import(`../patterns/pending/${componentName}.tsx`);
          }
        } else {
          // Default to pending directory
          module = await import(`../patterns/pending/${componentName}.tsx`);
        }
        
        const Component = module[componentName] || module.default;
        setComponent(() => Component);
        setError(null);
        
        // Notify parent that preview is ready
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
      } catch (err) {
        console.error('Failed to load component:', err);
        setError(`Component "${componentName}" not found`);
        // Still notify parent that we're ready (even with error)
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
      }
    };

    loadComponent();
  }, [componentName, componentPath]);

  // Listen for messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.data.type === 'UPDATE_PROPS') {
        setProps(event.data.props);
      } else if (event.data.type === 'UPDATE_THEME') {
        setThemeMode(event.data.theme);
      } else if (event.data.type === 'UPDATE_DENSITY') {
        setDensity(event.data.density);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Report content height changes
  useEffect(() => {
    const reportHeight = () => {
      // Try multiple methods to get the most accurate height
      const heights = [];
      
      if (contentRef.current) {
        heights.push(contentRef.current.getBoundingClientRect().height);
        heights.push(contentRef.current.offsetHeight);
      }
      
      // Also check document body height
      heights.push(document.body.scrollHeight);
      heights.push(document.body.offsetHeight);
      heights.push(document.documentElement.scrollHeight);
      heights.push(document.documentElement.offsetHeight);
      
      // Use the maximum height found
      const height = Math.ceil(Math.max(...heights));
      window.parent.postMessage({ type: 'CONTENT_HEIGHT', height }, '*');
    };

    // Report initial height after a brief delay to ensure layout is complete
    const initialTimer = setTimeout(reportHeight, 50);

    // Use ResizeObserver to detect height changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(reportHeight);
    });
    
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    // Also report on prop/theme changes after a brief delay
    const timer = setTimeout(reportHeight, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
      clearTimeout(initialTimer);
    };
  }, [props, themeMode, component, density]);

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
        {error}
      </Box>
    );
  }

  if (!component) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        Loading preview...
      </Box>
    );
  }

  const Component = component;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        ref={contentRef}
        sx={{
          bgcolor: 'transparent',
          p: 4,
          // Remove any potential margin collapse
          display: 'flow-root',
          minHeight: '100vh',
        }}
      >
        <Component {...props} />
      </Box>
    </ThemeProvider>
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<PatternPreviewApp />);