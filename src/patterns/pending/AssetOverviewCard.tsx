import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import { 
  MoreVert, 
  AccountBalance,
  ShowChart,
  Home,
  DirectionsCar,
  Savings
} from '@mui/icons-material';

export interface AssetOverviewCardProps {
  title?: string;
  totalValue: number;
  lastUpdated?: string;
  assets: {
    name: string;
    category: 'real_estate' | 'stocks' | 'vehicles' | 'savings' | 'other';
    value: number;
    allocation: number;
    change?: number;
    icon?: React.ReactNode;
  }[];
  showProgress?: boolean;
  onMenuAction?: (action: string) => void;
}

export const AssetOverviewCard: React.FC<AssetOverviewCardProps> = ({
  title = 'Asset Overview',
  totalValue = 850000,
  lastUpdated = 'Updated 2 hours ago',
  assets = [
    { name: 'Real Estate', category: 'real_estate', value: 450000, allocation: 52.9, change: 3.2 },
    { name: 'Stock Portfolio', category: 'stocks', value: 250000, allocation: 29.4, change: 12.5 },
    { name: 'Savings Account', category: 'savings', value: 100000, allocation: 11.8, change: 0.5 },
    { name: 'Vehicles', category: 'vehicles', value: 50000, allocation: 5.9, change: -5.0 },
  ],
  showProgress = true,
  onMenuAction
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action: string) => {
    onMenuAction?.(action);
    handleMenuClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'real_estate':
        return <Home sx={{ fontSize: 20 }} />;
      case 'stocks':
        return <ShowChart sx={{ fontSize: 20 }} />;
      case 'vehicles':
        return <DirectionsCar sx={{ fontSize: 20 }} />;
      case 'savings':
        return <Savings sx={{ fontSize: 20 }} />;
      default:
        return <AccountBalance sx={{ fontSize: 20 }} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'real_estate':
        return theme.palette.primary.main;
      case 'stocks':
        return theme.palette.success.main;
      case 'vehicles':
        return theme.palette.warning.main;
      case 'savings':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text.secondary';
    return change > 0 ? 'success.main' : 'error.main';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium', mb: 0.5 }}>
              {formatCurrency(totalValue)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {lastUpdated}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          {assets.map((asset, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      bgcolor: alpha(getCategoryColor(asset.category), 0.1),
                      color: getCategoryColor(asset.category),
                    }}
                  >
                    {asset.icon || getCategoryIcon(asset.category)}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {asset.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {asset.allocation}% of portfolio
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {formatCurrency(asset.value)}
                  </Typography>
                  {asset.change !== undefined && (
                    <Typography 
                      variant="caption" 
                      color={getChangeColor(asset.change)}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}
                    >
                      {asset.change > 0 ? '+' : ''}{asset.change}%
                    </Typography>
                  )}
                </Box>
              </Box>
              {showProgress && (
                <Tooltip title={`${asset.allocation}% of total assets`} placement="top">
                  <LinearProgress 
                    variant="determinate" 
                    value={asset.allocation} 
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.divider, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getCategoryColor(asset.category),
                        borderRadius: 1,
                      }
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          ))}
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleMenuItemClick('view-details')}>View Details</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('edit-assets')}>Edit Assets</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('export')}>Export Report</MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};