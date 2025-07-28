import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Alert,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { Refresh, Code, DataObject } from '@mui/icons-material';
import { ConfigurableComponent } from '../components/schema/ConfigurableComponent';
import { SchemaDataDisplay } from '../components/schema/SchemaDataDisplay';
import { ComponentSchema, DataSourceSchema } from '../schemas/types';
import { registerComponent, commonDataShapes } from '../schemas/registry';
import { invalidateAllCache } from '../stores/dataStore';

// Register the SchemaDataDisplay component
registerComponent('SchemaDataDisplay', SchemaDataDisplay);

/**
 * Demo page showing schema-based component system
 */
export const SchemaDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [customEndpoint, setCustomEndpoint] = useState('/api/demo/stats');

  // Example schemas
  const demoSchemas: Array<{
    title: string;
    component: ComponentSchema;
    dataSource: DataSourceSchema;
  }> = [
    {
      title: 'Stats Dashboard',
      component: {
        id: 'stats-display',
        name: 'SchemaDataDisplay',
        type: 'display',
        props: [],
        defaultProps: {
          title: 'Performance Metrics',
          subtitle: 'Last 30 days',
          variant: 'stats',
        },
      },
      dataSource: {
        id: 'stats-data',
        type: 'static',
        responseShape: commonDataShapes.stats,
        endpoint: '', // Will use mock data
      },
    },
    {
      title: 'User List',
      component: {
        id: 'user-list',
        name: 'SchemaDataDisplay',
        type: 'display',
        props: [],
        defaultProps: {
          title: 'Active Users',
          variant: 'list',
        },
      },
      dataSource: {
        id: 'user-data',
        type: 'static',
        responseShape: commonDataShapes.listItems,
        endpoint: '',
      },
    },
    {
      title: 'Data Table',
      component: {
        id: 'data-table',
        name: 'SchemaDataDisplay',
        type: 'display',
        props: [],
        defaultProps: {
          title: 'Sales Report',
          variant: 'table',
        },
      },
      dataSource: {
        id: 'table-data',
        type: 'static',
        responseShape: commonDataShapes.tableData,
        endpoint: '',
      },
    },
  ];

  // Mock data for demos
  const getMockData = (type: string) => {
    switch (type) {
      case 'stats-data':
        return [
          { label: 'Revenue', value: 125430, trend: 'up', trendValue: '+12.5%', unit: '$' },
          { label: 'Users', value: 8234, trend: 'up', trendValue: '+5.3%' },
          { label: 'Orders', value: 1456, trend: 'down', trendValue: '-2.1%' },
          { label: 'Conversion', value: 3.45, trend: 'flat', unit: '%' },
        ];

      case 'user-data':
        return [
          {
            id: '1',
            title: 'John Doe',
            subtitle: 'john@example.com',
            avatar: 'https://i.pravatar.cc/150?img=1',
            status: 'active',
          },
          {
            id: '2',
            title: 'Jane Smith',
            subtitle: 'jane@example.com',
            avatar: 'https://i.pravatar.cc/150?img=2',
            status: 'active',
          },
          {
            id: '3',
            title: 'Bob Johnson',
            subtitle: 'bob@example.com',
            avatar: 'https://i.pravatar.cc/150?img=3',
            status: 'pending',
          },
        ];

      case 'table-data':
        return {
          columns: [
            { key: 'product', label: 'Product' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'price', label: 'Price' },
            { key: 'total', label: 'Total' },
          ],
          rows: [
            { product: 'Widget A', quantity: 10, price: '$9.99', total: '$99.90' },
            { product: 'Widget B', quantity: 5, price: '$19.99', total: '$99.95' },
            { product: 'Widget C', quantity: 20, price: '$4.99', total: '$99.80' },
          ],
        };

      default:
        return null;
    }
  };

  // Custom API example
  const customApiSchema: ComponentSchema = {
    id: 'custom-api',
    name: 'SchemaDataDisplay',
    type: 'display',
    props: [],
    defaultProps: {
      title: 'Custom API Data',
      variant: 'auto', // Will auto-detect
    },
  };

  const customDataSource: DataSourceSchema = {
    id: 'custom-source',
    type: 'rest',
    endpoint: customEndpoint,
    cache: {
      enabled: true,
      ttl: 60000, // 1 minute
    },
  };

  const handleRefresh = () => {
    invalidateAllCache();
    window.location.reload();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Schema-Based Component System
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This demo shows how components can automatically fetch and display data based on schemas.
        The same component adapts its display based on the data shape.
      </Alert>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Static Data Examples" />
        <Tab label="API Integration" />
        <Tab label="Schema Inspector" />
      </Tabs>

      {/* Static Data Examples */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {demoSchemas.map((demo, index) => (
            <Grid item xs={12} key={index}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {demo.title}
                </Typography>

                {/* Override data source to use mock data */}
                <ConfigurableComponent
                  schema={demo.component}
                  dataSource={{
                    ...demo.dataSource,
                    type: 'static',
                    endpoint: JSON.stringify(getMockData(demo.dataSource.id)),
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* API Integration */}
      {activeTab === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Live API Example
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="API Endpoint"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                fullWidth
                helperText="Enter a JSON API endpoint"
              />

              <Alert severity="warning">
                Note: In a real application, this would fetch from your API. For demo purposes, any
                endpoint will show example data.
              </Alert>

              <ConfigurableComponent
                schema={customApiSchema}
                dataSource={{
                  ...customDataSource,
                  // For demo, use static data
                  type: 'static',
                  endpoint: JSON.stringify([
                    { label: 'API Calls', value: 1234 },
                    { label: 'Response Time', value: '45ms' },
                    { label: 'Success Rate', value: '99.9%' },
                  ]),
                }}
                onDataLoad={(data) => console.log('Data loaded:', data)}
                onDataError={(error) => console.error('Data error:', error)}
              />

              <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
                Refresh Cache
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Schema Inspector */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Component Schema
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                }}
              >
                {JSON.stringify(demoSchemas[0].component, null, 2)}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Data Source Schema
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                }}
              >
                {JSON.stringify(customDataSource, null, 2)}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Common Data Shapes
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  maxHeight: 400,
                }}
              >
                {JSON.stringify(commonDataShapes, null, 2)}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};
