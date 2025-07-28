import React from 'react';
import { Box, Container, Typography, Alert, Paper } from '@mui/material';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { withPatternWrapper } from '../utils/withPatternWrapper';

const AIDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'cards',
});

const SubComponentUpdateTest: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sub-Component Update Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Instructions:
        <ol style={{ marginTop: 8, marginBottom: 0 }}>
          <li>Enable AI Design Mode (toggle in app bar)</li>
          <li>Click on any label-value pair below</li>
          <li>Change properties in the settings panel (variant, size, color)</li>
          <li>Changes should apply immediately to the selected sub-component</li>
        </ol>
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        }}
      >
        <AIDataDisplayCard
          title="Performance Metrics"
          subtitle="Real-time updates"
          variant="stats"
          labelValuePairs={[
            {
              label: 'Total Revenue',
              value: '$1,234,567',
              variant: 'stacked',
              size: 'large',
              valueColor: 'success.main',
              trend: 'up',
              trendValue: '+12.5%',
            },
            {
              label: 'Active Users',
              value: '45,678',
              variant: 'inline',
              size: 'medium',
              chip: true,
            },
            {
              label: 'Conversion Rate',
              value: '3.45%',
              variant: 'minimal',
              valueColor: 'info.main',
            },
          ]}
        />

        <AIDataDisplayCard
          title="System Status"
          subtitle="All services operational"
          variant="stats"
          stats={[
            {
              label: 'Uptime',
              value: '99.9%',
              color: 'success',
              trend: 'up',
              trendValue: 'Last 30 days',
            },
            {
              label: 'Response Time',
              value: '145ms',
              color: 'primary',
              trend: 'down',
              trendValue: '-20ms',
            },
          ]}
        />
      </Box>

      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test Checklist:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>✓ Sub-components are selectable (purple outline)</li>
          <li>✓ Settings panel shows correct controls</li>
          <li>✓ Variant changes update immediately</li>
          <li>✓ Size changes apply correctly</li>
          <li>✓ Color changes reflect in UI</li>
          <li>✓ Multiple instances can be edited independently</li>
        </Box>
      </Paper>
    </Container>
  );
};

export default SubComponentUpdateTest;
