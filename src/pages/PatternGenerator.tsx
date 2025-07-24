import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import { 
  Pending,
} from '@mui/icons-material';
import { withPatternWrapper } from '../utils/withPatternWrapper';

interface PatternContext {
  current: string | null;
  category: string | null;
}

// Component renderer with AI Design Mode support
const PatternRenderer: React.FC<{ 
  componentName: string; 
}> = ({ componentName }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const module = await import(/* @vite-ignore */ `../patterns/pending/${componentName}`);
        const OriginalComponent = module[componentName] || module.default;
        
        // Wrap with AI Design Mode support
        const WrappedComponent = withPatternWrapper(OriginalComponent, {
          patternName: componentName,
          status: 'pending',
          category: 'pending',
        });
        
        setComponent(() => WrappedComponent);
      } catch (err) {
        console.error(`Failed to load pattern ${componentName}:`, err);
        setError(`Failed to load ${componentName}`);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [componentName]);

  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (error) {
    return <Typography variant="body2" color="error">{error}</Typography>;
  }

  if (!Component) {
    return <Typography variant="body2" color="text.secondary">Component not found</Typography>;
  }

  return (
    <Suspense fallback={<CircularProgress size={24} />}>
      <Component />
    </Suspense>
  );
};

export const PatternGenerator: React.FC = () => {
  const [context, setContext] = useState<PatternContext>({ current: null, category: null });
  const [error, setError] = useState<string | null>(null);
  
  const loadedComponentRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initial load and periodic context check
  useEffect(() => {
    let mounted = true;
    
    const checkContext = async () => {
      if (!mounted) return;
      
      try {
        const response = await fetch('/src/patterns/pending/.context.json');
        if (!response.ok) {
          if (loadedComponentRef.current) {
            setContext({ current: null, category: null });
            loadedComponentRef.current = null;
          }
          return;
        }
        
        const data: PatternContext = await response.json();
        
        // Only update context if it actually changed
        setContext(prev => {
          if (prev.current !== data.current || prev.category !== data.category) {
            return data;
          }
          return prev;
        });
        
        // Update loaded component ref
        if (data.current !== loadedComponentRef.current) {
          loadedComponentRef.current = data.current;
        }
      } catch (err) {
        // Ignore errors to prevent console spam
      }
    };
    
    // Initial check
    checkContext();
    
    // Set up interval for context checks only
    intervalRef.current = setInterval(checkContext, 2000); // Check less frequently
    
    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const NoPendingPattern = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        textAlign: 'center',
        p: 4,
      }}
    >
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Tell Claude to generate a pattern...
      </Typography>
      
      <Box sx={{ mt: 4, mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, maxWidth: 600 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
          Current Context:
        </Typography>
        <Stack spacing={1} sx={{ textAlign: 'left' }}>
          <Typography variant="body2" color="text.secondary">
            • Using MUI v5 components
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • TypeScript with proper interfaces
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Theme-aware (light/dark mode)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Interactive prop controls included
          </Typography>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ maxWidth: 600 }}>
        <Typography variant="body2">
          <strong>Example prompts:</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          • "Generate a user profile card with avatar and social links"<br/>
          • "Create a login form with remember me option"<br/>
          • "Make a stats dashboard widget with chart"
        </Typography>
      </Alert>
    </Box>
  );

  const PendingPattern = () => {
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">
              Current Pattern: {context.current}
            </Typography>
            <Chip
              icon={<Pending />}
              label="Pending"
              color="warning"
              size="small"
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Location:</strong> src/patterns/pending/
            </Typography>
            {context.category && (
              <Typography variant="body2" color="text.secondary">
                <strong>Suggested Category:</strong> {context.category}
              </Typography>
            )}
          </Stack>
          
          <Alert severity="info" icon={false}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
              Tell Claude to:
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                • Update the pattern (e.g., "make the button larger")
              </Typography>
              <Typography variant="body2">
                • Approve as {context.category || '[category]'} pattern
              </Typography>
              <Typography variant="body2">
                • Reject and delete
              </Typography>
            </Stack>
          </Alert>
        </Paper>

        {/* Raw component display */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Click the pattern while AI Design Mode is active to customize it
          </Typography>
        </Box>
        
        {context.current && (
          <PatternRenderer componentName={context.current} />
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Pattern Generator
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {context.current ? <PendingPattern /> : <NoPendingPattern />}
    </Box>
  );
};