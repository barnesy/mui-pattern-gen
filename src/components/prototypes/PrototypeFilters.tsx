import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Slider,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
// Date picker imports removed - using basic HTML date inputs
import { 
  PrototypeQueryFilters, 
  PrototypeStatus, 
  SchemaType 
} from '../../types/prototype';

interface PrototypeFiltersProps {
  filters: PrototypeQueryFilters;
  onFiltersChange: (filters: PrototypeQueryFilters) => void;
  onClearFilters: () => void;
  availableTags?: string[];
  availableAuthors?: string[];
  availableCategories?: string[];
}

const statusOptions: Array<{ value: PrototypeStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'shared', label: 'Shared' },
  { value: 'archived', label: 'Archived' },
];

const schemaTypeOptions: Array<{ value: SchemaType; label: string }> = [
  { value: 'component', label: 'Component' },
  { value: 'dbml', label: 'Database (DBML)' },
  { value: 'application', label: 'Application' },
  { value: 'custom', label: 'Custom' },
];

export const PrototypeFilters: React.FC<PrototypeFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableTags = [],
  availableAuthors = [],
  availableCategories = [],
}) => {
  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof PrototypeQueryFilters];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  const handleFilterChange = <K extends keyof PrototypeQueryFilters>(
    key: K,
    value: PrototypeQueryFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleArrayFilterChange = <K extends keyof PrototypeQueryFilters>(
    key: K,
    value: string,
    checked: boolean
  ) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter((item) => item !== value);
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            {hasActiveFilters && (
              <Button
                startIcon={<ClearIcon />}
                onClick={onClearFilters}
                size="small"
                color="secondary"
              >
                Clear All
              </Button>
            )}
          </Stack>

          <Stack spacing={2}>
            {/* Search */}
            <TextField
              label="Search"
              placeholder="Search by name, description, or tags..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              fullWidth
              size="small"
            />

            {/* Status Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Status</Typography>
                {filters.status && filters.status.length > 0 && (
                  <Chip
                    label={`${filters.status.length} selected`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {statusOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={filters.status?.includes(option.value) || false}
                          onChange={(e) =>
                            handleArrayFilterChange('status', option.value, e.target.checked)
                          }
                        />
                      }
                      label={option.label}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Schema Type Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Schema Type</Typography>
                {filters.schemaType && filters.schemaType.length > 0 && (
                  <Chip
                    label={`${filters.schemaType.length} selected`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {schemaTypeOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={filters.schemaType?.includes(option.value) || false}
                          onChange={(e) =>
                            handleArrayFilterChange('schemaType', option.value, e.target.checked)
                          }
                        />
                      }
                      label={option.label}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Author Filter */}
            {availableAuthors.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Author</InputLabel>
                <Select
                  value={filters.author || ''}
                  onChange={(e) => handleFilterChange('author', e.target.value || undefined)}
                  label="Author"
                >
                  <MenuItem value="">All Authors</MenuItem>
                  {availableAuthors.map((author) => (
                    <MenuItem key={author} value={author}>
                      {author}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {availableCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Tags</Typography>
                  {filters.tags && filters.tags.length > 0 && (
                    <Chip
                      label={`${filters.tags.length} selected`}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1} sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {availableTags.map((tag) => (
                      <FormControlLabel
                        key={tag}
                        control={
                          <Checkbox
                            checked={filters.tags?.includes(tag) || false}
                            onChange={(e) =>
                              handleArrayFilterChange('tags', tag, e.target.checked)
                            }
                          />
                        }
                        label={tag}
                      />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Date Range Filters */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Date Range</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="From"
                      type="date"
                      size="small"
                      value={filters.createdAfter ? filters.createdAfter.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFilterChange('createdAfter', e.target.value ? new Date(e.target.value) : undefined)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="To"
                      type="date"
                      size="small"
                      value={filters.createdBefore ? filters.createdBefore.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFilterChange('createdBefore', e.target.value ? new Date(e.target.value) : undefined)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Modified Date
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="From"
                      type="date"
                      size="small"
                      value={filters.updatedAfter ? filters.updatedAfter.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFilterChange('updatedAfter', e.target.value ? new Date(e.target.value) : undefined)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="To"
                      type="date"
                      size="small"
                      value={filters.updatedBefore ? filters.updatedBefore.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFilterChange('updatedBefore', e.target.value ? new Date(e.target.value) : undefined)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Public/Private Filter */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.isPublic || false}
                  onChange={(e) => handleFilterChange('isPublic', e.target.checked || undefined)}
                />
              }
              label="Public prototypes only"
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};