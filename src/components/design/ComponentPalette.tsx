import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  Add,
  AccountBox,
  CreditCard,
  Article,
  Navigation,
  Dashboard,
  ViewList,
  Settings,
  Code,
} from '@mui/icons-material';
import { ComponentSchema } from '../../schemas/types';

export interface ComponentPaletteProps {
  schemas: Map<string, ComponentSchema>;
  onAddComponent: (schemaId: string) => void;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  auth: <AccountBox />,
  cards: <CreditCard />,
  forms: <Article />,
  navigation: <Navigation />,
  dashboards: <Dashboard />,
  lists: <ViewList />,
  utility: <Settings />,
  display: <CreditCard />,
  form: <Article />,
  layout: <Dashboard />,
};

// Category descriptions
const categoryDescriptions: Record<string, string> = {
  auth: 'Login forms, registration, authentication',
  cards: 'User profiles, product cards, info cards',
  forms: 'Contact forms, multi-step forms, inputs',
  navigation: 'Headers, sidebars, breadcrumbs, menus',
  dashboards: 'Stats widgets, charts, analytics',
  lists: 'Data tables, list items, grids',
  utility: 'Helpers, tools, and utilities',
  display: 'Components for displaying information',
  form: 'Components for user input',
  layout: 'Components for page layout',
};

/**
 * Component palette for adding components to the canvas
 */
export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ schemas, onAddComponent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['display']);

  // Group schemas by category/type
  const groupedSchemas = React.useMemo(() => {
    const groups: Record<string, ComponentSchema[]> = {};

    schemas.forEach((schema) => {
      const category = schema.category || schema.type || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(schema);
    });

    return groups;
  }, [schemas]);

  // Filter schemas based on search
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery) {return groupedSchemas;}

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, ComponentSchema[]> = {};

    Object.entries(groupedSchemas).forEach(([category, schemas]) => {
      const matchingSchemas = schemas.filter(
        (schema) =>
          schema.name.toLowerCase().includes(query) ||
          schema.description?.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
      );

      if (matchingSchemas.length > 0) {
        filtered[category] = matchingSchemas;
      }
    });

    return filtered;
  }, [groupedSchemas, searchQuery]);

  // Handle category expansion
  const handleCategoryToggle = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Calculate stats
  const totalComponents = schemas.size;
  const totalCategories = Object.keys(groupedSchemas).length;

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Component Library
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search components..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {/* Stats */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="h6" color="primary.contrastText">
              {totalComponents}
            </Typography>
            <Typography variant="caption" color="primary.contrastText">
              Components
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'secondary.light', borderRadius: 1 }}>
            <Typography variant="h6" color="secondary.contrastText">
              {totalCategories}
            </Typography>
            <Typography variant="caption" color="secondary.contrastText">
              Categories
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Component categories */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(filteredGroups).map(([category, categorySchemas]) => (
          <Accordion
            key={category}
            expanded={expandedCategories.includes(category)}
            onChange={() => handleCategoryToggle(category)}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {categoryIcons[category] || <Code />}
                <Typography sx={{ flexGrow: 1 }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Chip label={categorySchemas.length} size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {categoryDescriptions[category] && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 2, display: 'block' }}
                >
                  {categoryDescriptions[category]}
                </Typography>
              )}

              <Stack spacing={1}>
                {categorySchemas.map((schema) => (
                  <Card
                    key={schema.id}
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {schema.name}
                      </Typography>
                      {schema.description && (
                        <Typography variant="caption" color="text.secondary">
                          {schema.description}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {schema.props.slice(0, 3).map((prop) => (
                          <Chip
                            key={prop.name}
                            label={prop.name}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {schema.props.length > 3 && (
                          <Chip
                            label={`+${schema.props.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      <Tooltip title="Add to canvas">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onAddComponent(schema.id)}
                        >
                          <Add />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Quick add section */}
      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Add
        </Typography>
        <Grid container spacing={1}>
          {Array.from(schemas.values())
            .slice(0, 4)
            .map((schema) => (
              <Grid item xs={6} key={schema.id}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={() => onAddComponent(schema.id)}
                  startIcon={categoryIcons[schema.category || schema.type] || <Add />}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  {schema.name}
                </Button>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Paper>
  );
};
