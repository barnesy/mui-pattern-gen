import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

export interface LabelValuePairProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'inline' | 'stacked' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  labelColor?: 'primary' | 'secondary' | 'text.primary' | 'text.secondary' | 'text.disabled';
  valueColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'text.primary' | 'text.secondary';
  valueWeight?: 'normal' | 'medium' | 'bold';
  helpText?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  loading?: boolean;
  chip?: boolean;
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  spacing?: number;
}

export const LabelValuePair: React.FC<LabelValuePairProps> = ({
  label = 'Label',
  value = 'Value',
  variant = 'default',
  size = 'medium',
  labelColor = 'text.secondary',
  valueColor = 'text.primary',
  valueWeight = 'medium',
  helpText,
  trend,
  trendValue,
  loading = false,
  chip = false,
  chipColor = 'default',
  icon,
  align = 'left',
  spacing = 0.5,
}) => {
  const theme = useTheme();

  const sizeMap = {
    small: {
      labelSize: 'caption',
      valueSize: 'body2',
      iconSize: 16,
      chipSize: 'small' as const,
    },
    medium: {
      labelSize: 'body2',
      valueSize: 'body1',
      iconSize: 18,
      chipSize: 'small' as const,
    },
    large: {
      labelSize: 'body1',
      valueSize: 'h6',
      iconSize: 20,
      chipSize: 'medium' as const,
    },
  };

  const currentSize = sizeMap[size];

  const getTrendIcon = () => {
    if (!trend) return null;
    const iconProps = { 
      sx: { 
        fontSize: currentSize.iconSize,
        color: trend === 'up' ? theme.palette.success.main : 
               trend === 'down' ? theme.palette.error.main : 
               theme.palette.text.secondary
      } 
    };
    
    switch (trend) {
      case 'up':
        return <TrendingUpIcon {...iconProps} />;
      case 'down':
        return <TrendingDownIcon {...iconProps} />;
      case 'flat':
        return <TrendingFlatIcon {...iconProps} />;
      default:
        return null;
    }
  };

  const renderValue = () => {
    if (loading) {
      return <Skeleton width={60} height={20} />;
    }

    const valueContent = (
      <Typography
        variant={currentSize.valueSize}
        color={valueColor}
        fontWeight={valueWeight === 'bold' ? 700 : valueWeight === 'medium' ? 500 : 400}
        component="span"
      >
        {value}
      </Typography>
    );

    if (chip) {
      return (
        <Chip
          label={value}
          size={currentSize.chipSize}
          color={chipColor}
          sx={{ fontWeight: valueWeight === 'bold' ? 700 : valueWeight === 'medium' ? 500 : 400 }}
        />
      );
    }

    return valueContent;
  };

  const renderLabel = () => {
    const labelContent = (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {icon && (
          <Box sx={{ color: labelColor, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        <Typography
          variant={currentSize.labelSize}
          color={labelColor}
          component="span"
        >
          {label}
        </Typography>
        {helpText && (
          <Tooltip title={helpText} arrow placement="top">
            <InfoIcon sx={{ fontSize: currentSize.iconSize - 2, color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        )}
      </Stack>
    );

    if (loading) {
      return <Skeleton width={80} height={16} />;
    }

    return labelContent;
  };

  const renderTrend = () => {
    if (!trend || loading) return null;

    return (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {getTrendIcon()}
        {trendValue && (
          <Typography
            variant="caption"
            color={
              trend === 'up' ? 'success.main' : 
              trend === 'down' ? 'error.main' : 
              'text.secondary'
            }
          >
            {trendValue}
          </Typography>
        )}
      </Stack>
    );
  };

  // Inline variant
  if (variant === 'inline') {
    return (
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={spacing}
        justifyContent={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
      >
        {renderLabel()}
        <Typography variant={currentSize.labelSize} color="text.secondary">:</Typography>
        {renderValue()}
        {renderTrend()}
      </Stack>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <Stack 
        direction="row" 
        alignItems="baseline" 
        spacing={spacing}
        justifyContent={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
      >
        {renderValue()}
        <Typography variant={currentSize.labelSize} color={labelColor}>
          {label}
        </Typography>
        {renderTrend()}
      </Stack>
    );
  }

  // Stacked variant
  if (variant === 'stacked') {
    return (
      <Stack 
        spacing={spacing}
        alignItems={align}
      >
        {renderLabel()}
        <Stack direction="row" alignItems="center" spacing={1}>
          {renderValue()}
          {renderTrend()}
        </Stack>
      </Stack>
    );
  }

  // Default variant
  return (
    <Box textAlign={align}>
      {renderLabel()}
      <Box mt={spacing}>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent={align}>
          {renderValue()}
          {renderTrend()}
        </Stack>
      </Box>
    </Box>
  );
};