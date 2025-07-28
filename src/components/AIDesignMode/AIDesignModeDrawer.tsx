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
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Layers as LayersIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useAIDesignMode } from '../../contexts/AIDesignModeContext';
import { PatternInstance, PatternInstanceManager } from '../../services/PatternInstanceManager';
import { SettingsPanel } from '../patterns/SettingsPanel';
import { PatternPropsPanel, PropControl } from '../patterns/PatternPropsPanel';
import { getSubComponentConfig } from './subComponentConfigs';
import { usePropsStore } from '../../contexts/PropsStoreContext';

interface AIDesignModeDrawerProps {
  onClose?: () => void;
}

export const AIDesignModeDrawer: React.FC<AIDesignModeDrawerProps> = ({ onClose }) => {
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
  } = useAIDesignMode();

  const propsStore = usePropsStore();

  const [patternConfig, setPatternConfig] = useState<PropControl[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [updateAllInstances, setUpdateAllInstances] = useState(true);
  const [patternInstances, setPatternInstances] = useState<PatternInstance[]>([]);

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
        // For subcomponents, the category contains the componentType (e.g., "LabelValuePair")
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

          // Props are now managed directly through PropsStore
        } else {
          // If no config found for subcomponent, still show the props
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

        // Props are now managed directly through PropsStore

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

  // Removed prop syncing - now handled directly in MemoizedPropsPanel

  // Handle configuration copy
  const handleCopyConfig = () => {
    if (!selectedPattern) {return;}

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

  // Memoized props panel that connects directly to PropsStore
  const MemoizedPropsPanel = React.memo<{
    instanceId: string;
    controls: PropControl[];
    isSubComponent: boolean;
    patternName?: string;
    updateAllInstances?: boolean;
  }>(
    ({ instanceId, controls, isSubComponent, patternName, updateAllInstances }) => {
      const propsStoreRef = useRef(propsStore);
      const updateAllRef = useRef(updateAllInstances);
      const patternNameRef = useRef(patternName);

      // Update refs when props change
      useEffect(() => {
        updateAllRef.current = updateAllInstances;
        patternNameRef.current = patternName;
      }, [updateAllInstances, patternName]);

      // Store props in state but use deep comparison to prevent unnecessary updates
      const [localProps, setLocalProps] = useState<Record<string, unknown>>(
        () => propsStoreRef.current.getComponentProps(instanceId) || {}
      );

      // Use a ref to track the stringified props for comparison
      const propsStringRef = useRef(JSON.stringify(localProps));

      // Subscribe to props changes
      useEffect(() => {
        // Get initial props if instanceId changed
        const initialProps = propsStoreRef.current.getComponentProps(instanceId) || {};
        const initialPropsString = JSON.stringify(initialProps);
        if (propsStringRef.current !== initialPropsString) {
          propsStringRef.current = initialPropsString;
          setLocalProps(initialProps);
        }

        const unsubscribe = propsStoreRef.current.subscribe(instanceId, (newProps) => {
          const newPropsString = JSON.stringify(newProps);
          // Only update state if props actually changed
          if (propsStringRef.current !== newPropsString) {
            propsStringRef.current = newPropsString;
            setLocalProps(newProps);
          }
        });

        return unsubscribe;
      }, [instanceId]);

      // Stable onChange callback - no dependencies that change
      const handleChange = useCallback(
        (name: string, value: unknown) => {
          propsStoreRef.current.updateProps(instanceId, { [name]: value });

          if (isSubComponent) {
            // For sub-components, also dispatch the update event
            const currentProps = propsStoreRef.current.getComponentProps(instanceId) || {};
            const updatedProps = { ...currentProps, [name]: value };

            const event = new CustomEvent('subcomponent-update-request', {
              detail: {
                instanceId,
                props: updatedProps,
              },
              bubbles: true,
            });
            window.dispatchEvent(event);
          } else {
            // For patterns, handle update all instances
            if (updateAllRef.current && patternNameRef.current) {
              propsStoreRef.current.updateAllByName(patternNameRef.current, { [name]: value });
            }
          }
        },
        [instanceId, isSubComponent]
      );

      return isSubComponent ? (
        <PatternPropsPanel
          controls={controls}
          values={localProps}
          onChange={handleChange}
          hideActions={true}
        />
      ) : (
        <SettingsPanel controls={controls} values={localProps} onChange={handleChange} />
      );
    },
    (prevProps, nextProps) => {
      // Custom comparison to prevent unnecessary re-renders
      return (
        prevProps.instanceId === nextProps.instanceId &&
        prevProps.controls === nextProps.controls &&
        prevProps.isSubComponent === nextProps.isSubComponent &&
        prevProps.patternName === nextProps.patternName &&
        prevProps.updateAllInstances === nextProps.updateAllInstances
      );
    }
  );

  // Render content based on AI mode state
  if (!isEnabled) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Enable AI Design Mode to inspect patterns
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
        {isMobile && onClose && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6">Pattern Inspector</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        )}
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
            Pattern Inspector
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
              Click on any pattern to inspect and modify its properties
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Patterns are outlined in purple when AI Design Mode is active
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
            {/* Use PatternPropsPanel for sub-components (shows all controls including content) */}
            {/* Use SettingsPanel for patterns (shows only settings, not content) */}
            {selectedPattern.isSubComponent ? (
              <MemoizedPropsPanel
                key={selectedPattern.instanceId}
                instanceId={selectedPattern.instanceId}
                controls={patternConfig}
                isSubComponent={true}
              />
            ) : (
              <MemoizedPropsPanel
                key={selectedPattern.instanceId}
                instanceId={selectedPattern.instanceId}
                controls={patternConfig}
                isSubComponent={false}
                patternName={selectedPattern.name}
                updateAllInstances={updateAllInstances}
              />
            )}

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
    </Box>
  );
};
