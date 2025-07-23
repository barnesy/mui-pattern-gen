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

type PreviewMessage = UpdatePropsMessage | UpdateThemeMessage;

function PatternPreviewApp() {
  const [component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [props, setProps] = useState<Record<string, any>>({});
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState<string | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Get component name from URL
  const params = new URLSearchParams(window.location.search);
  const componentName = params.get('component');

  // Create theme
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: themeMode === 'light' ? lightPalette : darkPalette,
        typography,
        spacing: 8,
        shape: {
          borderRadius: 4,
        },
      }),
    [themeMode]
  );

  // Load component
  useEffect(() => {
    if (!componentName) return;

    const loadComponent = async () => {
      try {
        const module = await import(`../patterns/pending/${componentName}.tsx`);
        const Component = module[componentName] || module.default;
        setComponent(() => Component);
        setError(null);
        
        // Notify parent that preview is ready
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
      } catch (err) {
        console.error('Failed to load component:', err);
        setError(`Failed to load component: ${componentName}`);
      }
    };

    loadComponent();
  }, [componentName]);

  // Listen for messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.data.type === 'UPDATE_PROPS') {
        setProps(event.data.props);
      } else if (event.data.type === 'UPDATE_THEME') {
        setThemeMode(event.data.theme);
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
  }, [props, themeMode, component]);

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
          bgcolor: 'background.default',
          p: 4,
          // Remove any potential margin collapse
          display: 'flow-root',
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