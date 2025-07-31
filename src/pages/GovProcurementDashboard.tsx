import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { PageHeader } from '../patterns/pending/PageHeader';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { LabelValuePair } from '../patterns/pending/LabelValuePair';

const GovProcurementDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mock data for government procurement
  const procurementStats = {
    activeContracts: 156,
    pendingBids: 23,
    totalValue: '$45.2M',
    compliance: '98.5%',
  };

  const recentActivities = [
    {
      id: 1,
      title: 'New RFP: IT Infrastructure Upgrade',
      agency: 'Department of Technology',
      value: '$2.5M',
      deadline: '2024-02-15',
      status: 'open',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Contract Award: Facilities Maintenance',
      agency: 'General Services Administration',
      value: '$850K',
      deadline: '2024-02-10',
      status: 'awarded',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Bid Submission: Security Services',
      agency: 'Department of Defense',
      value: '$3.2M',
      deadline: '2024-02-20',
      status: 'pending',
      priority: 'high',
    },
    {
      id: 4,
      title: 'Compliance Review Required',
      agency: 'Health & Human Services',
      value: '$1.1M',
      deadline: '2024-02-08',
      status: 'review',
      priority: 'urgent',
    },
  ];

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'open':
        return 'success';
      case 'awarded':
        return 'info';
      case 'pending':
        return 'warning';
      case 'review':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority: string): React.ReactNode => {
    switch (priority) {
      case 'urgent':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'high':
        return <WarningIcon color="warning" fontSize="small" />;
      default:
        return <CheckCircleIcon color="success" fontSize="small" />;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 2 }}>
      {/* Header */}
      <PageHeader
        title="Procurement Dashboard"
        subtitle="Federal Contract Management System"
        showBreadcrumbs={false}
        variant="minimal"
        padding={{ top: 16, right: 16, bottom: 16, left: 16 }}
        margin={{ top: 0, right: 0, bottom: 16, left: 0 }}
        backgroundColor={theme.palette.primary.main}
        textColor="primary.contrastText"
      />

      <Container maxWidth="lg" sx={{ px: isMobile ? 2 : 3 }}>
        {/* Key Metrics - Mobile Optimized Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <DataDisplayCard
              title="Active Contracts"
              subtitle=""
              variant="compact"
              showHeader={true}
              showFooter={false}
              elevation={1}
              data={[
                {
                  label: '',
                  value: procurementStats.activeContracts.toString(),
                  variant: 'metric',
                  size: 'large',
                  trend: 'up',
                  trendValue: '+12%',
                },
              ]}
              padding={{ top: 12, right: 12, bottom: 12, left: 12 }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <DataDisplayCard
              title="Pending Bids"
              subtitle=""
              variant="compact"
              showHeader={true}
              showFooter={false}
              elevation={1}
              data={[
                {
                  label: '',
                  value: procurementStats.pendingBids.toString(),
                  variant: 'metric',
                  size: 'large',
                  valueColor: 'warning.main',
                },
              ]}
              padding={{ top: 12, right: 12, bottom: 12, left: 12 }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <DataDisplayCard
              title="Total Value"
              subtitle=""
              variant="compact"
              showHeader={true}
              showFooter={false}
              elevation={1}
              data={[
                {
                  label: '',
                  value: procurementStats.totalValue,
                  variant: 'metric',
                  size: 'large',
                  valueColor: 'success.main',
                },
              ]}
              padding={{ top: 12, right: 12, bottom: 12, left: 12 }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <DataDisplayCard
              title="Compliance Rate"
              subtitle=""
              variant="compact"
              showHeader={true}
              showFooter={false}
              elevation={1}
              data={[
                {
                  label: '',
                  value: procurementStats.compliance,
                  variant: 'metric',
                  size: 'large',
                  valueColor: 'primary.main',
                },
              ]}
              padding={{ top: 12, right: 12, bottom: 12, left: 12 }}
            />
          </Grid>
        </Grid>

        {/* Recent Activities - Mobile Optimized List */}
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activities
              </Typography>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </Stack>
          </Box>
          <List sx={{ p: 0 }}>
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  sx={{
                    px: 2,
                    py: isMobile ? 2 : 1.5,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getStatusColor(activity.status)}.light` }}>
                      {getPriorityIcon(activity.priority)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack spacing={0.5}>
                        <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ fontWeight: 500 }}>
                          {activity.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {activity.agency}
                          </Typography>
                          <Chip
                            label={activity.status}
                            size="small"
                            color={getStatusColor(activity.status)}
                            sx={{ height: 20 }}
                          />
                        </Stack>
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                        <LabelValuePair
                          label="Value"
                          value={activity.value}
                          variant="inline"
                          labelVariant="caption"
                          valueVariant="caption"
                          spacing={0.5}
                        />
                        <LabelValuePair
                          label="Due"
                          value={new Date(activity.deadline).toLocaleDateString()}
                          variant="inline"
                          labelVariant="caption"
                          valueVariant="caption"
                          spacing={0.5}
                        />
                      </Stack>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  {!isMobile && (
                    <ListItemSecondaryAction>
                      <IconButton edge="end" size="small">
                        <ArrowForwardIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                {index < recentActivities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Button
              fullWidth
              variant="text"
              endIcon={<ArrowForwardIcon />}
              sx={{ justifyContent: 'center' }}
            >
              View All Activities
            </Button>
          </Box>
        </Paper>

        {/* Quick Actions - Mobile Optimized Cards */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.light',
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <AssignmentIcon color="primary" />
                </Avatar>
                <Typography variant="subtitle1" gutterBottom>
                  New RFP
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create request for proposal
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'success.light',
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <MoneyIcon color="success" />
                </Avatar>
                <Typography variant="subtitle1" gutterBottom>
                  Submit Bid
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Respond to opportunities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'warning.light',
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <ScheduleIcon color="warning" />
                </Avatar>
                <Typography variant="subtitle1" gutterBottom>
                  Deadlines
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View upcoming due dates
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'info.light',
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <DashboardIcon color="info" />
                </Avatar>
                <Typography variant="subtitle1" gutterBottom>
                  Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analytics & compliance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GovProcurementDashboard;
