import React, { useState, useEffect } from 'react';
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
    
    // Try to load pattern config to get variants
    try {
      const configPath = pattern.status === 'pending'
        ? `/src/patterns/pending/${pattern.name}.config.ts`
        : `/src/patterns/${pattern.category}/${pattern.name}.config.ts`;
      
      const response = await fetch(configPath);
      if (response.ok) {
        const configText = await response.text();
        
        // Extract variant options from config (simple regex approach)
        const variantMatch = configText.match(/type:\s*['"]variant['"]/i);
        if (variantMatch) {
          // Look for options array after variant type
          const optionsMatch = configText.match(/options:\s*\[((?:[^\[\]]|\[[^\]]*\])*?)\]/s);
          if (optionsMatch) {
            // Parse the options array
            const optionsStr = optionsMatch[1];
            const optionMatches = optionsStr.matchAll(/\{\s*label:\s*['"]([^'"]+)['"],\s*value:\s*['"]([^'"]+)['"]/g);
            const options = Array.from(optionMatches).map(match => ({
              label: match[1],
              value: match[2]
            }));
            if (options.length > 0) {
              setVariantOptions(options);
            }
          }
        }
      }
    } catch (error) {
      console.log('No config file found for pattern:', pattern.name);
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

      {/* Pattern Preview Dialog */}
      {selectedPattern && (
        <Paper
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 1400,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 3,
            zIndex: theme.zIndex.modal,
            boxShadow: theme.shadows[24],
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">{selectedPattern.name} Preview</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                {variantOptions.length > 0 && (
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
                )}
                <Divider orientation="vertical" flexItem />
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
                >
                  Close
                </Button>
              </Stack>
            </Stack>
            <Divider />
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                py: 2,
                minHeight: 400,
              }}
            >
              <Box
                sx={{ 
                  width: '100%',
                  maxWidth: previewWidth,
                  transition: 'max-width 0.3s ease-in-out',
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <IframePreview
                  componentName={selectedPattern.name}
                  componentProps={{ variant: selectedVariant }}
                  theme={theme.palette.mode}
                  width="100%"
                  componentPath={selectedPattern.status === 'pending' 
                    ? `../patterns/pending/${selectedPattern.name}.tsx`
                    : `../patterns/${selectedPattern.category}/${selectedPattern.name}.tsx`
                  }
                />
              </Box>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};