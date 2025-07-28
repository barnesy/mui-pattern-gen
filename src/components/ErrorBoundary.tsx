import React, { Component, ReactNode } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import { logger } from '../services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('Error caught by boundary:', 'ErrorBoundary', { error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const isDevelopment = import.meta.env.DEV;
      const showDetails = this.props.showDetails ?? isDevelopment;

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 600 }}>
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            {this.state.error?.message && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {this.state.error.message}
              </Alert>
            )}

            {showDetails && this.state.error?.stack && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Error Details:
                </Typography>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 200,
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error.stack}
                </Typography>
              </>
            )}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
