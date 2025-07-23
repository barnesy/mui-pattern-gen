import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Grid
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';

export interface BudgetStatsCardProps {
  variant?: 'default' | 'minimal' | 'detailed';
  title?: string;
  value?: number | string;
  currency?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  period?: string;
  budget?: number;
  spent?: number;
  remaining?: number;
  showProgress?: boolean;
  showTrend?: boolean;
  showDetails?: boolean;
  categories?: Array<{
    name: string;
    amount: number;
    percentage: number;
    color?: string;
  }>;
  accentColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  elevation?: number;
}

export const BudgetStatsCard: React.FC<BudgetStatsCardProps> = ({
  variant = 'default',
  title = 'Monthly Budget',
  value = 4250,
  currency = '$',
  change = 12.5,
  changeType = 'increase',
  period = 'vs last month',
  budget = 5000,
  spent = 3250,
  remaining = 1750,
  showProgress = true,
  showTrend = true,
  showDetails = true,
  categories = [
    { name: 'Marketing', amount: 1200, percentage: 37, color: '#3f51b5' },
    { name: 'Operations', amount: 950, percentage: 29, color: '#f50057' },
    { name: 'Development', amount: 650, percentage: 20, color: '#ff9800' },
    { name: 'Other', amount: 450, percentage: 14, color: '#4caf50' }
  ],
  accentColor = 'primary',
  elevation = 1
}) => {
  const theme = useTheme();
  
  const progressPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = spent > budget;
  
  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUpIcon fontSize="small" />;
      case 'decrease':
        return <TrendingDownIcon fontSize="small" />;
      default:
        return <TrendingFlatIcon fontSize="small" />;
    }
  };
  
  const getTrendColor = () => {
    switch (changeType) {
      case 'increase':
        return theme.palette.success.main;
      case 'decrease':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatCurrency = (amount: number | string) => {
    if (typeof amount === 'string') return amount;
    return `${currency}${amount.toLocaleString()}`;
  };

  if (variant === 'minimal') {
    return (
      <Card elevation={elevation}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(value)}
              </Typography>
            </Box>
            {showTrend && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ color: getTrendColor() }}>
                  {getTrendIcon()}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: getTrendColor(), fontWeight: 'medium' }}
                >
                  {change > 0 ? '+' : ''}{change}%
                </Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={elevation}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box>
              <Typography variant="h6" component="div" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(value)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="More information">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {/* Trend */}
          {showTrend && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                icon={changeType === 'increase' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                label={`${change > 0 ? '+' : ''}${change}%`}
                size="small"
                sx={{
                  backgroundColor: alpha(getTrendColor(), 0.1),
                  color: getTrendColor(),
                  '& .MuiChip-icon': {
                    color: getTrendColor()
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {period}
              </Typography>
            </Stack>
          )}

          {/* Progress Bar */}
          {showProgress && budget > 0 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Spent: {formatCurrency(spent)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Budget: {formatCurrency(budget)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(progressPercentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: isOverBudget 
                      ? theme.palette.error.main 
                      : progressPercentage > 80 
                        ? theme.palette.warning.main 
                        : theme.palette[accentColor].main,
                    borderRadius: 4
                  }
                }}
              />
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography variant="caption" color="text.secondary">
                  {progressPercentage.toFixed(0)}% used
                </Typography>
                <Typography 
                  variant="caption" 
                  color={isOverBudget ? 'error' : 'text.secondary'}
                >
                  {isOverBudget ? 'Over budget!' : `${formatCurrency(remaining)} remaining`}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Category Breakdown */}
          {showDetails && variant === 'detailed' && categories.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Breakdown by Category
              </Typography>
              <Grid container spacing={1}>
                {categories.map((category, index) => (
                  <Grid item xs={6} key={index}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color || theme.palette.primary.main
                        }}
                      />
                      <Box flex={1}>
                        <Typography variant="body2" noWrap>
                          {category.name}
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={0.5}>
                          <Typography variant="caption" fontWeight="medium">
                            {formatCurrency(category.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({category.percentage}%)
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};