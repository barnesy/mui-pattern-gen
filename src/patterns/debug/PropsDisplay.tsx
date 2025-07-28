import React from 'react';
import { Card, CardContent, Typography, Divider } from '@mui/material';
import { usePatternProps } from '../../contexts/PatternPropsContext';

export interface PropsDisplayProps {
  title?: string;
  subtitle?: string;
  variant?: 'debug' | 'info' | 'warning';
}

export const PropsDisplay: React.FC<PropsDisplayProps> = (props) => {
  const contextProps = usePatternProps();

  const getVariantColor = () => {
    switch (props.variant || 'debug') {
      case 'info':
        return 'primary.main';
      case 'warning':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card variant="outlined" sx={{ borderColor: getVariantColor() }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {props.title || 'Props Display'}
        </Typography>
        {props.subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {props.subtitle}
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Current Props (from arguments):
        </Typography>
        <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(props, null, 2)}
        </pre>
        {contextProps && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Context Props (from PatternPropsContext):
            </Typography>
            <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(contextProps.props, null, 2)}
            </pre>
            <Typography variant="caption" color="text.secondary">
              Instance: {contextProps.instanceId.slice(-8)}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};
