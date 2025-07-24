import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
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
} from '@mui/icons-material';
import { withPatternWrapper } from '../utils/withPatternWrapper';

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

// Component to dynamically load and render patterns with AI Design Mode
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
        const OriginalComponent = module[pattern.name] || module.default;
        
        // Wrap the component with PatternWrapper for AI Design Mode
        const WrappedComponent = withPatternWrapper(OriginalComponent, {
          patternName: pattern.name,
          status: pattern.status,
          category: pattern.category,
        });
        
        setComponent(() => WrappedComponent);
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
    return <CircularProgress size={24} />;
  }

  if (error) {
    return <Typography variant="body2" color="error">{error}</Typography>;
  }

  if (!Component) {
    return <Typography variant="body2" color="text.secondary">Component not found</Typography>;
  }

  // Render the component with AI Design Mode wrapper
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pattern Library
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Click on any pattern while AI Design Mode is active to customize it
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
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
        </Stack>
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
        <Stack spacing={4}>
          {filteredPatterns.map(pattern => (
            <Box key={pattern.name}>
              <PatternRenderer pattern={pattern} />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};