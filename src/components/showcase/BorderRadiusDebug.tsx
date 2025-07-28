import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Alert,
  Avatar,
  Fab,
  useTheme,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export const BorderRadiusDebug: React.FC = () => {
  const theme = useTheme();

  // Helper to get computed style
  const getComputedBorderRadius = (element: HTMLElement | null) => {
    if (!element) {return 'N/A';}
    const computed = window.getComputedStyle(element);
    return computed.borderRadius || 'not set';
  };

  const components = [
    {
      name: 'Button',
      element: (
        <Button variant="contained" id="test-button">
          Button
        </Button>
      ),
    },
    {
      name: 'Paper',
      element: (
        <Paper id="test-paper" sx={{ p: 2 }}>
          Paper
        </Paper>
      ),
    },
    {
      name: 'Card',
      element: (
        <Card id="test-card">
          <CardContent>Card</CardContent>
        </Card>
      ),
    },
    {
      name: 'TextField',
      element: <TextField id="test-textfield" label="TextField" variant="outlined" />,
    },
    { name: 'Chip', element: <Chip id="test-chip" label="Chip" /> },
    {
      name: 'Alert',
      element: (
        <Alert id="test-alert" severity="info">
          Alert
        </Alert>
      ),
    },
    { name: 'Avatar', element: <Avatar id="test-avatar">A</Avatar> },
    {
      name: 'FAB',
      element: (
        <Fab id="test-fab" size="small">
          <AddIcon />
        </Fab>
      ),
    },
  ];

  const [computedStyles, setComputedStyles] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    // Wait for render then check computed styles
    setTimeout(() => {
      const styles: Record<string, string> = {};
      components.forEach((comp) => {
        const id = `test-${comp.name.toLowerCase()}`;
        const element = document.getElementById(id);
        if (element) {
          // For TextField, we need to check the input element
          if (comp.name === 'TextField') {
            const input = element.querySelector('.MuiOutlinedInput-root');
            styles[comp.name] = getComputedBorderRadius(input as HTMLElement);
          } else {
            styles[comp.name] = getComputedBorderRadius(element);
          }
        }
      });
      setComputedStyles(styles);
    }, 100);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Border Radius Debug
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Theme borderRadius:</strong> {theme.shape.borderRadius}px
        </Typography>
      </Alert>

      <Typography variant="h6" gutterBottom>
        Live Component Border Radius Values
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
          mb: 4,
        }}
      >
        {components.map((comp) => (
          <Box key={comp.name} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                mb: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 60,
              }}
            >
              {comp.element}
            </Box>
            <Typography variant="caption" display="block">
              {comp.name}
            </Typography>
            <Typography variant="caption" display="block" color="primary">
              {computedStyles[comp.name] || 'Loading...'}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Component Configuration
      </Typography>

      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell>
              <strong>Component</strong>
            </TableCell>
            <TableCell>
              <strong>Expected</strong>
            </TableCell>
            <TableCell>
              <strong>Actual</strong>
            </TableCell>
            <TableCell>
              <strong>Status</strong>
            </TableCell>
          </TableRow>
          {components.map((comp) => {
            const expected =
              comp.name === 'Avatar' || comp.name === 'FAB'
                ? '50%'
                : `${theme.shape.borderRadius}px`;
            const actual = computedStyles[comp.name] || 'Loading...';
            const isCorrect =
              actual === expected || (expected === '4px' && actual.startsWith('4px'));

            return (
              <TableRow key={comp.name}>
                <TableCell>{comp.name}</TableCell>
                <TableCell>{expected}</TableCell>
                <TableCell>{actual}</TableCell>
                <TableCell>
                  <Typography variant="caption" color={isCorrect ? 'success.main' : 'error.main'}>
                    {isCorrect ? '✓' : '✗'}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};
