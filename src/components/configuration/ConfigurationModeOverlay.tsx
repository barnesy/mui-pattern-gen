import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Divider,
  Button,
  Fade,
  Popper,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { useConfigurationMode } from '../../contexts/ConfigurationModeContext';
import { getComponentMetadata } from '../../theme/componentMetadata';

export const ConfigurationModeOverlay: React.FC = () => {
  const { 
    isEnabled, 
    hoveredPattern, 
    selectedPattern, 
    setSelectedPattern,
    currentPrototype,
    exportConfiguration,
    savePrototype,
  } = useConfigurationMode();
  
  const [expanded, setExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const pattern = selectedPattern || hoveredPattern;
  const metadata = pattern ? getComponentMetadata(pattern.name) : undefined;

  useEffect(() => {
    if (!pattern) {
      setExpanded(false);
    }
  }, [pattern]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyConfiguration = () => {
    const config = exportConfiguration();
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleQuickSave = async () => {
    if (currentPrototype?.id) {
      await savePrototype();
    }
  };

  const generateCodeSnippet = () => {
    if (!pattern) return '';

    const props = Object.entries(pattern.props)
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => {
        if (typeof value === 'string') return `${key}="${value}"`;
        if (typeof value === 'boolean' && value) return key;
        return `${key}={${JSON.stringify(value)}}`;
      })
      .join(' ');

    return `<${pattern.name} ${props} />`;
  };

  if (!isEnabled || !pattern) return null;

  const anchorEl = pattern.element;

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="top"
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport',
          },
        },
      ]}
      transition
      style={{ zIndex: 9999 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper
            elevation={8}
            data-ai-ignore="true"
            sx={{
              p: 2,
              maxWidth: 420,
              minWidth: 300,
              background: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.5}>
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                    {pattern.name}
                    {pattern.isSubComponent && (
                      <Chip 
                        label="Sub" 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                        sx={{ fontSize: '0.6rem', height: 20 }}
                      />
                    )}
                  </Typography>
                  {metadata && (
                    <Typography variant="caption" color="grey.400">
                      {metadata.description}
                    </Typography>
                  )}
                  {currentPrototype && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: currentPrototype.isDirty ? 'warning.main' : 'success.main',
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        mt: 0.5,
                        display: 'block',
                      }}
                    >
                      {currentPrototype.name} {currentPrototype.isDirty ? '(unsaved)' : '(saved)'}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={0.5}>
                  {/* Quick actions */}
                  {currentPrototype?.id && currentPrototype.isDirty && (
                    <IconButton
                      size="small"
                      onClick={handleQuickSave}
                      sx={{ color: 'success.main' }}
                      title="Quick save"
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={handleCopyConfiguration}
                    sx={{ color: copiedConfig ? 'success.main' : 'grey.400' }}
                    title="Copy configuration"
                  >
                    <ExportIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                    sx={{ color: 'grey.400' }}
                  >
                    {expanded ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                  {selectedPattern && (
                    <IconButton
                      size="small"
                      onClick={() => setSelectedPattern(null)}
                      sx={{ color: 'grey.400' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Stack>
              </Box>

              {/* Pattern Info */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={pattern.status}
                  size="small"
                  color={pattern.status === 'pending' ? 'warning' : 'success'}
                  variant="outlined"
                />
                <Chip
                  label={pattern.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {pattern.hasConfig && (
                  <Chip
                    label="Interactive"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
                {pattern.isSubComponent && (
                  <Chip
                    label="Sub-component"
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Stack>

              <Divider sx={{ borderColor: 'grey.700' }} />

              {/* Code Snippet */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="caption" color="grey.400">
                    Component Code
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => handleCopyCode(generateCodeSnippet())}
                    sx={{
                      color: copiedCode ? 'success.main' : 'grey.400',
                      fontSize: '0.75rem',
                    }}
                  >
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </Button>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'grey.900',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: 'grey.100',
                    overflowX: 'auto',
                  }}
                >
                  {generateCodeSnippet()}
                </Box>
              </Box>

              {/* Configuration Summary */}
              {currentPrototype && (
                <Box>
                  <Typography variant="caption" color="grey.400" display="block" mb={0.5}>
                    Configuration Summary
                  </Typography>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: 'grey.900',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color: 'grey.300',
                    }}
                  >
                    <Box>Instance ID: {pattern.instanceId.slice(-8)}...</Box>
                    <Box>Prototype: {currentPrototype.name}</Box>
                    <Box>Status: {currentPrototype.isDirty ? 'Modified' : 'Saved'}</Box>
                    {currentPrototype.lastSaved && (
                      <Box>Last saved: {new Date(currentPrototype.lastSaved).toLocaleTimeString()}</Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Expanded Props */}
              <Collapse in={expanded}>
                <Stack spacing={1.5} mt={1}>
                  <Divider sx={{ borderColor: 'grey.700' }} />
                  <Typography variant="caption" color="grey.400">
                    Current Props
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      p: 1,
                      bgcolor: 'grey.900',
                      borderRadius: 1,
                    }}
                  >
                    {Object.entries(pattern.props).map(([key, value]) => (
                      <Box key={key} sx={{ mb: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            color: 'info.main',
                          }}
                        >
                          {key}:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            color: 'grey.300',
                            ml: 1,
                          }}
                        >
                          {JSON.stringify(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Configuration Actions */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      onClick={handleCopyConfiguration}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {copiedConfig ? 'Copied Config!' : 'Copy Config'}
                    </Button>
                    {currentPrototype?.id && currentPrototype.isDirty && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleQuickSave}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Save
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Collapse>
            </Stack>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};