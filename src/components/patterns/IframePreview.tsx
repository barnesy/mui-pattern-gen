import React, { useRef, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface IframePreviewProps {
  componentName: string;
  componentProps: Record<string, any>;
  theme: 'light' | 'dark';
  width: number | string;
  onLoad?: () => void;
  isFullscreen?: boolean;
  componentPath?: string;
  density?: 'comfortable' | 'compact' | 'spacious';
}

export const IframePreview: React.FC<IframePreviewProps> = ({
  componentName,
  componentProps,
  theme,
  width,
  onLoad,
  isFullscreen = false,
  componentPath,
  density = 'comfortable'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number>(400);

  // Generate iframe URL with component name and path
  const params = new URLSearchParams({
    component: componentName,
    theme: theme
  });
  if (componentPath) {
    params.append('path', componentPath);
  }
  const iframeUrl = `/pattern-preview.html?${params.toString()}`;

  // Listen for iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PREVIEW_READY') {
        setIframeReady(true);
        setIsLoading(false);
        onLoad?.();
      } else if (event.data.type === 'CONTENT_HEIGHT') {
        setIframeHeight(event.data.height);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoad]);

  // Send props to iframe when ready
  useEffect(() => {
    if (iframeReady && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'UPDATE_PROPS',
        props: componentProps
      }, '*');
    }
  }, [componentProps, iframeReady]);

  // Send theme updates
  useEffect(() => {
    if (iframeReady && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'UPDATE_THEME',
        theme
      }, '*');
    }
  }, [theme, iframeReady]);

  // Send density updates
  useEffect(() => {
    if (iframeReady && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'UPDATE_DENSITY',
        density
      }, '*');
    }
  }, [density, iframeReady]);

  return (
    <Box sx={{ 
      position: 'relative', 
      width, 
      height: isFullscreen ? '100vh' : 'auto',
      minHeight: isFullscreen ? '100vh' : iframeHeight 
    }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        style={{
          width: '100%',
          height: isFullscreen ? '100vh' : iframeHeight,
          border: 'none',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s, height 0.2s',
          backgroundColor: 'transparent',
          display: 'block', // Remove inline spacing
          verticalAlign: 'bottom', // Prevent baseline alignment issues
        }}
        title="Pattern Preview"
      />
    </Box>
  );
};