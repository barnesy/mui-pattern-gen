import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  IconButton,
  Tooltip,
  useMediaQuery,
  Grid,
  Portal,
} from '@mui/material';
import { 
  Pending, 
  CheckCircle,
  Smartphone,
  Tablet,
  Computer,
  Fullscreen,
  FullscreenExit,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { PatternPropsPanel, PropControl } from '../components/patterns/PatternPropsPanel';
import { IframePreview } from '../components/patterns/IframePreview';

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

export const PatternGenerator: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [patternConfig, setPatternConfig] = useState<PropControl[]>([]);
  const [context, setContext] = useState<PatternContext>({ current: null, category: null });
  const [error, setError] = useState<string | null>(null);
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});
  const [previewDevice, setPreviewDevice] = useState<string>('Desktop');
  const [previewWidth, setPreviewWidth] = useState<number>(1200);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(theme.palette.mode as 'light' | 'dark');
  
  // Track initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  const loadedComponentRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Load pattern config only
  const loadPattern = useCallback(async (componentName: string) => {
    if (loadedComponentRef.current === componentName) return;
    
    try {
      // Reset state when loading new component
      setIsInitialized(false);
      setComponentProps({});
      setError(null);
      loadedComponentRef.current = componentName;
      
      // Load config
      try {
        const configModule = await import(`../patterns/pending/${componentName}.config.ts`);
        const controls = configModule[`${componentName.charAt(0).toLowerCase() + componentName.slice(1)}Controls`] || [];
        setPatternConfig(controls);
        
        // Initialize props with defaults
        const defaults: Record<string, any> = {};
        controls.forEach((control: PropControl) => {
          if (control.defaultValue !== undefined) {
            defaults[control.name] = control.defaultValue;
          }
        });
        setComponentProps(defaults);
        setIsInitialized(true);
      } catch (configError) {
        // Config doesn't exist, but that's okay
        setPatternConfig([]);
        setIsInitialized(true);
      }
    } catch (importError) {
      setError('Failed to load pattern configuration');
      setIsInitialized(true);
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
            setPatternConfig([]);
            setComponentProps({});
            setIsInitialized(false);
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

  const handlePropChange = useCallback((name: string, value: any) => {
    setComponentProps(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleResetProps = useCallback(() => {
    const defaults: Record<string, any> = {};
    patternConfig.forEach((control) => {
      if (control.defaultValue !== undefined) {
        defaults[control.name] = control.defaultValue;
      }
    });
    setComponentProps(defaults);
  }, [patternConfig]);

  const handleDeviceChange = useCallback((event: React.MouseEvent<HTMLElement>, newDevice: string | null) => {
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

        <Grid container spacing={3}>
          {/* Preview Panel */}
          <Grid item xs={12} lg={patternConfig.length > 0 ? 8 : 12}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">Live Preview</Typography>
                  
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
                            {device.icon}
                          </Tooltip>
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>

                    {/* Theme Toggle */}
                    <Tooltip title={`Switch to ${previewTheme === 'light' ? 'dark' : 'light'} mode`}>
                      <IconButton
                        size="small"
                        onClick={() => setPreviewTheme(prev => prev === 'light' ? 'dark' : 'light')}
                      >
                        {previewTheme === 'light' ? <DarkMode /> : <LightMode />}
                      </IconButton>
                    </Tooltip>

                    {/* Fullscreen Toggle */}
                    <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                      <IconButton
                        size="small"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>
              
              <Box
                sx={{
                  flex: 1,
                  bgcolor: previewTheme === 'dark' ? 'grey.900' : 'grey.50',
                  position: isFullscreen ? 'fixed' : 'relative',
                  top: isFullscreen ? 0 : 'auto',
                  left: isFullscreen ? 0 : 'auto',
                  right: isFullscreen ? 0 : 'auto',
                  bottom: isFullscreen ? 0 : 'auto',
                  zIndex: isFullscreen ? theme.zIndex.modal : 'auto',
                  width: isFullscreen ? '100vw' : 'auto',
                  height: isFullscreen ? '100vh' : 'auto',
                  overflow: isFullscreen ? 'auto' : 'visible',
                }}
              >
                {context.current ? (
                  <IframePreview
                    componentName={context.current}
                    componentProps={componentProps}
                    theme={previewTheme}
                    width="100%"
                    isFullscreen={isFullscreen}
                  />
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">
                      Loading pattern...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Props Panel */}
          {patternConfig.length > 0 && (
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : 80 }}>
                <PatternPropsPanel
                  controls={patternConfig}
                  values={componentProps}
                  onChange={handlePropChange}
                  onReset={handleResetProps}
                />
              </Box>
            </Grid>
          )}
        </Grid>
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
      
      {/* Fullscreen exit button - rendered in a portal */}
      {isFullscreen && (
        <Portal>
          <Box
            sx={{
              position: 'fixed',
              top: 80, // Position below the header
              right: 16,
              zIndex: 9999,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 3,
            }}
          >
            <Tooltip title="Exit fullscreen (Esc)">
              <IconButton
                onClick={() => setIsFullscreen(false)}
                size="large"
                color="primary"
                sx={{ 
                  p: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <FullscreenExit fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>
        </Portal>
      )}
    </Box>
  );
};