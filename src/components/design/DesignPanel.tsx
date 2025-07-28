import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  Alert,
  Button,
  Stack,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Code,
  DataObject,
  Palette,
  ContentCopy,
  Delete,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { useDesignStore } from '../../stores/designStore';
import { SchemaPropsForm } from './SchemaPropsForm';
import { SimplePropsForm } from './SimplePropsForm';
import { DataSourceConfig } from './DataSourceConfig';
import { ComponentInfo } from './ComponentInfo';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`design-tabpanel-${index}`}
      aria-labelledby={`design-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export interface DesignPanelProps {
  onClose?: () => void;
}

/**
 * Unified design panel for component configuration
 */
export const DesignPanel: React.FC<DesignPanelProps> = React.memo(({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Get selected instance and schema
  const selectedId = useDesignStore((state) => state.selectedId);
  const instance = useDesignStore((state) => (selectedId ? state.getInstance(selectedId) : null));
  const schema = useDesignStore((state) => (instance ? state.getSchema(instance.schemaId) : null));
  const ancestors = useDesignStore((state) => (selectedId ? state.getAncestors(selectedId) : []));

  // Actions
  const selectInstance = useDesignStore((state) => state.selectInstance);
  const updateInstance = useDesignStore((state) => state.updateInstance);
  const deleteInstance = useDesignStore((state) => state.deleteInstance);
  const duplicateInstance = useDesignStore((state) => state.duplicateInstance);

  if (!instance || !schema) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Alert severity="info">Select a component to configure</Alert>
      </Paper>
    );
  }

  const isLocked = instance.metadata?.locked;

  // Handle prop updates
  const handlePropsChange = React.useCallback(
    (newProps: Record<string, any>) => {
      updateInstance(instance.id, { props: newProps });
    },
    [instance.id, updateInstance]
  );

  // Handle data source updates
  const handleDataSourceChange = React.useCallback(
    (dataSource: any) => {
      updateInstance(instance.id, { dataSource });
    },
    [instance.id, updateInstance]
  );

  // Handle delete
  const handleDelete = () => {
    deleteInstance(instance.id);
    selectInstance(null);
  };

  // Handle duplicate
  const handleDuplicate = () => {
    const newId = duplicateInstance(instance.id);
    selectInstance(newId);
  };

  // Handle lock toggle
  const handleLockToggle = () => {
    updateInstance(instance.id, {
      metadata: {
        ...instance.metadata,
        locked: !isLocked,
      },
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack spacing={1}>
          {/* Breadcrumb navigation */}
          {ancestors.length > 0 && (
            <Breadcrumbs separator="›" aria-label="breadcrumb">
              {ancestors.reverse().map((ancestor) => (
                <Link
                  key={ancestor.id}
                  component="button"
                  variant="body2"
                  onClick={() => selectInstance(ancestor.id)}
                  underline="hover"
                  color="inherit"
                >
                  {ancestor.metadata?.name ||
                    useDesignStore.getState().getSchema(ancestor.schemaId)?.name ||
                    'Component'}
                </Link>
              ))}
              <Typography color="text.primary" variant="body2">
                {instance.metadata?.name || schema.name}
              </Typography>
            </Breadcrumbs>
          )}

          {/* Component name and actions */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">{instance.metadata?.name || schema.name}</Typography>
              <Chip label={schema.type} size="small" color="primary" variant="outlined" />
              {isLocked && (
                <Chip
                  icon={<Lock fontSize="small" />}
                  label="Locked"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>

            <Box display="flex" gap={0.5}>
              <Tooltip title={isLocked ? 'Unlock' : 'Lock'}>
                <IconButton size="small" onClick={handleLockToggle}>
                  {isLocked ? <LockOpen /> : <Lock />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Duplicate">
                <IconButton size="small" onClick={handleDuplicate} disabled={isLocked}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton size="small" onClick={handleDelete} disabled={isLocked} color="error">
                  <Delete />
                </IconButton>
              </Tooltip>

              {onClose && (
                <IconButton size="small" onClick={onClose}>
                  <Close />
                </IconButton>
              )}
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Props" />
          <Tab label="Data" icon={<DataObject fontSize="small" />} iconPosition="start" />
          <Tab label="Style" icon={<Palette fontSize="small" />} iconPosition="start" />
          <Tab label="Code" icon={<Code fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TabPanel value={activeTab} index={0}>
          {isLocked ? (
            <Alert severity="warning">Component is locked. Unlock to edit properties.</Alert>
          ) : (
            <SchemaPropsForm schema={schema} values={instance.props} onChange={handlePropsChange} />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {isLocked ? (
            <Alert severity="warning">Component is locked. Unlock to configure data source.</Alert>
          ) : (
            <DataSourceConfig
              schema={schema}
              dataSource={instance.dataSource}
              onChange={handleDataSourceChange}
            />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Alert severity="info">Style editor coming soon</Alert>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Component Info</Typography>
            <ComponentInfo schema={schema} instance={instance} />

            <Divider />

            <Typography variant="subtitle2">Instance Configuration</Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(instance, null, 2)}
            </Box>
          </Stack>
        </TabPanel>
      </Box>
    </Paper>
  );
});
