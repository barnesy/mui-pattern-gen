import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Alert,
  Tab,
  Tabs,
  Badge,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Sort as SortIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { PrototypeService } from '../services/PrototypeService';
import { 
  Prototype, 
  PrototypeQueryFilters, 
  PrototypeSortOptions,
  PrototypeStatus,
  SchemaType 
} from '../types/prototype';
import { PrototypeGrid } from '../components/prototypes/PrototypeGrid';
import { PrototypePreview } from '../components/prototypes/PrototypePreview';
import { PrototypeFilters } from '../components/prototypes/PrototypeFilters';

const schemaTypes: Array<{ id: SchemaType | 'all'; label: string; color: any }> = [
  { id: 'all', label: 'All Types', color: 'default' },
  { id: 'component', label: 'Component', color: 'primary' },
  { id: 'dbml', label: 'Database', color: 'secondary' },
  { id: 'application', label: 'Application', color: 'success' },
  { id: 'custom', label: 'Custom', color: 'info' },
];

const statusTypes: Array<{ id: PrototypeStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All Status' },
  { id: 'draft', label: 'Draft' },
  { id: 'active', label: 'Active' },
  { id: 'shared', label: 'Shared' },
  { id: 'archived', label: 'Archived' },
];

const sortOptions: Array<{ field: PrototypeSortOptions['field']; label: string }> = [
  { field: 'name', label: 'Name' },
  { field: 'createdAt', label: 'Created Date' },
  { field: 'updatedAt', label: 'Last Modified' },
  { field: 'viewCount', label: 'View Count' },
];

export const PrototypeViewer: React.FC = () => {
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [filteredPrototypes, setFilteredPrototypes] = useState<Prototype[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchemaType, setSelectedSchemaType] = useState<SchemaType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PrototypeStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortField, setSortField] = useState<PrototypeSortOptions['field']>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Preview state
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Menu state
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Delete confirmation state
  const [deletePrototype, setDeletePrototype] = useState<Prototype | null>(null);

  // Load prototypes
  const loadPrototypes = useCallback(async () => {
    try {
      setLoading(true);
      const result = await PrototypeService.query(
        undefined, // No filters initially
        { field: sortField, direction: sortDirection },
        100 // Load up to 100 prototypes
      );
      setPrototypes(result.prototypes);
    } catch (error) {
      console.error('Failed to load prototypes:', error);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection]);

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let filtered = [...prototypes];

    // Apply search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (prototype) =>
          prototype.name.toLowerCase().includes(search) ||
          prototype.description?.toLowerCase().includes(search) ||
          prototype.metadata.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Apply schema type filter
    if (selectedSchemaType !== 'all') {
      filtered = filtered.filter((prototype) => prototype.schema.type === selectedSchemaType);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((prototype) => prototype.metadata.status === selectedStatus);
    }

    setFilteredPrototypes(filtered);
  }, [prototypes, searchTerm, selectedSchemaType, selectedStatus]);

  // Initial load
  useEffect(() => {
    loadPrototypes();
  }, [loadPrototypes]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle prototype actions
  const handlePreviewPrototype = (prototype: Prototype) => {
    setSelectedPrototype(prototype);
    setPreviewOpen(true);
  };

  const handleEditPrototype = (prototype: Prototype) => {
    // TODO: Navigate to configuration panel
    console.log('Edit prototype:', prototype.id);
  };

  const handleDuplicatePrototype = async (prototype: Prototype) => {
    try {
      await PrototypeService.fork(prototype.id, `${prototype.name} (Copy)`);
      loadPrototypes(); // Refresh the list
    } catch (error) {
      console.error('Failed to duplicate prototype:', error);
    }
  };

  const handleDeletePrototype = async (prototype: Prototype) => {
    setDeletePrototype(prototype);
  };

  const confirmDelete = async () => {
    if (deletePrototype) {
      try {
        await PrototypeService.delete(deletePrototype.id);
        loadPrototypes(); // Refresh the list
        setDeletePrototype(null);
      } catch (error) {
        console.error('Failed to delete prototype:', error);
      }
    }
  };

  const handleExportPrototype = async (prototype: Prototype) => {
    try {
      const exportData = await PrototypeService.export([prototype.id]);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prototype.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export prototype:', error);
    }
  };

  // Handle sort
  const handleSortChange = (field: PrototypeSortOptions['field']) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setSortMenuAnchor(null);
  };

  // Count prototypes by status
  const statusCounts = React.useMemo(() => {
    return statusTypes.reduce((acc, status) => {
      if (status.id === 'all') {
        acc[status.id] = prototypes.length;
      } else {
        acc[status.id] = prototypes.filter(p => p.metadata.status === status.id).length;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [prototypes]);

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Prototype Library
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Browse, preview, and manage your generated prototypes
      </Typography>

      {/* Search and View Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TextField
          placeholder="Search prototypes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        <IconButton
          onClick={(e) => setSortMenuAnchor(e.currentTarget)}
          size="small"
        >
          <SortIcon />
        </IconButton>
        
        <Stack direction="row" spacing={0}>
          <IconButton
            onClick={() => setViewMode('grid')}
            color={viewMode === 'grid' ? 'primary' : 'default'}
            size="small"
          >
            <GridViewIcon />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('list')}
            color={viewMode === 'list' ? 'primary' : 'default'}
            size="small"
          >
            <ListViewIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option.field}
            onClick={() => handleSortChange(option.field)}
            selected={sortField === option.field}
          >
            {option.label}
            {sortField === option.field && ` (${sortDirection})`}
          </MenuItem>
        ))}
      </Menu>

      {/* Status Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={selectedStatus} onChange={(_, value) => setSelectedStatus(value)}>
          {statusTypes.map((status) => (
            <Tab
              key={status.id}
              label={
                <Badge badgeContent={statusCounts[status.id] || 0} color="primary">
                  {status.label}
                </Badge>
              }
              value={status.id}
            />
          ))}
        </Tabs>
      </Box>

      {/* Schema Type Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {schemaTypes.map((type) => (
            <Chip
              key={type.id}
              label={type.label}
              onClick={() => setSelectedSchemaType(type.id)}
              color={selectedSchemaType === type.id ? type.color : 'default'}
              variant={selectedSchemaType === type.id ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Alert severity="info" icon={<CircularProgress size={20} />}>
          Loading prototypes...
        </Alert>
      ) : filteredPrototypes.length === 0 ? (
        <Alert severity="warning">
          {searchTerm || selectedSchemaType !== 'all' || selectedStatus !== 'all'
            ? 'No prototypes found matching your criteria.'
            : 'No prototypes found. Create your first prototype to get started!'}
        </Alert>
      ) : (
        /* Prototype Grid */
        <PrototypeGrid
          prototypes={filteredPrototypes}
          viewMode={viewMode}
          onPreview={handlePreviewPrototype}
          onEdit={handleEditPrototype}
          onDuplicate={handleDuplicatePrototype}
          onDelete={handleDeletePrototype}
          onExport={handleExportPrototype}
        />
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedPrototype?.name}
            </Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              ×
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedPrototype && (
            <PrototypePreview prototype={selectedPrototype} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletePrototype)}
        onClose={() => setDeletePrototype(null)}
      >
        <DialogTitle>Delete Prototype</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletePrototype?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletePrototype(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};