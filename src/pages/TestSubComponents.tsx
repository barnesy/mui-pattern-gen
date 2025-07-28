import React from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { withPatternWrapper } from '../utils/withPatternWrapper';

const AIDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'cards',
});

const TestSubComponents: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sub-Component Update Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Enable AI Design Mode, click on a label-value pair, and try changing its variant or color.
        The changes should apply immediately.
      </Alert>

      <AIDataDisplayCard
        title="Test Card"
        subtitle="Click on the label-value pairs below"
        variant="stats"
        labelValuePairs={[
          {
            label: 'Revenue',
            value: '$125,000',
            variant: 'stacked',
            size: 'large',
            valueColor: 'success.main',
          },
          {
            label: 'Growth',
            value: '+23%',
            variant: 'inline',
            trend: 'up',
            trendValue: 'vs last quarter',
          },
          {
            label: 'Orders',
            value: '1,234',
            variant: 'minimal',
          },
        ]}
      />
    </Container>
  );
};

export default TestSubComponents;
