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
import { SpacingConfig, getSpacingValue } from '../../types/PatternVariant';
import { TypographyVariant } from '../../types/TypographyConfig';

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
  showLabel?: boolean;
  showValue?: boolean;
  showTrend?: boolean;
  showHelpIcon?: boolean;
  padding?: SpacingConfig;
  margin?: SpacingConfig;
  labelVariant?: TypographyVariant;
  valueVariant?: TypographyVariant;
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
  showLabel = true,
  showValue = true,
  showTrend = true,
  showHelpIcon = true,
  padding,
  margin,
  labelVariant = 'body2',
  valueVariant = 'body1',
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
      fontSize: size === 'small' ? 'small' : size === 'large' ? 'medium' : 'small',
      sx: { 
        color: trend === 'up' ? theme.palette.success.main : 
               trend === 'down' ? theme.palette.error.main : 
               theme.palette.text.secondary
      } 
    } as const;
    
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
        variant={valueVariant}
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
          variant={labelVariant}
          color={labelColor}
          component="span"
        >
          {label}
        </Typography>
        {helpText && showHelpIcon && (
          <Tooltip title={helpText} arrow placement="top">
            <InfoIcon fontSize="small" sx={{ color: 'text.disabled', cursor: 'help' }} />
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
    if (!trend || !showTrend || loading) return null;

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

  // Render the content based on variant
  const renderContent = () => {
    // Inline variant
    if (variant === 'inline') {
      return (
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={spacing}
          justifyContent={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
        >
          {showLabel && renderLabel()}
          <Typography variant={labelVariant} color="text.secondary">:</Typography>
          {showValue && renderValue()}
          {showTrend && renderTrend()}
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
          {showValue && renderValue()}
          {showLabel && (
            <Typography variant={labelVariant} color={labelColor}>
              {label}
            </Typography>
          )}
          {showTrend && renderTrend()}
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
          {showLabel && renderLabel()}
          <Stack direction="row" alignItems="center" spacing={1}>
            {showValue && renderValue()}
            {showTrend && renderTrend()}
          </Stack>
        </Stack>
      );
    }

    // Default variant
    return (
      <Box textAlign={align}>
        {showLabel && renderLabel()}
        <Box mt={spacing}>
          <Stack direction="row" alignItems="center" spacing={1} justifyContent={align}>
            {showValue && renderValue()}
            {showTrend && renderTrend()}
          </Stack>
        </Box>
      </Box>
    );
  };

  // Wrap content with padding and margin
  return (
    <Box
      sx={{
        padding: padding ? getSpacingValue(padding) : undefined,
        margin: margin ? getSpacingValue(margin) : undefined,
      }}
    >
      {renderContent()}
    </Box>
  );
};