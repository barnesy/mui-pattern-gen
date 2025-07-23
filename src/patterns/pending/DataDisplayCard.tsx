import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Button,
  Tooltip,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { LabelValuePair } from './LabelValuePair';
import { getDemoData } from './DataDisplayCard.config';

export interface DataDisplayCardProps {
  variant?: 'stats' | 'list' | 'table' | 'workflow' | 'mixed';
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  menuItems?: Array<{ label: string; onClick: () => void }>;
  
  // Stats variant props
  stats?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  }>;
  
  // List variant props
  listItems?: Array<{
    id: string;
    primary: string;
    secondary?: string;
    avatar?: string | React.ReactNode;
    action?: React.ReactNode;
    status?: 'success' | 'warning' | 'error' | 'info';
  }>;
  
  // Table variant props
  tableColumns?: string[];
  tableData?: Array<Record<string, any>>;
  
  // Workflow variant props
  workflowSteps?: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'active' | 'pending' | 'error';
    timestamp?: string;
  }>;
  
  // Mixed content
  customContent?: React.ReactNode;
  
  // Common props
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  maxHeight?: number | string;
  elevation?: number;
  headerDivider?: boolean;
  contentPadding?: boolean;
  
  // Demo data
  demoDataType?: string;
  showMenuItems?: boolean;
  showAction?: boolean;
}

export const DataDisplayCard: React.FC<DataDisplayCardProps> = ({
  variant = 'stats',
  title = 'Performance Overview',
  subtitle = 'Last 30 days',
  action,
  menuItems,
  stats = [],
  listItems = [],
  tableColumns = [],
  tableData = [],
  workflowSteps = [],
  customContent,
  loading = false,
  error,
  emptyMessage = 'No data available',
  maxHeight,
  elevation = 1,
  headerDivider = true,
  contentPadding = true,
  demoDataType,
  showMenuItems = true,
  showAction = false,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Determine effective demo data type based on variant if not explicitly set
  const effectiveDemoType = demoDataType || (
    variant === 'stats' ? 'revenue' : 
    variant === 'list' ? 'users' : 
    variant === 'table' ? 'sales' : 
    variant === 'workflow' ? 'workflow' : 
    variant === 'mixed' ? 'dashboard' : 
    'empty'
  );
  
  const demoData = effectiveDemoType !== 'empty' ? getDemoData(effectiveDemoType) : {};
  const finalStats = stats.length > 0 ? stats : (demoData.stats || []);
  const finalListItems = listItems.length > 0 ? listItems : (demoData.listItems || []);
  const finalTableColumns = tableColumns.length > 0 ? tableColumns : (demoData.tableColumns || []);
  const finalTableData = tableData.length > 0 ? tableData : (demoData.tableData || []);
  const finalWorkflowSteps = workflowSteps.length > 0 ? workflowSteps : (demoData.workflowSteps || []);
  
  // Generate demo menu items if needed
  const finalMenuItems = menuItems || (showMenuItems ? [
    { label: 'Export Data', onClick: () => console.log('Export clicked') },
    { label: 'Share', onClick: () => console.log('Share clicked') },
    { label: 'Settings', onClick: () => console.log('Settings clicked') },
  ] : undefined);
  
  // Generate demo action if needed
  const finalAction = action || (showAction ? (
    <Button size="small" startIcon={<ArrowForwardIcon />}>
      View All
    </Button>
  ) : undefined);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />;
      case 'down':
        return <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'active':
      case 'info':
        return <InfoIcon color="info" />;
      case 'pending':
        return <ScheduleIcon color="action" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return null;
    }
  };

  const renderStats = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: finalStats.length > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
        },
        gap: 3,
      }}
    >
      {finalStats.map((stat, index) => (
        <Box key={index}>
          <LabelValuePair
            label={stat.label}
            value={stat.value}
            variant="stacked"
            size="large"
            valueColor={stat.color || 'text.primary'}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        </Box>
      ))}
    </Box>
  );

  const renderList = () => (
    <List sx={{ py: 0 }}>
      {finalListItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <ListItem
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {item.avatar && (
              <ListItemAvatar>
                {typeof item.avatar === 'string' ? (
                  <Avatar src={item.avatar} />
                ) : (
                  <Avatar>{item.avatar}</Avatar>
                )}
              </ListItemAvatar>
            )}
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body1">{item.primary}</Typography>
                  {item.status && getStatusIcon(item.status)}
                </Stack>
              }
              secondary={item.secondary}
            />
            {item.action && (
              <ListItemSecondaryAction>
                {item.action}
              </ListItemSecondaryAction>
            )}
          </ListItem>
          {index < finalListItems.length - 1 && <Divider component="li" />}
        </React.Fragment>
      ))}
    </List>
  );

  const renderTable = () => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {finalTableColumns.map((column) => (
              <TableCell key={column}>
                <Typography variant="subtitle2" color="text.secondary">
                  {column}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {finalTableData.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              hover
              sx={{ '&:last-child td': { border: 0 } }}
            >
              {finalTableColumns.map((column) => (
                <TableCell key={column}>
                  {row[column]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderWorkflow = () => (
    <Box sx={{ position: 'relative' }}>
      {finalWorkflowSteps.map((step, index) => (
        <Box
          key={step.id}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            position: 'relative',
            pb: index < finalWorkflowSteps.length - 1 ? 3 : 0,
          }}
        >
          {/* Connector line */}
          {index < finalWorkflowSteps.length - 1 && (
            <Box
              sx={{
                position: 'absolute',
                left: 20,
                top: 40,
                bottom: 0,
                width: 2,
                bgcolor: step.status === 'completed' ? 'success.main' : 'divider',
                zIndex: 0,
              }}
            />
          )}
          
          {/* Step icon */}
          <Box sx={{ mr: 2, zIndex: 1 }}>
            {getStatusIcon(step.status)}
          </Box>
          
          {/* Step content */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: step.status === 'active' ? 600 : 400,
                color: step.status === 'pending' ? 'text.secondary' : 'text.primary',
              }}
            >
              {step.title}
            </Typography>
            {step.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {step.description}
              </Typography>
            )}
            {step.timestamp && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {step.timestamp}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderMixed = () => (
    <Stack spacing={3}>
      {finalStats.length > 0 && renderStats()}
      {finalStats.length > 0 && (finalListItems.length > 0 || finalTableData.length > 0) && <Divider />}
      {finalListItems.length > 0 && renderList()}
      {finalTableData.length > 0 && renderTable()}
      {customContent}
    </Stack>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    const isEmpty = 
      (variant === 'stats' && finalStats.length === 0) ||
      (variant === 'list' && finalListItems.length === 0) ||
      (variant === 'table' && finalTableData.length === 0) ||
      (variant === 'workflow' && finalWorkflowSteps.length === 0) ||
      (variant === 'mixed' && finalStats.length === 0 && finalListItems.length === 0 && finalTableData.length === 0 && !customContent);

    if (isEmpty) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Box>
      );
    }

    switch (variant) {
      case 'stats':
        return renderStats();
      case 'list':
        return renderList();
      case 'table':
        return renderTable();
      case 'workflow':
        return renderWorkflow();
      case 'mixed':
        return renderMixed();
      default:
        return null;
    }
  };

  return (
    <Card elevation={elevation}>
      <CardHeader
        title={title}
        subheader={subtitle}
        action={
          <Stack direction="row" spacing={1}>
            {finalAction}
            {finalMenuItems && finalMenuItems.length > 0 && (
              <>
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {finalMenuItems.map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        item.onClick();
                        handleMenuClose();
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Stack>
        }
        sx={{
          '& .MuiCardHeader-action': {
            alignSelf: 'center',
          },
        }}
      />
      
      {headerDivider && <Divider />}
      
      <CardContent
        sx={{
          p: contentPadding ? 3 : 0,
          maxHeight: maxHeight && maxHeight > 0 ? maxHeight : 'none',
          overflow: maxHeight && maxHeight > 0 ? 'auto' : 'visible',
          '&:last-child': {
            pb: contentPadding ? 3 : 0,
          },
        }}
      >
        {renderContent()}
      </CardContent>
    </Card>
  );
};