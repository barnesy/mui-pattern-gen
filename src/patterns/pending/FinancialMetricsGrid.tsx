import React from 'react';
import { 
  Grid,
  Paper,
  Typography, 
  Box,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  Remove,
  Info,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';

export interface MetricItem {
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  description?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  loading?: boolean;
}

export interface FinancialMetricsGridProps {
  metrics: MetricItem[];
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  variant?: 'default' | 'compact' | 'detailed';
  showTrendIcons?: boolean;
  elevation?: number;
}

export const FinancialMetricsGrid: React.FC<FinancialMetricsGridProps> = ({
  metrics = [
    { 
      label: 'Total Revenue', 
      value: 125000, 
      previousValue: 110000,
      change: 13.6, 
      trend: 'up', 
      prefix: '$',
      description: 'Total income for the current period',
      color: 'success'
    },
    { 
      label: 'Operating Expenses', 
      value: 45000, 
      previousValue: 42000,
      change: 7.1, 
      trend: 'up', 
      prefix: '$',
      description: 'Total operational costs',
      color: 'error'
    },
    { 
      label: 'Net Profit', 
      value: 80000,
      previousValue: 68000, 
      change: 17.6, 
      trend: 'up', 
      prefix: '$',
      description: 'Revenue minus expenses',
      color: 'primary'
    },
    { 
      label: 'Profit Margin', 
      value: 64, 
      previousValue: 61.8,
      change: 3.6, 
      trend: 'up', 
      suffix: '%',
      description: 'Net profit as percentage of revenue',
      color: 'info'
    },
    { 
      label: 'Cash Flow', 
      value: 92000, 
      previousValue: 85000,
      change: 8.2, 
      trend: 'up', 
      prefix: '$',
      description: 'Net cash inflow/outflow',
      color: 'success'
    },
    { 
      label: 'Debt Ratio', 
      value: 28, 
      previousValue: 32,
      change: -12.5, 
      trend: 'down', 
      suffix: '%',
      description: 'Total debt to total assets',
      color: 'warning'
    },
  ],
  columns = { xs: 12, sm: 6, md: 4, lg: 3 },
  variant = 'default',
  showTrendIcons = true,
  elevation = 1
}) => {
  const theme = useTheme();

  const formatValue = (metric: MetricItem) => {
    if (metric.loading) return '';
    const value = typeof metric.value === 'number' 
      ? metric.value.toLocaleString() 
      : metric.value;
    return `${metric.prefix || ''}${value}${metric.suffix || ''}`;
  };

  const formatChange = (metric: MetricItem) => {
    if (!metric.change) return null;
    const sign = metric.change > 0 ? '+' : '';
    const suffix = metric.changeType === 'absolute' ? '' : '%';
    return `${sign}${metric.change}${suffix}`;
  };

  const getTrendIcon = (trend?: string, size: 'small' | 'medium' = 'small') => {
    const fontSize = size === 'small' ? 16 : 20;
    if (trend === 'up') return <TrendingUp sx={{ fontSize }} />;
    if (trend === 'down') return <TrendingDown sx={{ fontSize }} />;
    return <Remove sx={{ fontSize }} />;
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    return change > 0 
      ? <ArrowUpward sx={{ fontSize: 14 }} />
      : <ArrowDownward sx={{ fontSize: 14 }} />;
  };

  const getMetricColor = (metric: MetricItem) => {
    if (metric.color) return `${metric.color}.main`;
    if (metric.trend === 'up') return 'success.main';
    if (metric.trend === 'down') return 'error.main';
    return 'text.primary';
  };

  const getChangeColor = (metric: MetricItem) => {
    // For expenses, up is bad (red), down is good (green)
    if (metric.label.toLowerCase().includes('expense') || metric.label.toLowerCase().includes('cost')) {
      return metric.trend === 'up' ? 'error.main' : 'success.main';
    }
    // For debt ratio, down is good
    if (metric.label.toLowerCase().includes('debt')) {
      return metric.trend === 'down' ? 'success.main' : 'error.main';
    }
    // Default: up is good, down is bad
    return metric.trend === 'up' ? 'success.main' : metric.trend === 'down' ? 'error.main' : 'text.secondary';
  };

  const renderCompactMetric = (metric: MetricItem, index: number) => (
    <Grid item {...columns} key={index}>
      <Paper 
        elevation={elevation}
        sx={{ 
          p: 2,
          height: '100%',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: theme.shadows[elevation + 2],
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
              {metric.label}
            </Typography>
            {metric.loading ? (
              <Skeleton width="60%" height={28} />
            ) : (
              <Typography variant="h6" color={getMetricColor(metric)}>
                {formatValue(metric)}
              </Typography>
            )}
          </Box>
          {showTrendIcons && metric.trend && !metric.loading && (
            <Box sx={{ color: getChangeColor(metric) }}>
              {getTrendIcon(metric.trend)}
            </Box>
          )}
        </Box>
        {metric.change !== undefined && !metric.loading && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: getChangeColor(metric),
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5
            }}
          >
            {getChangeIcon(metric.change)}
            {formatChange(metric)}
          </Typography>
        )}
      </Paper>
    </Grid>
  );

  const renderDefaultMetric = (metric: MetricItem, index: number) => (
    <Grid item {...columns} key={index}>
      <Paper 
        elevation={elevation}
        sx={{ 
          p: 3,
          height: '100%',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: theme.shadows[elevation + 3],
            transform: 'translateY(-2px)',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 'medium',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            {metric.label}
          </Typography>
          {metric.description && (
            <Tooltip title={metric.description} placement="top">
              <IconButton size="small" sx={{ p: 0.5 }}>
                <Info sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {metric.loading ? (
          <>
            <Skeleton width="80%" height={36} sx={{ mb: 1 }} />
            <Skeleton width="40%" height={20} />
          </>
        ) : (
          <>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                color: getMetricColor(metric),
                mb: 1
              }}
            >
              {formatValue(metric)}
            </Typography>
            
            {metric.change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette[metric.trend === 'up' ? 'success' : 'error'].main, 0.1),
                    color: getChangeColor(metric),
                  }}
                >
                  {getChangeIcon(metric.change)}
                  <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                    {formatChange(metric)}
                  </Typography>
                </Box>
                {metric.previousValue && (
                  <Typography variant="caption" color="text.secondary">
                    from {metric.prefix}{metric.previousValue}{metric.suffix}
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
        
        {/* Decorative gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: `linear-gradient(135deg, transparent 0%, ${alpha(theme.palette[metric.color || 'primary'].main, 0.05)} 100%)`,
            pointerEvents: 'none',
          }}
        />
      </Paper>
    </Grid>
  );

  const renderDetailedMetric = (metric: MetricItem, index: number) => (
    <Grid item {...columns} key={index}>
      <Paper 
        elevation={elevation}
        sx={{ 
          height: '100%',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: theme.shadows[elevation + 3],
          }
        }}
      >
        <Box 
          sx={{ 
            p: 2,
            bgcolor: alpha(theme.palette[metric.color || 'primary'].main, 0.08),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
              {metric.label}
            </Typography>
            {showTrendIcons && metric.trend && !metric.loading && (
              <Box sx={{ color: getMetricColor(metric) }}>
                {getTrendIcon(metric.trend, 'medium')}
              </Box>
            )}
          </Box>
        </Box>
        
        <Box sx={{ p: 2 }}>
          {metric.loading ? (
            <>
              <Skeleton width="100%" height={40} sx={{ mb: 1 }} />
              <Skeleton width="60%" height={20} />
            </>
          ) : (
            <>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  color: getMetricColor(metric),
                  mb: 1
                }}
              >
                {formatValue(metric)}
              </Typography>
              
              {metric.previousValue && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Previous: {metric.prefix}{metric.previousValue}{metric.suffix}
                  </Typography>
                </Box>
              )}
              
              {metric.change !== undefined && (
                <Box 
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette[metric.trend === 'up' ? 'success' : 'error'].main, 0.1),
                    color: getChangeColor(metric),
                  }}
                >
                  {getChangeIcon(metric.change)}
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {formatChange(metric)}
                  </Typography>
                </Box>
              )}
              
              {metric.description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ display: 'block', mt: 1.5 }}
                >
                  {metric.description}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Grid>
  );

  const renderMetric = (metric: MetricItem, index: number) => {
    switch (variant) {
      case 'compact':
        return renderCompactMetric(metric, index);
      case 'detailed':
        return renderDetailedMetric(metric, index);
      default:
        return renderDefaultMetric(metric, index);
    }
  };

  return (
    <Grid container spacing={2}>
      {metrics.map((metric, index) => renderMetric(metric, index))}
    </Grid>
  );
};