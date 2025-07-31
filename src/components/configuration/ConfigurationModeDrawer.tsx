import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Toolbar,
  FormControlLabel,
  Switch,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Layers as LayersIcon,
  NavigateNext as NavigateNextIcon,
  Save as SaveIcon,
  FolderOpen as LoadIcon,
  GetApp as ExportIcon,
  Publish as ImportIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Settings as SettingsIcon,
  AutoMode as AutoSaveIcon,
} from '@mui/icons-material';
import { useConfigurationMode } from '../../contexts/ConfigurationModeContext';
import { PatternInstance, PatternInstanceManager } from '../../services/PatternInstanceManager';
import { ConfigurationPanel } from './ConfigurationPanel';
import { PropControl } from '../patterns/PatternPropsPanel';
import { getSubComponentConfig } from '../AIDesignMode/subComponentConfigs';
import { usePropsStore } from '../../contexts/PropsStoreContext';
import { PrototypeService } from '../../services/PrototypeService';

interface ConfigurationModeDrawerProps {
  onClose?: () => void;
}

export const ConfigurationModeDrawer: React.FC<ConfigurationModeDrawerProps> = ({ onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    isEnabled,
    selectedPattern,
    setSelectedPattern,
    selectedInstanceId,
    setSelectedInstanceId,
    updatePatternInstance,
    updateAllPatternInstances,
    getPatternInstances,
    findPatternInstanceById,
    currentPrototype,
    savePrototype,
    loadPrototype,
    createNewPrototype,
    exportConfiguration,
    importConfiguration,
    canUndo,
    canRedo,
    undo,
    redo,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastAutoSave,
  } = useConfigurationMode();

  const propsStore = usePropsStore();

  const [patternConfig, setPatternConfig] = useState<PropControl[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [updateAllInstances, setUpdateAllInstances] = useState(true);
  const [patternInstances, setPatternInstances] = useState<PatternInstance[]>([]);
  
  // Prototype management dialogs
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [newPrototypeName, setNewPrototypeName] = useState('');
  const [newPrototypeDescription, setNewPrototypeDescription] = useState('');
  const [availablePrototypes, setAvailablePrototypes] = useState<any[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Auto-save indicator
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false);

  // Load pattern config when selected pattern changes
  useEffect(() => {
    if (!selectedPattern) {
      setPatternConfig([]);
      setPatternInstances([]);
      return;
    }

    const loadConfig = async () => {
      // Handle sub-components
      if (selectedPattern.isSubComponent) {
        setConfigLoading(false);

        // Try to get sub-component config
        const subConfig = getSubComponentConfig(selectedPattern.category);

        if (subConfig) {
          setPatternConfig(subConfig);

          // Initialize props with defaults
          const defaults: Record<string, unknown> = {};
          subConfig.forEach((control) => {
            if (control.defaultValue !== undefined) {
              defaults[control.name] = control.defaultValue;
            }
          });
        } else {
          setPatternConfig([]);
        }

        return;
      }

      setConfigLoading(true);
      try {
        const configPath =
          selectedPattern.status === 'pending'
            ? `../../patterns/pending/${selectedPattern.name}.config`
            : `../../patterns/${selectedPattern.category}/${selectedPattern.name}.config`;

        const configModule = await import(/* @vite-ignore */ configPath);
        const controlsKey = `${selectedPattern.name.charAt(0).toLowerCase() + selectedPattern.name.slice(1)}Controls`;
        const controls = configModule[controlsKey] || [];
        setPatternConfig(controls);

        // Initialize props with defaults
        const defaults: Record<string, unknown> = {};
        controls.forEach((control: PropControl) => {
          if (control.defaultValue !== undefined) {
            defaults[control.name] = control.defaultValue;
          }
        });

        // Load all instances of this pattern
        const instances = getPatternInstances(selectedPattern.name);
        setPatternInstances(instances);

        // Always update selected instance when pattern changes
        setSelectedInstanceId(selectedPattern.instanceId || null);
      } catch (error) {
        console.log('No config file found for pattern:', selectedPattern.name);
        setPatternConfig([]);
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, [selectedPattern, getPatternInstances, setSelectedInstanceId, propsStore]);

  // Load available prototypes when load dialog opens
  useEffect(() => {
    if (loadDialogOpen) {
      const loadPrototypes = async () => {
        try {
          const result = await PrototypeService.query();
          setAvailablePrototypes(result.prototypes);
        } catch (error) {
          console.error('Failed to load prototypes:', error);
        }
      };
      loadPrototypes();
    }
  }, [loadDialogOpen]);

  // Auto-save indicator effect
  useEffect(() => {
    if (lastAutoSave) {
      setShowAutoSaveIndicator(true);
      const timer = setTimeout(() => setShowAutoSaveIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAutoSave]);

  // Handle configuration copy
  const handleCopyConfig = () => {
    if (!selectedPattern) return;

    // Get current props from PropsStore
    const currentProps = propsStore.getComponentProps(selectedPattern.instanceId) || {};

    const prompt = `Create a ${selectedPattern.name} component with the following configuration:

${JSON.stringify(currentProps, null, 2)}

Requirements:
- Use Material-UI (MUI) v5 components
- Follow TypeScript best practices
- Support both light and dark themes
- Make the component responsive
- Include proper prop types and defaults`;

    navigator.clipboard.writeText(prompt);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  // Handle reset
  const handleReset = () => {
    const defaults: Record<string, unknown> = {};
    patternConfig.forEach((control) => {
      if (control.defaultValue !== undefined) {
        defaults[control.name] = control.defaultValue;
      }
    });

    // Update in PropsStore directly
    if (selectedPattern && selectedPattern.instanceId) {
      propsStore.updateProps(selectedPattern.instanceId, defaults);

      if (!selectedPattern.isSubComponent && updateAllInstances) {
        propsStore.updateAllByName(selectedPattern.name, defaults);
      }
    }
  };

  // Prototype management handlers
  const handleSavePrototype = async () => {
    if (currentPrototype?.id) {
      // Update existing prototype
      await savePrototype();
    } else {
      // Show save dialog for new prototype
      setSaveDialogOpen(true);
    }
  };

  const handleCreateNewPrototype = async () => {
    if (!newPrototypeName.trim()) return;
    
    const success = await createNewPrototype(newPrototypeName, newPrototypeDescription);
    if (success) {
      setSaveDialogOpen(false);
      setNewPrototypeName('');
      setNewPrototypeDescription('');
    }
  };

  const handleLoadPrototype = async (id: string) => {
    const success = await loadPrototype(id);
    if (success) {
      setLoadDialogOpen(false);
    }
  };

  const handleExportConfiguration = () => {
    const config = exportConfiguration();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `configuration-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfiguration = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string);
            importConfiguration(config);
          } catch (error) {
            console.error('Failed to import configuration:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Convert PropControl[] to ConfigurationPanel controls format
  const convertToConfigControls = useCallback((controls: PropControl[]) => {
    return controls.map(control => ({
      name: control.name,
      type: control.type,
      label: control.label,
      defaultValue: control.defaultValue,
      options: control.options,
      min: control.min,
      max: control.max,
      step: control.step,
      helperText: control.helperText,
      group: control.group || 'General',
      required: false, // PropControl doesn't have required field
      isContent: control.group === 'General' || control.group === 'Content',
    }));
  }, []);

  // Memoized configuration panel
  const MemoizedConfigPanel = React.memo<{
    instanceId: string;
    controls: PropControl[];
    isSubComponent: boolean;
    patternName?: string;
    updateAllInstances?: boolean;
  }>(
    ({ instanceId, controls, isSubComponent, patternName, updateAllInstances }) => {
      const propsStoreRef = useRef(propsStore);
      
      // Store props in state
      const [localProps, setLocalProps] = useState<Record<string, unknown>>(
        () => propsStoreRef.current.getComponentProps(instanceId) || {}
      );

      // Subscribe to props changes
      useEffect(() => {
        const initialProps = propsStoreRef.current.getComponentProps(instanceId) || {};
        setLocalProps(initialProps);

        const unsubscribe = propsStoreRef.current.subscribe(instanceId, (newProps) => {
          setLocalProps(newProps);
        });

        return unsubscribe;
      }, [instanceId]);

      // Handle change callback
      const handleChange = useCallback(
        (name: string, value: unknown) => {
          propsStoreRef.current.updateProps(instanceId, { [name]: value });

          if (isSubComponent) {
            // For sub-components, dispatch update event
            const currentProps = propsStoreRef.current.getComponentProps(instanceId) || {};
            const updatedProps = { ...currentProps, [name]: value };

            const event = new CustomEvent('subcomponent-update-request', {
              detail: { instanceId, props: updatedProps },
              bubbles: true,
            });
            window.dispatchEvent(event);
          } else {
            // For patterns, handle update all instances
            if (updateAllInstances && patternName) {
              propsStoreRef.current.updateAllByName(patternName, { [name]: value });
            }
          }
        },
        [instanceId, isSubComponent, updateAllInstances, patternName]
      );

      const configControls = convertToConfigControls(controls);

      return (
        <ConfigurationPanel
          source={{ type: 'controls', controls: configControls }}
          values={localProps}
          onChange={handleChange}
          updateMode="immediate"
          hideActions={true}
          title={isSubComponent ? 'Sub-component Configuration' : 'Pattern Configuration'}
        />
      );
    },
    (prevProps, nextProps) => {
      return (
        prevProps.instanceId === nextProps.instanceId &&
        prevProps.controls === nextProps.controls &&
        prevProps.isSubComponent === nextProps.isSubComponent &&
        prevProps.patternName === nextProps.patternName &&
        prevProps.updateAllInstances === nextProps.updateAllInstances
      );
    }
  );

  // Render content based on configuration mode state
  if (!isEnabled) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Enable Configuration Mode to inspect and configure patterns
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} data-ai-ignore="true">
      <Toolbar /> {/* Spacer for app bar */}
      
      {/* Header */}
      <Box
        sx={{
          p: isMobile ? 1.5 : 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.6)' : 'rgba(250, 250, 250, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {/* Mobile header */}
        {isMobile && onClose && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6">Configuration</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        )}

        {/* Prototype controls */}
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Prototype:
          </Typography>
          {currentPrototype ? (
            <Chip
              label={currentPrototype.name}
              size="small"
              color={currentPrototype.isDirty ? 'warning' : 'success'}
              icon={currentPrototype.isDirty ? <WarningIcon /> : <CheckIcon />}
            />
          ) : (
            <Chip label="Unsaved" size="small" variant="outlined" />
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Prototype actions */}
          <Tooltip title="Prototype Actions">
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={handleSavePrototype}>
              <ListItemIcon><SaveIcon /></ListItemIcon>
              <ListItemText>{currentPrototype?.id ? 'Save' : 'Save As...'}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => setLoadDialogOpen(true)}>
              <ListItemIcon><LoadIcon /></ListItemIcon>
              <ListItemText>Load</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleExportConfiguration}>
              <ListItemIcon><ExportIcon /></ListItemIcon>
              <ListItemText>Export</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleImportConfiguration}>
              <ListItemIcon><ImportIcon /></ListItemIcon>
              <ListItemText>Import</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={undo} disabled={!canUndo}>
              <ListItemIcon><UndoIcon /></ListItemIcon>
              <ListItemText>Undo</ListItemText>
            </MenuItem>
            <MenuItem onClick={redo} disabled={!canRedo}>
              <ListItemIcon><RedoIcon /></ListItemIcon>
              <ListItemText>Redo</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}>
              <ListItemIcon>
                <AutoSaveIcon color={autoSaveEnabled ? 'primary' : 'disabled'} />
              </ListItemIcon>
              <ListItemText>Auto-save</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>

        {/* Auto-save indicator */}
        {showAutoSaveIndicator && (
          <Alert severity="success" sx={{ mb: 1 }}>
            Auto-saved at {lastAutoSave?.toLocaleTimeString()}
          </Alert>
        )}

        {/* Pattern header */}
        {selectedPattern ? (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                {selectedPattern.isSubComponent ? (
                  <Box>
                    <Breadcrumbs
                      separator={<NavigateNextIcon fontSize="small" />}
                      aria-label="component hierarchy"
                      sx={{ mb: 1 }}
                    >
                      <Link
                        component="button"
                        variant="body2"
                        underline="hover"
                        color="inherit"
                        onClick={() => {
                          // Find parent pattern element and select it
                          const parentInstanceId = selectedPattern.parentInstanceId;
                          if (parentInstanceId) {
                            const parentInstance = findPatternInstanceById(parentInstanceId);
                            if (parentInstance?.element) {
                              const patternName =
                                parentInstance.element.getAttribute('data-pattern-name');
                              const status = parentInstance.element.getAttribute(
                                'data-pattern-status'
                              ) as 'pending' | 'accepted';
                              const category =
                                parentInstance.element.getAttribute('data-pattern-category') || '';
                              const propsStr =
                                parentInstance.element.getAttribute('data-pattern-props');

                              let props = {};
                              try {
                                props = propsStr ? JSON.parse(propsStr) : {};
                              } catch (e) {
                                console.error('Failed to parse pattern props:', e);
                              }

                              setSelectedPattern({
                                name: patternName || '',
                                status,
                                category,
                                instanceId: parentInstanceId,
                                props,
                                element: parentInstance.element,
                                rect: parentInstance.element.getBoundingClientRect(),
                              });
                              setSelectedInstanceId(parentInstanceId);
                            }
                          }
                        }}
                      >
                        {(() => {
                          const parentInstance = findPatternInstanceById(
                            selectedPattern.parentInstanceId || ''
                          );
                          const parentName =
                            parentInstance?.element.getAttribute('data-pattern-name');
                          return parentName || 'Parent Component';
                        })()}
                      </Link>
                      <Typography color="text.primary">{selectedPattern.name}</Typography>
                    </Breadcrumbs>
                    <Chip label="Sub-component" size="small" color="secondary" variant="outlined" />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedPattern.name}
                    </Typography>
                    <Chip
                      icon={selectedPattern.status === 'pending' ? <WarningIcon /> : <CheckIcon />}
                      label={selectedPattern.status}
                      size="small"
                      color={selectedPattern.status === 'pending' ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </>
                )}
              </Stack>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedPattern(null);
                  setSelectedInstanceId(null);
                  setPatternConfig([]);
                  setPatternInstances([]);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>

            <Stack direction="row" spacing={1} mb={2}>
              <Chip label={selectedPattern.category} size="small" color="primary" />
              {selectedPattern.hasConfig !== false && (
                <Chip label="Interactive" size="small" variant="outlined" />
              )}
              {patternInstances.length > 1 && (
                <Chip
                  icon={<LayersIcon />}
                  label={`${patternInstances.length} instances`}
                  size="small"
                  color="secondary"
                />
              )}
            </Stack>

            {/* Instance Selector */}
            {patternInstances.length > 1 && (
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={updateAllInstances}
                      onChange={(e) => setUpdateAllInstances(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Update all instances"
                />
                {!updateAllInstances && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Select Instance
                      </Typography>
                      {selectedInstanceId && (
                        <Typography variant="caption" color="primary.main">
                          (Currently: {selectedInstanceId.slice(-8)})
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {patternInstances.map((instance) => {
                        const isSelected = selectedInstanceId === instance.id;
                        const isClickedInstance = selectedPattern.instanceId === instance.id;

                        return (
                          <Chip
                            key={instance.id}
                            label={`Instance ${instance.id.slice(-8)}`}
                            title={`Click to select and scroll to this instance\nLocation: ${instance.location.pathname}${isClickedInstance ? '\n(This instance was clicked)' : ''}`}
                            size="small"
                            icon={isClickedInstance ? <LayersIcon /> : undefined}
                            onClick={() => {
                              setSelectedInstanceId(instance.id);
                              // Scroll to the instance
                              PatternInstanceManager.scrollToInstance(instance.id);
                            }}
                            data-ai-ignore="true"
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Configuration Mode
          </Typography>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: '4px',
          },
        }}
      >
        {!selectedPattern ? (
          <Stack spacing={2} sx={{ p: isMobile ? 1.5 : 2, py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Click on any pattern to configure its properties
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Patterns are outlined in purple when Configuration Mode is active
            </Typography>
          </Stack>
        ) : configLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, py: 4 }}>
            <CircularProgress />
          </Box>
        ) : selectedPattern.isSubComponent && patternConfig.length === 0 ? (
          <Stack spacing={2} sx={{ p: 2 }}>
            <Alert severity="info">
              <Typography variant="body2">Sub-component properties</Typography>
            </Alert>

            {/* Show sub-component props in a simple view */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Current Props:
              </Typography>
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: '300px',
                }}
              >
                {JSON.stringify(
                  propsStore.getComponentProps(selectedPattern.instanceId) || {},
                  null,
                  2
                )}
              </pre>
            </Box>

            <Typography variant="caption" color="text.secondary">
              No configuration available for this sub-component type.
            </Typography>
          </Stack>
        ) : patternConfig.length > 0 ? (
          <Stack spacing={3}>
            {/* Use ConfigurationPanel for both patterns and sub-components */}
            <MemoizedConfigPanel
              key={selectedPattern.instanceId}
              instanceId={selectedPattern.instanceId}
              controls={patternConfig}
              isSubComponent={selectedPattern.isSubComponent || false}
              patternName={selectedPattern.name}
              updateAllInstances={updateAllInstances}
            />

            {/* Action Buttons - only show for regular patterns */}
            {!selectedPattern.isSubComponent && (
              <Stack direction="row" spacing={1} sx={{ p: '20px' }}>
                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  startIcon={copiedConfig ? <CheckIcon /> : <CopyIcon />}
                  onClick={handleCopyConfig}
                  color={copiedConfig ? 'success' : 'primary'}
                >
                  {copiedConfig ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Stack>
            )}
          </Stack>
        ) : (
          <Alert severity="info">
            <Typography variant="body2">
              No interactive controls available for this pattern.
            </Typography>
            <Typography variant="caption" display="block" mt={1}>
              To add controls, create a <code>{selectedPattern.name}.config.ts</code> file.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Save Prototype Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Prototype</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Prototype Name"
              value={newPrototypeName}
              onChange={(e) => setNewPrototypeName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={newPrototypeDescription}
              onChange={(e) => setNewPrototypeDescription(e.target.value)}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNewPrototype} 
            variant="contained"
            disabled={!newPrototypeName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Prototype Dialog */}
      <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Load Prototype</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {availablePrototypes.length === 0 ? (
              <Typography color="text.secondary">No saved prototypes found.</Typography>
            ) : (
              availablePrototypes.map((prototype) => (
                <Box
                  key={prototype.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleLoadPrototype(prototype.id)}
                >
                  <Typography variant="subtitle2">{prototype.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prototype.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(prototype.metadata.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};