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
  Code as CodeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAIDesignMode } from '../../contexts/AIDesignModeContext';
import { getComponentMetadata } from '../../theme/componentMetadata';

export const AIDesignModeOverlay: React.FC = () => {
  const { isEnabled, hoveredComponent, selectedComponent, showOverlay, setSelectedComponent } =
    useAIDesignMode();
  const [expanded, setExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const component = selectedComponent || hoveredComponent;
  const metadata = component ? getComponentMetadata(component.name) : undefined;

  useEffect(() => {
    if (!component) {
      setExpanded(false);
    }
  }, [component]);

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

  const generateCodeSnippet = () => {
    if (!component) {return '';}

    const props = Object.entries(component.props)
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => {
        if (typeof value === 'string') {return `${key}="${value}"`;}
        if (typeof value === 'boolean' && value) {return key;}
        return `${key}={${JSON.stringify(value)}}`;
      })
      .join(' ');

    return `<${component.name} ${props} />`;
  };

  if (!isEnabled || !showOverlay || !component) {return null;}

  const anchorEl = component.element;

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
              maxWidth: 400,
              minWidth: 280,
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
                    <CodeIcon fontSize="small" />
                    {component.name}
                  </Typography>
                  {metadata && (
                    <Typography variant="caption" color="grey.400">
                      {metadata.description}
                    </Typography>
                  )}
                  {component.displayReference && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'primary.light',
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        mt: 0.5,
                      }}
                    >
                      {component.displayReference}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                    sx={{ color: 'grey.400' }}
                  >
                    {expanded ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                  {selectedComponent && (
                    <IconButton
                      size="small"
                      onClick={() => setSelectedComponent(null)}
                      sx={{ color: 'grey.400' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Stack>
              </Box>

              {/* Component Reference */}
              {component.reference && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="caption" color="grey.400">
                      Component Reference
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={() => handleCopyRef(component.reference)}
                      sx={{
                        color: copiedRef ? 'success.main' : 'grey.400',
                        fontSize: '0.7rem',
                        minWidth: 'auto',
                        py: 0,
                      }}
                    >
                      {copiedRef ? 'Copied!' : 'Copy Ref'}
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: 'grey.900',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color: 'grey.300',
                      overflowX: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {component.reference}
                  </Box>
                </Box>
              )}

              {/* Quick Info */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {component.variant && (
                  <Chip
                    label={`variant: ${component.variant}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {component.size && (
                  <Chip
                    label={`size: ${component.size}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {component.color && (
                  <Chip
                    label={`color: ${component.color}`}
                    size="small"
                    sx={{
                      borderColor: 'success.main',
                      color: 'success.main',
                    }}
                    variant="outlined"
                  />
                )}
                {component.gridPosition && (
                  <Chip
                    label={component.gridPosition}
                    size="small"
                    sx={{
                      borderColor: 'warning.main',
                      color: 'warning.main',
                    }}
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

              {/* Expanded Props */}
              <Collapse in={expanded}>
                <Stack spacing={1.5} mt={1}>
                  <Divider sx={{ borderColor: 'grey.700' }} />
                  <Typography variant="caption" color="grey.400">
                    All Props
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
                    {Object.entries(component.props).map(([key, value]) => (
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
                </Stack>
              </Collapse>
            </Stack>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};
