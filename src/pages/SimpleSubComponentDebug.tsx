import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { withPatternWrapper } from '../utils/withPatternWrapper';

const AIDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'cards',
});

const SimpleSubComponentDebug: React.FC = () => {
  // Force a re-render to test
  const [counter, setCounter] = React.useState(0);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Simple Sub-Component Debug
      </Typography>

      <Button variant="contained" onClick={() => setCounter((c) => c + 1)} sx={{ mb: 2 }}>
        Force Re-render (Count: {counter})
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Open console, enable AI Design Mode, click a label-value pair, and try changing
          properties.
        </Typography>
      </Box>

      <AIDataDisplayCard
        title="Debug Card"
        variant="stats"
        labelValuePairs={[
          {
            label: 'Test Value',
            value: '12345',
            variant: 'stacked',
            size: 'large',
          },
        ]}
      />
    </Container>
  );
};

export default SimpleSubComponentDebug;
