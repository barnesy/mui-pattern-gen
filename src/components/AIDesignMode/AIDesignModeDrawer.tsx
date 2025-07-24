import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import { useAIDesignMode } from '../../contexts/AIDesignModeContext';
import { PatternInstance, PatternInstanceManager } from '../../services/PatternInstanceManager';
import { SettingsPanel } from '../patterns/SettingsPanel';
import { PropControl } from '../patterns/PatternPropsPanel';

export const AIDesignModeDrawer: React.FC = () => {
  const {
    isEnabled,
    selectedPattern,
    setSelectedPattern,
    selectedInstanceId,
    setSelectedInstanceId,
    updatePatternInstance,
    updateAllPatternInstances,
    getPatternInstances,
  } = useAIDesignMode();

  const [patternConfig, setPatternConfig] = useState<PropControl[]>([]);
  const [componentProps, setComponentProps] = useState<Record<string, unknown>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [updateAllInstances, setUpdateAllInstances] = useState(true);
  const [patternInstances, setPatternInstances] = useState<PatternInstance[]>([]);

  // Load pattern config when selected pattern changes
  useEffect(() => {
    if (!selectedPattern) {
      setPatternConfig([]);
      setComponentProps({});
      setPatternInstances([]);
      return;
    }

    const loadConfig = async () => {
      setConfigLoading(true);
      try {
        const configPath = selectedPattern.status === 'pending'
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
        
        // Merge with current pattern props
        setComponentProps({ ...defaults, ...selectedPattern.props });
        
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
  }, [selectedPattern, getPatternInstances, setSelectedInstanceId]);

  // Sync props when selected instance changes
  useEffect(() => {
    if (!selectedInstanceId || !selectedPattern) return;
    
    // Find the selected instance
    const instance = patternInstances.find(inst => inst.id === selectedInstanceId);
    if (instance) {
      // Get the element and extract props
      const element = instance.element.deref();
      if (element) {
        const propsAttr = element.getAttribute('data-pattern-props');
        if (propsAttr) {
          try {
            const instanceProps = JSON.parse(propsAttr);
            setComponentProps(prev => ({ ...prev, ...instanceProps }));
          } catch (e) {
            console.error('Failed to parse instance props:', e);
          }
        }
      }
    }
  }, [selectedInstanceId, patternInstances, selectedPattern]);

  // Handle prop changes
  const handlePropChange = useCallback((name: string, value: unknown) => {
    const newProps = { ...componentProps, [name]: value };
    setComponentProps(newProps);
    
    // Update pattern instances
    if (selectedPattern) {
      if (updateAllInstances) {
        updateAllPatternInstances(selectedPattern.name, newProps);
      } else if (selectedInstanceId) {
        updatePatternInstance(selectedInstanceId, newProps);
      }
    }
  }, [componentProps, selectedPattern, selectedInstanceId, updateAllInstances, updatePatternInstance, updateAllPatternInstances]);

  // Handle configuration copy
  const handleCopyConfig = () => {
    if (!selectedPattern) return;

    const prompt = `Create a ${selectedPattern.name} component with the following configuration:

${JSON.stringify(componentProps, null, 2)}

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
    setComponentProps(defaults);
    handlePropChange('_reset', Date.now()); // Trigger update
  };

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
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        {selectedPattern ? (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
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
              </Stack>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedPattern(null);
                  setSelectedInstanceId(null);
                  setComponentProps({});
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
                            sx={(theme) => ({
                              bgcolor: isSelected
                                ? theme.palette.mode === 'dark' 
                                  ? 'primary.dark' 
                                  : 'primary.light' 
                                : theme.palette.mode === 'dark'
                                  ? 'grey.800'
                                  : 'grey.200',
                              color: isSelected
                                ? theme.palette.mode === 'dark'
                                  ? 'primary.contrastText'
                                  : 'primary.main'
                                : 'text.secondary',
                              fontWeight: isSelected ? 600 : 400,
                              border: isSelected
                                ? `1px solid ${theme.palette.primary.main}` 
                                : '1px solid transparent',
                              '& .MuiChip-icon': {
                                color: 'inherit',
                                fontSize: '1rem',
                              },
                              '&:hover': {
                                bgcolor: isSelected
                                  ? theme.palette.mode === 'dark'
                                    ? 'primary.dark' 
                                    : 'primary.light'
                                  : theme.palette.mode === 'dark'
                                    ? 'grey.700'
                                    : 'grey.300',
                              },
                            })}
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
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {!selectedPattern ? (
          <Stack spacing={2} sx={{ p: 2, py: 4, textAlign: 'center' }}>
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
        ) : patternConfig.length > 0 ? (
          <Stack spacing={3}>
            <SettingsPanel
              controls={patternConfig}
              values={componentProps}
              onChange={handlePropChange}
            />
            
            {/* Action Buttons */}
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