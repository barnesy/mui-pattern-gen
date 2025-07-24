import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { PageHeader } from '../patterns/pending/PageHeader';
import { LabelValuePair } from '../patterns/pending/LabelValuePair';
import { withPatternWrapper } from '../utils/withPatternWrapper';

// Wrap patterns for AI Design Mode detection
const WrappedDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'cards',
});

const WrappedPageHeader = withPatternWrapper(PageHeader, {
  patternName: 'PageHeader',
  status: 'pending',
  category: 'navigation',
});

const WrappedLabelValuePair = withPatternWrapper(LabelValuePair, {
  patternName: 'LabelValuePair',
  status: 'pending',
  category: 'cards',
});

export const PatternAIDemo: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pattern AI Design Mode Demo
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>How to use:</strong>
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            1. Enable AI Design Mode using the toggle in the app bar
          </Typography>
          <Typography variant="body2">
            2. Hover over patterns to see their status (orange = pending, blue = accepted)
          </Typography>
          <Typography variant="body2">
            3. Click on any pattern to open the settings drawer
          </Typography>
          <Typography variant="body2">
            4. Adjust settings and see real-time updates
          </Typography>
          <Typography variant="body2">
            5. Drag the drawer edge to resize it
          </Typography>
          <Typography variant="body2">
            6. Click "Copy Configuration" to get the current settings
          </Typography>
        </Stack>
      </Alert>

      <Stack spacing={4}>
        {/* Page Header Pattern */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Typography variant="h6">Page Header Pattern</Typography>
            <Chip label="pending" size="small" color="warning" />
          </Stack>
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
            <WrappedPageHeader
              title="Dashboard Overview"
              subtitle="Monitor your application performance and metrics"
              showBackButton
              showActions
            />
          </Paper>
        </Box>

        {/* Data Display Cards */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Typography variant="h6">Data Display Card Patterns</Typography>
            <Chip label="pending" size="small" color="warning" />
          </Stack>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <WrappedDataDisplayCard
                variant="stats"
                title="Revenue Overview"
                subtitle="Last 30 days"
                demoDataType="revenue"
                showMenuItems
                elevation={1}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <WrappedDataDisplayCard
                variant="list"
                title="Recent Users"
                subtitle="Active in the last hour"
                demoDataType="users"
                showAction
                elevation={1}
              />
            </Grid>
            <Grid item xs={12}>
              <WrappedDataDisplayCard
                variant="table"
                title="Sales Data"
                subtitle="Q4 2023"
                demoDataType="sales"
                elevation={1}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Label Value Pairs */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Typography variant="h6">Label Value Pair Patterns</Typography>
            <Chip label="pending" size="small" color="warning" />
          </Stack>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <WrappedLabelValuePair
                  label="Total Revenue"
                  value="$124,500"
                  variant="stacked"
                  size="large"
                  valueColor="primary"
                  trend="up"
                  trendValue="+12.5%"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <WrappedLabelValuePair
                  label="Active Users"
                  value="8,234"
                  variant="stacked"
                  size="large"
                  valueColor="success"
                  trend="up"
                  trendValue="+5.2%"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <WrappedLabelValuePair
                  label="Conversion Rate"
                  value="3.42%"
                  variant="stacked"
                  size="large"
                  valueColor="warning"
                  trend="down"
                  trendValue="-0.8%"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <WrappedLabelValuePair
                  label="Avg. Session"
                  value="4m 32s"
                  variant="stacked"
                  size="large"
                  trend="flat"
                />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};