import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  IconButton,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Smartphone as MobileIcon,
  Tablet as TabletIcon,
  Computer as DesktopIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { Prototype } from '../../types/prototype';

interface PrototypePreviewProps {
  prototype: Prototype;
  onClose?: () => void;
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const deviceSizes: Record<DeviceSize, { width: number; height: number; label: string }> = {
  mobile: { width: 375, height: 667, label: 'Mobile' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  desktop: { width: 1200, height: 800, label: 'Desktop' },
};

export const PrototypePreview: React.FC<PrototypePreviewProps> = ({
  prototype,
  onClose,
}) => {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState(600);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle iframe load
  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
    
    // Try to get height from iframe content
    try {
      if (iframeRef.current?.contentWindow) {
        const iframe = iframeRef.current;
        const contentHeight = iframe.contentWindow.document.body.scrollHeight;
        if (contentHeight > 0) {
          setIframeHeight(Math.min(contentHeight + 20, 800)); // Add padding, max 800px
        }
      }
    } catch (err) {
      // Cross-origin issues, use default height
      console.warn('Could not access iframe content for height calculation');
    }
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to load prototype preview');
  };

  // Refresh preview
  const handleRefresh = () => {
    if (iframeRef.current) {
      setLoading(true);
      setError(null);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Copy prototype URL
  const handleCopyUrl = async () => {
    try {
      const url = `${window.location.origin}/prototypes/${prototype.id}`;
      await navigator.clipboard.writeText(url);
      // TODO: Show success toast
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Toggle fullscreen
  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Generate preview URL based on prototype
  const getPreviewUrl = (): string => {
    // For now, generate a placeholder URL
    // In a real implementation, this would render the prototype based on its schema
    const baseUrl = '/preview-prototype';
    const params = new URLSearchParams({
      id: prototype.id,
      theme: isDarkMode ? 'dark' : 'light',
      device: deviceSize,
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const currentSize = deviceSizes[deviceSize];

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Preview Controls */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {/* Device Size Selector */}
        <ToggleButtonGroup
          value={deviceSize}
          exclusive
          onChange={(_, value) => value && setDeviceSize(value)}
          size="small"
        >
          <ToggleButton value="mobile">
            <Tooltip title="Mobile (375px)">
              <MobileIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="tablet">
            <Tooltip title="Tablet (768px)">
              <TabletIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="desktop">
            <Tooltip title="Desktop (1200px)">
              <DesktopIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Theme Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
              icon={<LightModeIcon />}
              checkedIcon={<DarkModeIcon />}
            />
          }
          label="Dark Mode"
        />

        <Box sx={{ flex: 1 }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh Preview">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Copy URL">
            <IconButton onClick={handleCopyUrl} size="small">
              <LinkIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <IconButton onClick={handleFullscreen} size="small">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Preview Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: 2,
          bgcolor: 'grey.50',
          position: 'relative',
          overflow: 'auto',
        }}
      >
        {/* Device Frame */}
        <Card
          elevation={3}
          sx={{
            width: currentSize.width,
            height: deviceSize === 'desktop' ? iframeHeight : currentSize.height,
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Device Header */}
          <Box
            sx={{
              p: 1,
              bgcolor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 40,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'error.main',
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'warning.main',
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {prototype.name} - {currentSize.label}
            </Typography>
          </Box>

          {/* Preview Content */}
          <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                  zIndex: 1,
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">
                    Loading prototype preview...
                  </Typography>
                </Stack>
              </Box>
            )}

            {error && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  zIndex: 1,
                }}
              >
                <Alert severity="error" sx={{ maxWidth: 400 }}>
                  {error}
                </Alert>
              </Box>
            )}

            {/* Preview Iframe */}
            <iframe
              ref={iframeRef}
              src={getPreviewUrl()}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: isDarkMode ? '#121212' : '#ffffff',
              }}
              title={`Preview of ${prototype.name}`}
              sandbox="allow-scripts allow-same-origin"
            />
          </Box>
        </Card>
      </Box>

      {/* Prototype Info */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Prototype Details
          </Typography>
          <Stack direction="row" spacing={4}>
            <Typography variant="body2">
              <strong>Schema:</strong> {prototype.schema.type}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {prototype.metadata.status}
            </Typography>
            <Typography variant="body2">
              <strong>Version:</strong> {prototype.metadata.version}
            </Typography>
            {prototype.metadata.author && (
              <Typography variant="body2">
                <strong>Author:</strong> {prototype.metadata.author}
              </Typography>
            )}
          </Stack>
          {prototype.description && (
            <Typography variant="body2" color="text.secondary">
              {prototype.description}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};