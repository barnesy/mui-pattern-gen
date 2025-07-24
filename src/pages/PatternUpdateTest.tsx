import React from 'react';
import { Box, Typography, Stack, Paper, Grid } from '@mui/material';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { withPatternWrapper } from '../utils/withPatternWrapper';

// Wrap the DataDisplayCard for AI Design Mode detection
const WrappedDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'cards',
});

export const PatternUpdateTest: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pattern Update Test
      </Typography>
      
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="body1">
          This page tests the multi-instance update functionality:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          1. Enable AI Design Mode
        </Typography>
        <Typography variant="body2" color="text.secondary">
          2. Click on any DataDisplayCard below
        </Typography>
        <Typography variant="body2" color="text.secondary">
          3. Change properties in the Pattern Inspector
        </Typography>
        <Typography variant="body2" color="text.secondary">
          4. Toggle "Update all instances" to update individually or all at once
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Instance 1</Typography>
            <WrappedDataDisplayCard
              variant="stats"
              title="Revenue Overview"
              subtitle="Last 30 days"
              demoDataType="revenue"
              showMenuItems
              elevation={1}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Instance 2</Typography>
            <WrappedDataDisplayCard
              variant="list"
              title="Recent Users"
              subtitle="Active in the last hour"
              demoDataType="users"
              showAction
              elevation={1}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Instance 3</Typography>
            <WrappedDataDisplayCard
              variant="table"
              title="Sales Data"
              subtitle="Q4 2023"
              demoDataType="sales"
              elevation={1}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Instance 4</Typography>
            <WrappedDataDisplayCard
              variant="stats"
              title="User Growth"
              subtitle="This month"
              demoDataType="revenue"
              showMenuItems={false}
              elevation={1}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};