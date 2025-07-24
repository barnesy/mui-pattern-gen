import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Toolbar,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAIDesignMode } from '../../contexts/AIDesignModeContext';
import { SettingsPanel } from '../patterns/SettingsPanel';
import { PropControl } from '../patterns/PatternPropsPanel';

export const AIDesignModeDrawer: React.FC = () => {
  const {
    isEnabled,
    selectedPattern,
    setSelectedPattern,
  } = useAIDesignMode();

  const [patternConfig, setPatternConfig] = useState<PropControl[]>([]);
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  // Load pattern config when selected pattern changes
  useEffect(() => {
    if (!selectedPattern) {
      setPatternConfig([]);
      setComponentProps({});
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
        const defaults: Record<string, any> = {};
        controls.forEach((control: PropControl) => {
          if (control.defaultValue !== undefined) {
            defaults[control.name] = control.defaultValue;
          }
        });
        
        // Merge with current pattern props
        setComponentProps({ ...defaults, ...selectedPattern.props });
      } catch (error) {
        console.log('No config file found for pattern:', selectedPattern.name);
        setPatternConfig([]);
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, [selectedPattern]);

  // Handle prop changes
  const handlePropChange = useCallback((name: string, value: any) => {
    setComponentProps(prev => ({ ...prev, [name]: value }));
    
    // Update the pattern element with new props
    if (selectedPattern?.element) {
      const event = new CustomEvent('pattern-props-update', {
        detail: { instanceId: selectedPattern.instanceId, props: { ...componentProps, [name]: value } },
      });
      window.dispatchEvent(event);
    }
  }, [componentProps, selectedPattern]);

  // Handle configuration copy
  const handleCopyConfig = () => {
    if (!selectedPattern) return;

    const config = `// ${selectedPattern.name} Configuration
const config = ${JSON.stringify(componentProps, null, 2)};

// To create a new variant:
// "Create a new ${selectedPattern.name} variant called 'custom' with these settings..."`;

    navigator.clipboard.writeText(config);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  // Handle reset
  const handleReset = () => {
    const defaults: Record<string, any> = {};
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
            
            <Stack direction="row" spacing={1}>
              <Chip label={selectedPattern.category} size="small" color="primary" />
              {selectedPattern.hasConfig !== false && (
                <Chip label="Interactive" size="small" variant="outlined" />
              )}
            </Stack>
          </>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Pattern Inspector
          </Typography>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {!selectedPattern ? (
          <Stack spacing={2} sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Click on any pattern to inspect and modify its properties
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Patterns are outlined in purple when AI Design Mode is active
            </Typography>
          </Stack>
        ) : configLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
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
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={copiedConfig ? <CheckIcon /> : <CopyIcon />}
                onClick={handleCopyConfig}
                color={copiedConfig ? 'success' : 'primary'}
              >
                {copiedConfig ? 'Copied!' : 'Copy Configuration'}
              </Button>
              <Button
                fullWidth
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

      {/* Instance Selector (if multiple instances) */}
      {/* TODO: Add instance selector when multiple instances exist */}
    </Box>
  );
};