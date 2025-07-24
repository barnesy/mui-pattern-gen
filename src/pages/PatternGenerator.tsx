import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  useTheme,
  Alert,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Grid,
  CircularProgress,
} from '@mui/material';
import { 
  Pending,
  Smartphone,
  Tablet,
  Computer,
} from '@mui/icons-material';
import { SettingControl } from '../components/patterns/SettingsPanel';
import { withPatternWrapper } from '../utils/withPatternWrapper';

interface PatternContext {
  current: string | null;
  category: string | null;
}

interface DevicePreset {
  name: string;
  width: number;
  icon: React.ReactNode;
}

const devicePresets: DevicePreset[] = [
  { name: 'Mobile', width: 375, icon: <Smartphone /> },
  { name: 'Tablet', width: 768, icon: <Tablet /> },
  { name: 'Desktop', width: 1200, icon: <Computer /> },
];

// Generate variations based on control configuration
const generateVariations = (controls: SettingControl[]): Array<{name: string; props: Record<string, any>}> => {
  const variations: Array<{name: string; props: Record<string, any>}> = [];
  
  // Get defaults
  const defaults: Record<string, any> = {};
  controls.forEach(control => {
    if (control.defaultValue !== undefined) {
      defaults[control.name] = control.defaultValue;
    }
  });
  
  // Always include default variation
  variations.push({ name: 'Default', props: { ...defaults } });
  
  // Add variations for each variant type
  const variantControl = controls.find(c => c.type === 'variant');
  if (variantControl && variantControl.options) {
    variantControl.options.forEach(option => {
      if (option.value !== variantControl.defaultValue) {
        variations.push({
          name: option.label,
          props: { ...defaults, variant: option.value }
        });
      }
    });
  }
  
  // Add variations for boolean controls
  const booleanControls = controls.filter(c => c.type === 'boolean' && !c.isContent);
  booleanControls.forEach(control => {
    const oppositeValue = !control.defaultValue;
    variations.push({
      name: `${control.label}: ${oppositeValue ? 'On' : 'Off'}`,
      props: { ...defaults, [control.name]: oppositeValue }
    });
  });
  
  // Add variations for select controls with notable options
  const selectControls = controls.filter(c => c.type === 'select' && !c.isContent);
  selectControls.forEach(control => {
    if (control.options && control.options.length > 1) {
      const altOption = control.options.find(o => o.value !== control.defaultValue);
      if (altOption) {
        variations.push({
          name: `${control.label}: ${altOption.label}`,
          props: { ...defaults, [control.name]: altOption.value }
        });
      }
    }
  });
  
  // Limit to reasonable number of variations
  return variations.slice(0, 9);
};

// Component renderer with AI Design Mode support
const PatternRenderer: React.FC<{ 
  componentName: string; 
  componentProps: Record<string, any>;
  previewWidth?: number;
}> = ({ componentName, componentProps, previewWidth }) => {
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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="error">{error}</Typography>
      </Box>
    );
  }

  if (!Component) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">Component not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: previewWidth ? `${previewWidth}px` : '100%', mx: 'auto' }}>
      <Suspense fallback={<CircularProgress size={24} />}>
        <Component {...componentProps} />
      </Suspense>
    </Box>
  );
};

export const PatternGenerator: React.FC = () => {
  const theme = useTheme();
  const [context, setContext] = useState<PatternContext>({ current: null, category: null });
  const [error, setError] = useState<string | null>(null);
  const [componentVariations, setComponentVariations] = useState<Array<{name: string; props: Record<string, any>}>>([]);
  const [previewDevice, setPreviewDevice] = useState<string>('Desktop');
  const [previewWidth, setPreviewWidth] = useState<number>(1200);
  
  const loadedComponentRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Load pattern config only
  const loadPattern = useCallback(async (componentName: string) => {
    if (loadedComponentRef.current === componentName) return;
    
    try {
      // Reset state when loading new component
      setComponentVariations([]);
      setError(null);
      loadedComponentRef.current = componentName;
      
      // Load config
      try {
        const configModule = await import(/* @vite-ignore */ `../patterns/pending/${componentName}.config`);
        const controls = configModule[`${componentName.charAt(0).toLowerCase() + componentName.slice(1)}Controls`] || [];
        
        // Generate variations based on control types
        const variations = generateVariations(controls);
        setComponentVariations(variations);
      } catch (configError) {
        // Config doesn't exist, show single default variation
        setComponentVariations([{ name: 'Default', props: {} }]);
      }
    } catch (importError) {
      setError('Failed to load pattern configuration');
    }
  }, []);

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
            setComponentVariations([]);
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
        
        // Load pattern if we have a new one
        if (data.current && data.current !== loadedComponentRef.current) {
          await loadPattern(data.current);
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
  }, [loadPattern]);

  const handleDeviceChange = useCallback((_event: React.MouseEvent<HTMLElement>, newDevice: string | null) => {
    if (newDevice) {
      setPreviewDevice(newDevice);
      const preset = devicePresets.find(d => d.name === newDevice);
      if (preset) {
        setPreviewWidth(preset.width);
      }
    }
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

  const VariationPreview = React.memo(({ variation }: { variation: { name: string; props: Record<string, any> } }) => {
    if (!context.current) return null;

    return (
      <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" noWrap>{variation.name}</Typography>
        </Box>
        <Box sx={{ flex: 1, p: 2, overflow: 'auto', minHeight: 300 }}>
          <PatternRenderer
            componentName={context.current}
            componentProps={variation.props}
          />
        </Box>
      </Paper>
    );
  });

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

        <Box>
          <Box sx={{ p: 2, mb: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Pattern Variations</Typography>
              
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Device Selection */}
                <ToggleButtonGroup
                  value={previewDevice}
                  exclusive
                  onChange={handleDeviceChange}
                  size="small"
                >
                  {devicePresets.map((device) => (
                    <ToggleButton key={device.name} value={device.name}>
                      <Tooltip title={device.name}>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                          {device.icon}
                        </Box>
                      </Tooltip>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Box>

          {componentVariations.length === 1 ? (
            // Single component display
            <Box sx={{ maxWidth: previewWidth, mx: 'auto' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Click the pattern while AI Design Mode is active to customize it
              </Typography>
              <Box sx={{ mt: 2 }}>
                <PatternRenderer
                  componentName={context.current!}
                  componentProps={componentVariations[0].props}
                  previewWidth={previewWidth}
                />
              </Box>
            </Box>
          ) : (
            // Multiple variations grid
            <Grid container spacing={3}>
              {componentVariations.map((variation, index) => (
                <Grid item key={index} xs={12} md={6} lg={4}>
                  <VariationPreview variation={variation} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
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