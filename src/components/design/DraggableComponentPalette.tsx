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
  Stack,
  Chip,
  Grid,
} from '@mui/material';
import {
  Search,
  ExpandMore,
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
import { DraggablePaletteItem } from './DraggablePaletteItem';

export interface DraggableComponentPaletteProps {
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
  patterns: <Code />,
  subcomponents: <Code />,
};

/**
 * Component palette with drag and drop support
 */
export const DraggableComponentPalette: React.FC<DraggableComponentPaletteProps> = ({
  schemas,
  onAddComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['display', 'layout']);

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

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Components
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        Drag components to the canvas or click to add
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
              <Stack spacing={1}>
                {categorySchemas.map((schema) => (
                  <DraggablePaletteItem
                    key={schema.id}
                    schema={schema}
                    onAddComponent={onAddComponent}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Instructions */}
      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            • Drag components to add them
          </Typography>
          <Typography variant="caption" color="text.secondary">
            • Drop on containers to nest
          </Typography>
          <Typography variant="caption" color="text.secondary">
            • Drop between components to reorder
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};
