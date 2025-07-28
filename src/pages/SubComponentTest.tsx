import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { PageHeader } from '../patterns/pending/PageHeader';
import { withPatternWrapper } from '../utils/withPatternWrapper';

// Wrap patterns to make them selectable
const SelectableDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'cards',
});

const SelectablePageHeader = withPatternWrapper(PageHeader, {
  patternName: 'PageHeader',
  status: 'pending',
  category: 'navigation',
});

const SubComponentTest: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SelectablePageHeader
        title="Sub-Component Selection Test"
        subtitle="Test selecting and editing individual sub-components"
        showBreadcrumbs={false}
        variant="minimal"
        padding={{ top: 0, right: 0, bottom: 24, left: 0 }}
      />

      <Typography variant="body1" sx={{ mb: 3 }}>
        Enable AI Design Mode and click on individual LabelValuePair components within the cards
        below. You should be able to select and edit each one individually.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        <SelectableDataDisplayCard
          title="Sales Metrics"
          subtitle="Current quarter performance"
          variant="stats"
          showHeader={true}
          showFooter={false}
          elevation={2}
          data={[
            { label: 'Revenue', value: '$125,000', variant: 'metric', valueColor: 'success.main' },
            {
              label: 'Growth',
              value: '+23%',
              variant: 'metric',
              trend: 'up',
              trendValue: 'vs last quarter',
            },
            { label: 'Orders', value: '1,234', variant: 'metric' },
            { label: 'Conversion', value: '3.4%', variant: 'metric', valueColor: 'info.main' },
          ]}
        />

        <SelectableDataDisplayCard
          title="User Activity"
          subtitle="Last 7 days"
          variant="stats"
          showHeader={true}
          showFooter={true}
          footerAction="View Details"
          elevation={2}
          data={[
            { label: 'Active Users', value: '8,421', variant: 'inline' },
            { label: 'New Signups', value: '156', variant: 'inline', chip: true },
            { label: 'Avg Session', value: '12m 34s', variant: 'inline' },
            { label: 'Bounce Rate', value: '42%', variant: 'inline', valueColor: 'warning.main' },
          ]}
        />

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Instructions:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
            <li>Enable AI Design Mode using the toggle in the app bar</li>
            <li>Click on any "label: value" pair in the cards</li>
            <li>The settings panel should show LabelValuePair controls</li>
            <li>Try changing the variant, colors, or other properties</li>
            <li>Changes should apply immediately to the selected sub-component</li>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default SubComponentTest;
