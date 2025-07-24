import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

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

// Component to dynamically load and render patterns
const PatternRenderer: React.FC<{ pattern: Pattern }> = ({ pattern }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const modulePath = pattern.status === 'pending'
          ? `../patterns/pending/${pattern.name}`
          : `../patterns/${pattern.category}/${pattern.name}`;
        
        const module = await import(/* @vite-ignore */ modulePath);
        setComponent(() => module[pattern.name] || module.default);
      } catch (err) {
        console.error(`Failed to load pattern ${pattern.name}:`, err);
        setError(`Failed to load ${pattern.name}`);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [pattern]);

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

  // Render the component with default props
  return (
    <Suspense fallback={<CircularProgress size={24} />}>
      <Component />
    </Suspense>
  );
};

export const PatternViewer: React.FC = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [loading, setLoading] = useState(true);
  const [_pendingContext, setPendingContext] = useState<any>(null);

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
          'DataDisplayCard',
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

  const PatternCard = ({ pattern }: { pattern: Pattern }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
      }}
      elevation={1}
    >
      <CardContent sx={{ flex: 1, p: 2 }}>
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
          <Typography variant="body2" color="text.secondary" mb={2}>
            {pattern.description}
          </Typography>
        )}
        
        {/* Direct Component Render */}
        <Box sx={{ mt: 2 }}>
          <PatternRenderer pattern={pattern} />
        </Box>
      </CardContent>
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
          
          <Grid item xs={12} md={3}>
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
                    <Grid container spacing={2} alignItems="stretch">
                      <Grid item xs={12} md={4}>
                        <Stack spacing={1}>
                          <Typography variant="h6">{pattern.name}</Typography>
                          <Stack direction="row" spacing={1}>
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
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <PatternRenderer pattern={pattern} />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};