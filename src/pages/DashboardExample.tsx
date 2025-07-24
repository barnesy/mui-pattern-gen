import React from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  useTheme,
  useMediaQuery,
  Stack,
  Hidden,
  Typography,
  Divider
} from '@mui/material';
import { withPatternWrapper } from '../utils/withPatternWrapper';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { PageHeader } from '../patterns/pending/PageHeader';
import { EmptyStateCard } from '../patterns/pending/EmptyStateCard';

// Wrap patterns with AI Design Mode capability
const AIPageHeader = withPatternWrapper(PageHeader, {
  patternName: 'PageHeader',
  status: 'pending',
  category: 'navigation'
});

const AIDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'cards'
});

const AIEmptyStateCard = withPatternWrapper(EmptyStateCard, {
  patternName: 'EmptyStateCard',
  status: 'pending',
  category: 'cards'
});

export const DashboardExample: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      pb: { xs: 2, sm: 3, md: 4 }
    }}>
      {/* Page Header - Full Width */}
      <AIPageHeader
          title={isMobile ? "Dashboard" : "Analytics Dashboard"}
          subtitle={isMobile ? "Performance & engagement" : "Monitor your application performance and user engagement"}
          showBreadcrumbs={!isMobile}
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Dashboard', path: '/dashboard-example' }
          ]}
          showMetadata={!isMobile}
          metadata={{
            lastUpdated: new Date().toISOString(),
            author: 'System',
            version: '1.0.0'
          }}
          padding={{ 
            top: isMobile ? 16 : 24, 
            right: isMobile ? 16 : 32, 
            bottom: isMobile ? 16 : 24, 
            left: isMobile ? 16 : 32 
          }}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        />
        
      {/* Main Content Container */}
      <Container 
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          [theme.breakpoints.down('sm')]: {
            px: 1
          }
        }}
      >
        
        {/* Key Metrics Section */}
        <Box component="section" sx={{ mb: { xs: 3, md: 4 } }}>
          <Hidden smDown>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
              Key Metrics
            </Typography>
          </Hidden>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <AIDataDisplayCard
              variant="stats"
              title="Total Users"
              stats={[
                { label: 'Active Users', value: '12,345', trend: 'up', change: '+12%' }
              ]}
              showHeader={true}
              headerTitle="User Metrics"
              elevation={0}
              padding={{ 
                top: isMobile ? 12 : 16, 
                right: isMobile ? 12 : 16, 
                bottom: isMobile ? 12 : 16, 
                left: isMobile ? 12 : 16 
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <AIDataDisplayCard
              variant="stats"
              title="Revenue"
              stats={[
                { label: 'Monthly Revenue', value: '$54,321', trend: 'up', change: '+8.5%' }
              ]}
              showHeader={true}
              headerTitle="Financial"
              elevation={0}
              padding={{ 
                top: isMobile ? 12 : 16, 
                right: isMobile ? 12 : 16, 
                bottom: isMobile ? 12 : 16, 
                left: isMobile ? 12 : 16 
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <AIDataDisplayCard
              variant="stats"
              title="Conversion Rate"
              stats={[
                { label: 'Conversion', value: '3.45%', trend: 'down', change: '-0.5%' }
              ]}
              showHeader={true}
              headerTitle="Performance"
              elevation={0}
              padding={{ 
                top: isMobile ? 12 : 16, 
                right: isMobile ? 12 : 16, 
                bottom: isMobile ? 12 : 16, 
                left: isMobile ? 12 : 16 
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <AIDataDisplayCard
              variant="stats"
              title="Support Tickets"
              stats={[
                { label: 'Open Tickets', value: '89', trend: 'up', change: '+23' }
              ]}
              showHeader={true}
              headerTitle="Support"
              elevation={0}
              padding={{ 
                top: isMobile ? 12 : 16, 
                right: isMobile ? 12 : 16, 
                bottom: isMobile ? 12 : 16, 
                left: isMobile ? 12 : 16 
              }}
            />
          </Grid>
          </Grid>
        </Box>
        
        {/* Activity and Workflow Section */}
        <Box component="section" sx={{ mb: { xs: 3, md: 4 } }}>
          <Hidden smDown>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
              Activity & Workflow
            </Typography>
          </Hidden>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {/* Recent Activity */}
            <Grid item xs={12} lg={8}>
            <AIDataDisplayCard
              variant="list"
              title="Recent Activity"
              listItems={[
                {
                  id: '1',
                  primary: 'New user registration',
                  secondary: isMobile ? 'john.doe@example.com' : 'john.doe@example.com joined 5 minutes ago',
                  timestamp: '5m ago'
                },
                {
                  id: '2',
                  primary: 'Order completed',
                  secondary: isMobile ? 'Order #12345' : 'Order #12345 was successfully processed',
                  timestamp: '12m ago'
                },
                {
                  id: '3',
                  primary: 'Payment received',
                  secondary: isMobile ? '$299.99' : '$299.99 payment from Jane Smith',
                  timestamp: '1h ago'
                },
                {
                  id: '4',
                  primary: 'Support ticket resolved',
                  secondary: isMobile ? 'Ticket #789' : 'Ticket #789 was closed by support team',
                  timestamp: '2h ago'
                }
              ]}
              showHeader={true}
              headerTitle="Activity Feed"
              elevation={0}
              padding={{ 
                top: isMobile ? 16 : 20, 
                right: isMobile ? 16 : 20, 
                bottom: isMobile ? 16 : 20, 
                left: isMobile ? 16 : 20 
              }}
            />
            </Grid>
            
            {/* Workflow Status */}
            <Grid item xs={12} lg={4}>
            <AIDataDisplayCard
              variant="workflow"
              title="Order Processing"
              steps={[
                { label: 'Pending', status: 'completed', description: '45 orders' },
                { label: 'Processing', status: 'active', description: '12 orders' },
                { label: 'Shipped', status: 'pending', description: '0 orders' },
                { label: 'Delivered', status: 'pending', description: '0 orders' }
              ]}
              showHeader={true}
              headerTitle="Workflow Status"
              elevation={0}
              padding={{ 
                top: isMobile ? 16 : 20, 
                right: isMobile ? 16 : 20, 
                bottom: isMobile ? 16 : 20, 
                left: isMobile ? 16 : 20 
              }}
            />
            </Grid>
          </Grid>
        </Box>
        
        {/* Data Table Section */}
        <Box component="section" sx={{ mb: { xs: 3, md: 4 } }}>
          <Hidden smDown>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
              Product Performance
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </Hidden>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <AIDataDisplayCard
              variant="table"
              title="Top Products"
              tableData={{
                columns: [
                  { field: 'id', headerName: 'ID', width: isMobile ? 50 : 70 },
                  { field: 'product', headerName: 'Product Name', width: isMobile ? 150 : 300, flex: isDesktop ? 1 : undefined },
                  { field: 'category', headerName: 'Category', width: isMobile ? 100 : 150, hide: isMobile },
                  { field: 'sales', headerName: 'Sales', width: 100 },
                  { field: 'revenue', headerName: 'Revenue', width: isMobile ? 100 : 120 },
                  { field: 'stock', headerName: 'In Stock', width: 100, hide: isMobile }
                ],
                rows: [
                  { id: 1, product: 'Premium Widget Pro', category: 'Electronics', sales: 1234, revenue: '$12,340', stock: 89 },
                  { id: 2, product: 'Smart Home Hub', category: 'IoT', sales: 892, revenue: '$44,600', stock: 45 },
                  { id: 3, product: 'Wireless Charger X', category: 'Accessories', sales: 756, revenue: '$18,900', stock: 234 },
                  { id: 4, product: 'Security Camera HD', category: 'Security', sales: 623, revenue: '$62,300', stock: 12 },
                  { id: 5, product: 'Bluetooth Speaker Max', category: 'Audio', sales: 521, revenue: '$26,050', stock: 167 }
                ]
              }}
              showHeader={true}
              headerTitle="Product Performance"
              elevation={0}
              padding={{ 
                top: isMobile ? 16 : 20, 
                right: isMobile ? 16 : 20, 
                bottom: isMobile ? 16 : 20, 
                left: isMobile ? 16 : 20 
              }}
            />
          </Grid>
          </Grid>
        </Box>
        
        {/* Status Examples Section */}
        <Box component="section" sx={{ mb: { xs: 3, md: 4 } }}>
          <Hidden smDown>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
              System Status
            </Typography>
          </Hidden>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          <Grid item xs={12} sm={6} lg={6}>
            <AIEmptyStateCard
              variant="no-data"
              title="No Reports Available"
              description="Generate your first report to see analytics here"
              showIcon={true}
              showAction={true}
              actionLabel="Generate Report"
              elevation={0}
              padding={{ 
                top: isMobile ? 24 : 32, 
                right: isMobile ? 16 : 24, 
                bottom: isMobile ? 24 : 32, 
                left: isMobile ? 16 : 24 
              }}
            />
          </Grid>
          
          {/* Error State Example */}
          <Grid item xs={12} sm={6} lg={6}>
            <AIEmptyStateCard
              variant="error"
              title="Failed to Load Data"
              description="There was an error loading the chart data. Please try again."
              showIcon={true}
              showAction={true}
              actionLabel="Retry"
              elevation={0}
              padding={{ 
                top: isMobile ? 24 : 32, 
                right: isMobile ? 16 : 24, 
                bottom: isMobile ? 24 : 32, 
                left: isMobile ? 16 : 24 
              }}
            />
          </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};