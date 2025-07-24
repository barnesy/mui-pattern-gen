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
  CircularProgress,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { LabelValuePair } from './LabelValuePair';
import { getDemoData } from './DataDisplayCard.config';
import { SpacingConfig, getSpacingValue } from '../../types/PatternVariant';
import { getDemoDataForVariant } from '../../utils/variantDemoData';

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
  
  // Component toggles
  showHeader?: boolean;
  showDivider?: boolean;
  showSubheader?: boolean;
  
  // Demo data
  demoDataType?: string;
  showMenuItems?: boolean;
  showAction?: boolean;
  
  // Size props
  width?: { mode: 'auto' | '100%' | 'custom'; customValue?: number; unit?: 'px' | '%' };
  height?: { mode: 'auto' | '100%' | 'custom'; customValue?: number; unit?: 'px' | '%' };
  
  // Spacing props
  padding?: SpacingConfig;
  margin?: SpacingConfig;
  
  // Typography
  titleVariant?: string;
  subtitleVariant?: string;
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
  showHeader = true,
  showDivider = true,
  showSubheader = true,
  demoDataType,
  showMenuItems = true,
  showAction = false,
  width,
  height,
  padding,
  margin,
  titleVariant = 'h6',
  subtitleVariant = 'body2',
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Determine effective demo data type based on variant if not explicitly set
  const effectiveDemoType = demoDataType || getDemoDataForVariant('DataDisplayCard', variant) || (
    variant === 'stats' ? 'revenue' : 
    variant === 'list' ? 'users' : 
    variant === 'table' ? 'sales' : 
    variant === 'workflow' ? 'workflow' : 
    variant === 'mixed' ? 'dashboard' : 
    'empty'
  );
  
  // Get default padding
  const defaultPadding = { top: 16, right: 16, bottom: 16, left: 16 };
  const effectivePadding = padding || defaultPadding;
  
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
            valueColor={('color' in stat && stat.color ? stat.color as any : 'text.primary') as any}
            trend={stat.trend === 'neutral' ? 'flat' : stat.trend as any}
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
            {'avatar' in item && item.avatar && (
              <ListItemAvatar>
                {typeof item.avatar === 'string' ? (
                  <Avatar src={item.avatar as string} />
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
            {'action' in item && item.action && (
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
                  {(row as any)[column]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderWorkflow = () => (
    <Timeline 
      position="right"
      sx={{
        padding: 0,
        margin: 0,
        [`& .MuiTimelineItem-root:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {finalWorkflowSteps.map((step, index) => (
        <TimelineItem key={step.id}>
          {/* Timeline dot with status icon */}
          <TimelineSeparator>
            <TimelineDot
              color={
                step.status === 'completed' ? 'success' :
                step.status === 'active' ? 'primary' :
                step.status === 'error' ? 'error' :
                'grey'
              }
              variant={step.status === 'active' ? 'filled' : 'outlined'}
              sx={{
                boxShadow: step.status === 'active' ? 2 : 0,
              }}
            >
              {step.status === 'completed' && <CheckCircleIcon sx={{ fontSize: 16 }} />}
              {step.status === 'active' && <InfoIcon sx={{ fontSize: 16 }} />}
              {step.status === 'pending' && <ScheduleIcon sx={{ fontSize: 16 }} />}
              {step.status === 'error' && <ErrorIcon sx={{ fontSize: 16 }} />}
            </TimelineDot>
            {index < finalWorkflowSteps.length - 1 && (
              <TimelineConnector 
                sx={{
                  bgcolor: step.status === 'completed' ? 'success.main' : 'grey.300',
                }}
              />
            )}
          </TimelineSeparator>
          
          {/* Timeline content */}
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography
              variant="subtitle1"
              component="span"
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
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {step.timestamp}
              </Typography>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
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
          <ErrorIcon color="error" fontSize="large" sx={{ mb: 2 }} />
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

  // Calculate size styles
  const getSizeValue = (size?: { mode: string; customValue?: number; unit?: string }) => {
    if (!size) return 'auto';
    if (size.mode === 'auto') return 'auto';
    if (size.mode === '100%') return '100%';
    if (size.mode === 'custom' && size.customValue) {
      return `${size.customValue}${size.unit || 'px'}`;
    }
    return 'auto';
  };

  return (
    <Card 
      elevation={1}
      sx={{
        width: getSizeValue(width),
        height: getSizeValue(height),
        display: 'flex',
        flexDirection: 'column',
        margin: margin ? getSpacingValue(margin) : undefined,
      }}
    >
      {showHeader && (
        <CardHeader
          title={title}
          titleTypographyProps={{ variant: titleVariant as any }}
          subheader={showSubheader ? subtitle : undefined}
          subheaderTypographyProps={{ variant: subtitleVariant as any }}
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
      )}
      
      {showHeader && showDivider && <Divider />}
      
      <CardContent
        sx={{
          p: getSpacingValue(effectivePadding),
          flex: height ? 1 : 'none',
          overflow: 'auto',
          '&:last-child': {
            pb: effectivePadding.bottom + 'px',
          },
        }}
      >
        {renderContent()}
      </CardContent>
    </Card>
  );
};