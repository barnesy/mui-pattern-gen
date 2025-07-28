import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, Alert } from '@mui/material';
import { useDesignStore } from '../stores/designStore';
import { registerComponent } from '../schemas/registry';

// Very simple test component
const SimpleBox: React.FC<{ text?: string }> = ({ text = 'Hello' }) => (
  <Box sx={{ p: 2, border: 1, borderColor: 'divider' }}>{text}</Box>
);

// Register it
registerComponent('SimpleBox', SimpleBox);

export const DesignSystemTest: React.FC = () => {
  // Use store with specific selectors to avoid re-renders
  const registerSchema = useDesignStore((state) => state.registerSchema);
  const createInstance = useDesignStore((state) => state.createInstance);
  const instances = useDesignStore((state) => Array.from(state.instances.values()));

  // Register schema once on mount
  useEffect(() => {
    registerSchema({
      id: 'SimpleBox',
      name: 'Simple Box',
      type: 'display',
      props: [
        {
          name: 'text',
          type: 'string',
          label: 'Text',
          default: 'Hello World',
        },
      ],
    });
  }, [registerSchema]);

  const handleAdd = () => {
    console.log('Creating instance...');
    try {
      const id = createInstance('SimpleBox', { text: 'Test Text' });
      console.log('Created instance:', id);
    } catch (error) {
      console.error('Error creating instance:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Design System Test
        </Typography>

        <Alert severity="warning" sx={{ mb: 2 }}>
          Minimal test to debug infinite loop issue
        </Alert>

        <Button variant="contained" onClick={handleAdd} sx={{ mb: 3 }}>
          Add Simple Box
        </Button>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Instances ({instances.length})
          </Typography>

          {instances.map((instance) => (
            <Box key={instance.id} sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                ID: {instance.id}
              </Typography>
              <SimpleBox {...instance.props} />
            </Box>
          ))}
        </Paper>
      </Box>
    </Container>
  );
};
