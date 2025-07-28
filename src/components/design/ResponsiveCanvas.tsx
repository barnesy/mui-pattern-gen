import React, { useState } from 'react';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Smartphone,
  Tablet,
  Computer,
  Fullscreen,
  FullscreenExit,
  GridOn,
  GridOff,
  Refresh,
} from '@mui/icons-material';

export interface ResponsiveCanvasProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

// Viewport presets
const viewportPresets = {
  mobile: { width: 375, label: 'Mobile', icon: <Smartphone /> },
  tablet: { width: 768, label: 'Tablet', icon: <Tablet /> },
  desktop: { width: 1200, label: 'Desktop', icon: <Computer /> },
};

/**
 * Responsive canvas for previewing components at different viewport sizes
 */
export const ResponsiveCanvas: React.FC<ResponsiveCanvasProps> = ({ children, onRefresh }) => {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);

  const currentViewport = viewportPresets[viewport];

  // Handle viewport change
  const handleViewportChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewport: 'mobile' | 'tablet' | 'desktop' | null
  ) => {
    if (newViewport) {
      setViewport(newViewport);
      // Reset zoom when changing viewport
      setZoom(100);
    }
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(50, Math.min(150, prev + delta)));
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Viewport selector */}
        <ToggleButtonGroup value={viewport} exclusive onChange={handleViewportChange} size="small">
          {Object.entries(viewportPresets).map(([key, preset]) => (
            <ToggleButton key={key} value={key}>
              <Tooltip title={`${preset.label} (${preset.width}px)`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {preset.icon}
                  <Typography variant="caption">{preset.width}px</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Zoom controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" onClick={() => handleZoom(-10)} disabled={zoom <= 50}>
            <Typography variant="caption">-</Typography>
          </IconButton>
          <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
            {zoom}%
          </Typography>
          <IconButton size="small" onClick={() => handleZoom(10)} disabled={zoom >= 150}>
            <Typography variant="caption">+</Typography>
          </IconButton>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {/* Action buttons */}
        <Tooltip title="Toggle grid">
          <IconButton size="small" onClick={() => setShowGrid(!showGrid)}>
            {showGrid ? <GridOff /> : <GridOn />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Refresh">
          <IconButton size="small" onClick={onRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>

        <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Canvas area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          p: 3,
          bgcolor: 'grey.100',
          position: 'relative',
        }}
      >
        {/* Grid overlay */}
        {showGrid && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(0deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Viewport container */}
        <Paper
          elevation={4}
          sx={{
            width: viewport === 'desktop' ? '100%' : currentViewport.width,
            maxWidth: currentViewport.width,
            minHeight: 600,
            bgcolor: 'background.paper',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Viewport label */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 2,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 1000,
            }}
          >
            <Typography variant="caption">{currentViewport.label} View</Typography>
            <Typography variant="caption">
              {currentViewport.width}px × {zoom}%
            </Typography>
          </Box>

          {/* Content area */}
          <Box sx={{ pt: 4, p: 3, minHeight: 600 }}>{children}</Box>
        </Paper>
      </Box>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'background.paper',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <IconButton onClick={() => setIsFullscreen(false)}>
              <FullscreenExit />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>{children}</Box>
        </Box>
      )}
    </Box>
  );
};
