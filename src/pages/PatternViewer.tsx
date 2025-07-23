import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Paper,
  Alert,
  Tab,
  Tabs,
  Badge,
  useTheme,
  alpha,
  Divider,
  useMediaQuery,
  Modal,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Computer as ComputerIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { IframePreview } from '../components/patterns/IframePreview';
import { PatternPropsPanel, PropControl } from '../components/patterns/PatternPropsPanel';

interface Pattern {
  name: string;
  category: string;
  status: 'pending' | 'accepted';
  description?: string;
  hasConfig?: boolean;
}

const categories = [
  { id: 'all', label: 'All', color: 'default' },
  { id: 'auth', label: 'Authentication', color: 'primary' },
  { id: 'cards', label: 'Cards', color: 'secondary' },
  { id: 'forms', label: 'Forms', color: 'success' },
  { id: 'navigation', label: 'Navigation', color: 'info' },
  { id: 'lists', label: 'Lists', color: 'warning' },
  { id: 'dashboards', label: 'Dashboards', color: 'error' },
];

interface DevicePreset {
  name: string;
  width: number;
  icon: React.ReactNode;
}

const devicePresets: DevicePreset[] = [
  { name: 'Mobile', width: 375, icon: <SmartphoneIcon /> },
  { name: 'Tablet', width: 768, icon: <TabletIcon /> },
  { name: 'Desktop', width: 1200, icon: <ComputerIcon /> },
];

export const PatternViewer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingContext, setPendingContext] = useState<any>(null);
  const [previewDevice, setPreviewDevice] = useState<string>('Desktop');
  const [previewWidth, setPreviewWidth] = useState<number>(1200);
  const [selectedVariant, setSelectedVariant] = useState<string>('default');
  const [variantOptions, setVariantOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [patternConfig, setPatternConfig] = useState<PropControl[]>([]);
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});
  const [configLoading, setConfigLoading] = useState(false);

  // Handle Escape key to close preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPattern) {
        setSelectedPattern(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPattern]);

  // Load patterns from file system
  useEffect(() => {
    const loadPatterns = async () => {
      setLoading(true);
      const allPatterns: Pattern[] = [];
      
      // Load pending patterns
      try {
        const contextResponse = await fetch('/src/patterns/pending/.context.json');
        const context = await contextResponse.json();
        setPendingContext(context);
        
        // For demo, add current pending patterns
        if (context.current) {
          allPatterns.push({
            name: context.current,
            category: context.category || 'pending',
            status: 'pending',
            description: 'Currently being worked on',
            hasConfig: true,
          });
        }
        
        // List of pending patterns - KEEP THIS UPDATED when patterns are added/removed
        // This should match the actual files in src/patterns/pending/
        const pendingPatterns = [
          'PageHeader',
          'LabelValuePair',
        ];
        
        pendingPatterns.forEach(pattern => {
          if (pattern !== context.current) {
            allPatterns.push({
              name: pattern,
              category: 'pending',
              status: 'pending',
              hasConfig: true,
            });
          }
        });
      } catch (error) {
        console.error('Error loading pending patterns:', error);
      }
      
      // Load accepted patterns from categories
      // IMPORTANT: Keep this updated when approving/rejecting patterns
      // Each array should contain the exact component names that exist in that category
      const acceptedPatterns: Record<string, string[]> = {
        auth: [],              // Login forms, registration, password reset, 2FA
        cards: [],             // User profiles, product cards, info cards, stats cards
        forms: [],             // Contact forms, multi-step forms, search forms, filters
        navigation: [],        // Headers, sidebars, breadcrumbs, menus, tabs
        lists: [],             // Data tables, list items, grids, galleries
        dashboards: [],        // Stats widgets, charts, analytics, KPIs
      };
      
      Object.entries(acceptedPatterns).forEach(([category, patternList]) => {
        patternList.forEach(pattern => {
          allPatterns.push({
            name: pattern,
            category,
            status: 'accepted',
            hasConfig: true,
          });
        });
      });
      
      setPatterns(allPatterns);
      setLoading(false);
    };
    
    loadPatterns();
  }, []);

  // Filter patterns based on search, category, and status
  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || pattern.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Count patterns by status
  const pendingCount = patterns.filter(p => p.status === 'pending').length;
  const acceptedCount = patterns.filter(p => p.status === 'accepted').length;

  const handleViewPattern = async (pattern: Pattern) => {
    setSelectedPattern(pattern);
    setSelectedVariant('default');
    setVariantOptions([]);
    setConfigLoading(true);
    setPatternConfig([]);
    setComponentProps({});
    
    // Try to load pattern config
    try {
      const configPath = pattern.status === 'pending'
        ? `../patterns/pending/${pattern.name}.config`
        : `../patterns/${pattern.category}/${pattern.name}.config`;
      
      try {
        const configModule = await import(configPath);
        const controlsKey = `${pattern.name.charAt(0).toLowerCase() + pattern.name.slice(1)}Controls`;
        const controls = configModule[controlsKey] || [];
        setPatternConfig(controls);
        
        // Initialize props with defaults
        const defaults: Record<string, any> = {};
        controls.forEach((control: PropControl) => {
          if (control.defaultValue !== undefined) {
            defaults[control.name] = control.defaultValue;
          }
        });
        setComponentProps(defaults);
        
        // Extract variant options
        const variantControl = controls.find((c: PropControl) => c.type === 'variant');
        if (variantControl && variantControl.options) {
          setVariantOptions(variantControl.options);
          if (variantControl.defaultValue) {
            setSelectedVariant(variantControl.defaultValue);
          }
        }
      } catch (importError) {
        // Config doesn't exist, but that's okay
        console.log('No config file found for pattern:', pattern.name);
        setPatternConfig([]);
      }
    } catch (error) {
      console.error('Error loading pattern config:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleDeviceChange = (_event: React.MouseEvent<HTMLElement>, newDevice: string | null) => {
    if (newDevice) {
      setPreviewDevice(newDevice);
      const preset = devicePresets.find(d => d.name === newDevice);
      if (preset) {
        setPreviewWidth(preset.width);
      }
    }
  };

  const handlePropChange = useCallback((name: string, value: any) => {
    setComponentProps(prev => ({ ...prev, [name]: value }));
    // Update variant if it's the variant control
    if (name === 'variant') {
      setSelectedVariant(value);
    }
  }, []);

  const handleResetProps = useCallback(() => {
    const defaults: Record<string, any> = {};
    patternConfig.forEach((control) => {
      if (control.defaultValue !== undefined) {
        defaults[control.name] = control.defaultValue;
      }
    });
    setComponentProps(defaults);
    // Reset variant
    const variantControl = patternConfig.find(c => c.type === 'variant');
    if (variantControl && variantControl.defaultValue) {
      setSelectedVariant(variantControl.defaultValue);
    }
  }, [patternConfig]);

  const PatternCard = ({ pattern }: { pattern: Pattern }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderColor: pattern.status === 'pending' ? 'warning.main' : 'divider',
        borderWidth: pattern.status === 'pending' ? 2 : 1,
      }}
      variant="outlined"
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" component="div">
            {pattern.name}
          </Typography>
          <Chip
            icon={pattern.status === 'pending' ? <PendingIcon /> : <CheckIcon />}
            label={pattern.status}
            size="small"
            color={pattern.status === 'pending' ? 'warning' : 'success'}
            variant="outlined"
          />
        </Stack>
        
        <Stack direction="row" spacing={1} mb={2}>
          <Chip 
            label={pattern.category} 
            size="small" 
            color={categories.find(c => c.id === pattern.category)?.color as any || 'default'}
          />
          {pattern.hasConfig && (
            <Chip label="Interactive" size="small" variant="outlined" />
          )}
        </Stack>
        
        {pattern.description && (
          <Typography variant="body2" color="text.secondary">
            {pattern.description}
          </Typography>
        )}
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          startIcon={<VisibilityIcon />}
          onClick={() => handleViewPattern(pattern)}
          fullWidth
        >
          Preview
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pattern Library
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Tabs 
              value={statusFilter} 
              onChange={(_, value) => setStatusFilter(value)}
              variant="fullWidth"
            >
              <Tab 
                label={
                  <Badge badgeContent={patterns.length} color="primary">
                    All
                  </Badge>
                } 
                value="all" 
              />
              <Tab 
                label={
                  <Badge badgeContent={pendingCount} color="warning">
                    Pending
                  </Badge>
                } 
                value="pending" 
              />
              <Tab 
                label={
                  <Badge badgeContent={acceptedCount} color="success">
                    Accepted
                  </Badge>
                } 
                value="accepted" 
              />
            </Tabs>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, value) => value && setViewMode(value)}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModuleIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {categories.map(category => (
            <Chip
              key={category.id}
              label={category.label}
              onClick={() => setSelectedCategory(category.id)}
              color={selectedCategory === category.id ? category.color as any : 'default'}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      </Box>

      {loading ? (
        <Alert severity="info">Loading patterns...</Alert>
      ) : filteredPatterns.length === 0 ? (
        <Alert severity="warning">No patterns found matching your criteria.</Alert>
      ) : (
        <Grid container spacing={3}>
          {viewMode === 'grid' ? (
            filteredPatterns.map(pattern => (
              <Grid item xs={12} sm={6} md={4} key={pattern.name}>
                <PatternCard pattern={pattern} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Stack spacing={2}>
                {filteredPatterns.map(pattern => (
                  <Paper key={pattern.name} sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box flex={1}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="h6">{pattern.name}</Typography>
                          <Chip
                            icon={pattern.status === 'pending' ? <PendingIcon /> : <CheckIcon />}
                            label={pattern.status}
                            size="small"
                            color={pattern.status === 'pending' ? 'warning' : 'success'}
                            variant="outlined"
                          />
                          <Chip 
                            label={pattern.category} 
                            size="small" 
                            color={categories.find(c => c.id === pattern.category)?.color as any || 'default'}
                          />
                        </Stack>
                      </Box>
                      <Button 
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewPattern(pattern)}
                        variant="contained"
                      >
                        Preview
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      )}

      {/* Pattern Preview Modal */}
      <Modal
        open={!!selectedPattern}
        onClose={() => setSelectedPattern(null)}
        sx={{
          zIndex: 10000, // Ensure it's on top of everything
        }}
      >
        {selectedPattern ? (
          <Paper
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            p: 0,
            borderRadius: 0, // Remove rounded corners for fullscreen
            display: 'flex',
            flexDirection: 'column',
            outline: 'none', // Remove focus outline from modal
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h5">{selectedPattern.name}</Typography>
                <Chip
                  label={selectedPattern.category}
                  size="small"
                  color={categories.find(c => c.id === selectedPattern.category)?.color as any || 'default'}
                />
                <Chip
                  icon={selectedPattern.status === 'pending' ? <PendingIcon /> : <CheckIcon />}
                  label={selectedPattern.status}
                  size="small"
                  color={selectedPattern.status === 'pending' ? 'warning' : 'success'}
                  variant="outlined"
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                {!isMobile && variantOptions.length > 0 && (
                  <>
                    <ToggleButtonGroup
                      value={selectedVariant}
                      exclusive
                      onChange={(_, value) => value && setSelectedVariant(value)}
                      size="small"
                    >
                      {variantOptions.map((variant) => (
                        <ToggleButton key={variant.value} value={variant.value}>
                          {variant.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <Divider orientation="vertical" flexItem />
                  </>
                )}
                <ToggleButtonGroup
                  value={previewDevice}
                  exclusive
                  onChange={handleDeviceChange}
                  size="small"
                >
                  {devicePresets.map((device) => (
                    <ToggleButton key={device.name} value={device.name}>
                      {device.icon}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <Button 
                  onClick={() => setSelectedPattern(null)}
                  startIcon={<CloseIcon />}
                  variant="outlined"
                >
                  Close
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Props Panel - Show only if config exists */}
            {patternConfig.length > 0 && (
              <Box
                sx={{
                  width: isMobile ? '100%' : isTablet ? '40%' : '30%',
                  borderRight: isMobile ? 0 : 1,
                  borderColor: 'divider',
                  overflow: 'auto',
                  display: isMobile ? 'none' : 'block', // Hide on mobile, show bottom sheet instead
                }}
              >
                <PatternPropsPanel
                  controls={patternConfig}
                  values={componentProps}
                  onChange={handlePropChange}
                  onReset={handleResetProps}
                />
              </Box>
            )}

            {/* Preview Area */}
            <Box 
              sx={{ 
                flex: 1,
                overflow: 'auto',
                bgcolor: 'background.default',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Mobile variant selector */}
              {isMobile && variantOptions.length > 0 && (
                <Box sx={{ width: '100%', mb: 2 }}>
                  <ToggleButtonGroup
                    value={selectedVariant}
                    exclusive
                    onChange={(_, value) => value && setSelectedVariant(value)}
                    size="small"
                    fullWidth
                  >
                    {variantOptions.map((variant) => (
                      <ToggleButton key={variant.value} value={variant.value}>
                        {variant.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              )}

              <Box
                sx={{ 
                  width: '100%',
                  maxWidth: previewWidth,
                  transition: 'max-width 0.3s ease-in-out',
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                }}
              >
                <IframePreview
                  componentName={selectedPattern.name}
                  componentProps={componentProps}
                  theme={theme.palette.mode}
                  width="100%"
                  componentPath={selectedPattern.status === 'pending' 
                    ? `../patterns/pending/${selectedPattern.name}.tsx`
                    : `../patterns/${selectedPattern.category}/${selectedPattern.name}.tsx`
                  }
                />
              </Box>
            </Box>
          </Box>

          {/* Mobile Props Bottom Sheet */}
          {isMobile && patternConfig.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: '50vh',
                overflow: 'auto',
                borderTop: 1,
                borderColor: 'divider',
                borderRadius: '16px 16px 0 0',
              }}
              elevation={8}
            >
              <PatternPropsPanel
                controls={patternConfig}
                values={componentProps}
                onChange={handlePropChange}
                onReset={handleResetProps}
              />
            </Paper>
          )}
        </Paper>
        ) : (
          <Box /> // Empty box as Modal requires a single child
        )}
      </Modal>
    </Box>
  );
};