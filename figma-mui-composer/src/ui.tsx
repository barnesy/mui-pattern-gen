import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { getAllPatternDefinitions } from './composers/pattern-parser';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5551FF',
    },
  },
});

interface Pattern {
  name: string;
  category: string;
  description?: string;
  definition: any;
}

// Pattern descriptions for better UX
const patternDescriptions: Record<string, string> = {
  UserProfileCard: 'A card component displaying user profile with avatar, name, role, and action buttons',
  LoginForm: 'A secure login form with email/password fields and sign in functionality',
  ContactForm: 'Contact form with name, email, and message fields for user inquiries',
  RegisterForm: 'User registration form with validation',
  PasswordReset: 'Password reset form with email verification',
  ProductCard: 'E-commerce product card with image, price, and add to cart',
  StatsCard: 'Dashboard statistics card with metrics display',
  SearchForm: 'Advanced search form with filters',
  MultiStepForm: 'Multi-step form with progress indicator',
  Header: 'Navigation header with menu and user actions',
  Sidebar: 'Collapsible sidebar navigation',
  Breadcrumbs: 'Breadcrumb navigation component',
  DataTable: 'Data table with sorting and pagination',
  ImageGallery: 'Responsive image gallery with lightbox',
  StatsWidget: 'Dashboard statistics widget',
  ChartWidget: 'Chart display widget for analytics'
};

function App() {
  console.log('App component rendering');
  const [selectedTab, setSelectedTab] = useState(0);
  const [muiComponents, setMuiComponents] = useState<any>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cards', 'auth']));
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [projectPatterns, setProjectPatterns] = useState<any[]>([]);

  useEffect(() => {
    console.log('Loading pattern definitions...');
    try {
      // Load pattern definitions
      const patternDefs = getAllPatternDefinitions();
      console.log('Pattern definitions loaded:', patternDefs);
      const formattedPatterns: Pattern[] = patternDefs.map(def => ({
        name: def.name,
        category: getCategoryFromPattern(def.name),
        description: patternDescriptions[def.name] || `${def.name} component`,
        definition: def
      }));
      setPatterns(formattedPatterns);
    } catch (error) {
      console.error('Error loading patterns:', error);
      setMessage({ type: 'error', text: 'Failed to load patterns' });
    }

    // Listen for messages from the plugin
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'plugin-ready':
          // Load stored components
          parent.postMessage({ pluginMessage: { type: 'get-stored-components' } }, '*');
          parent.postMessage({ pluginMessage: { type: 'scan-project-patterns' } }, '*');
          break;

        case 'components-loaded':
          setMuiComponents(msg.data);
          break;

        case 'patterns-loaded':
          setProjectPatterns(msg.data);
          break;

        case 'discovery-started':
          setLoading(true);
          setMessage({ type: 'info', text: 'Discovering MUI components...' });
          break;

        case 'discovery-complete':
          setLoading(false);
          setMuiComponents(msg.data);
          setMessage({ type: 'success', text: `Found ${msg.count} MUI components!` });
          break;

        case 'composition-started':
          setLoading(true);
          setMessage({ type: 'info', text: 'Composing pattern...' });
          break;

        case 'composition-complete':
          setLoading(false);
          setMessage({ type: 'success', text: 'Pattern created successfully!' });
          break;

        case 'error':
          setLoading(false);
          setMessage({ type: 'error', text: msg.message });
          break;
      }
    };
  }, []);

  // Helper to determine category from pattern name
  const getCategoryFromPattern = (name: string): string => {
    if (name.includes('Login') || name.includes('Register') || name.includes('Password')) return 'auth';
    if (name.includes('Card')) return 'cards';
    if (name.includes('Form')) return 'forms';
    if (name.includes('Header') || name.includes('Sidebar') || name.includes('Breadcrumb')) return 'navigation';
    if (name.includes('Table') || name.includes('Gallery')) return 'lists';
    if (name.includes('Widget')) return 'dashboards';
    return 'other';
  };

  const handleDiscoverComponents = () => {
    parent.postMessage({ pluginMessage: { type: 'discover-components' } }, '*');
  };

  const handleComposePattern = () => {
    if (!selectedPattern) return;
    parent.postMessage({ 
      pluginMessage: { 
        type: 'compose-pattern',
        pattern: selectedPattern.definition
      } 
    }, '*');
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredPatterns = patterns.filter(pattern =>
    pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pattern.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const patternsByCategory = filteredPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) acc[pattern.category] = [];
    acc[pattern.category].push(pattern);
    return acc;
  }, {} as Record<string, Pattern[]>);

  const componentCount = muiComponents ? Object.keys(muiComponents).length : 0;

  console.log('Rendering App component, patterns:', patterns.length);
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ p: 2 }}>MUI Pattern Composer</Typography>
        <Divider />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(_, val) => setSelectedTab(val)}>
            <Tab label="Patterns" />
            <Tab label="Components" />
          </Tabs>
        </Box>

        {selectedTab === 0 && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              MUI Pattern Composer
            </Typography>
            
            {message && (
              <Alert 
                severity={message.type} 
                onClose={() => setMessage(null)}
                sx={{ mb: 2 }}
              >
                {message.text}
              </Alert>
            )}

            <TextField
              fullWidth
              size="small"
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <List>
              {Object.entries(patternsByCategory).map(([category, patterns]) => (
                <Box key={category}>
                  <ListItemButton onClick={() => toggleCategory(category)}>
                    <ListItemText 
                      primary={category.charAt(0).toUpperCase() + category.slice(1)}
                      secondary={`${patterns.length} patterns`}
                    />
                    {expandedCategories.has(category) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                  <Collapse in={expandedCategories.has(category)}>
                    <List component="div" disablePadding>
                      {patterns.map((pattern) => (
                        <ListItemButton
                          key={pattern.name}
                          selected={selectedPattern?.name === pattern.name}
                          onClick={() => setSelectedPattern(pattern)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemText
                            primary={pattern.name}
                            secondary={pattern.description}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              ))}
            </List>

            {selectedPattern && (
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Selected: {selectedPattern.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedPattern.description}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleComposePattern}
                  disabled={loading || componentCount === 0}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Pattern'}
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {selectedTab === 1 && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              MUI Component Library
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  {componentCount > 0 ? (
                    <>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body1">
                        {componentCount} components discovered
                      </Typography>
                    </>
                  ) : (
                    <>
                      <WarningIcon color="warning" />
                      <Typography variant="body1">
                        No components found
                      </Typography>
                    </>
                  )}
                </Stack>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  To use this plugin, you need to have the MUI Figma library file open and run discovery.
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleDiscoverComponents}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Discover Components'}
                </Button>
              </CardContent>
            </Card>

            {muiComponents && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Available Components:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {Object.keys(muiComponents).map((name) => (
                    <Chip key={name} label={name} size="small" />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

// Ensure React is properly initialized
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('Starting React app...');
    const rootElement = document.getElementById('root');
    console.log('Root element:', rootElement);

    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      console.error('Could not find root element');
    }
  });
}