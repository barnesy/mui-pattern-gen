import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Alert,
  Chip,
  Paper,
  FormControlLabel,
  Switch,
  Slider,
} from '@mui/material';
import { PlayArrow, Refresh } from '@mui/icons-material';
import { ComponentSchema, DataSourceSchema } from '../../schemas/types';
import { useSchemaData } from '../../hooks/useSchemaData';

export interface DataSourceConfigProps {
  schema: ComponentSchema;
  dataSource?: DataSourceSchema;
  onChange: (dataSource: DataSourceSchema | undefined) => void;
}

/**
 * Configuration panel for data sources
 */
export const DataSourceConfig: React.FC<DataSourceConfigProps> = ({
  schema,
  dataSource,
  onChange,
}) => {
  const [localDataSource, setLocalDataSource] = useState<DataSourceSchema | undefined>(dataSource);
  const [testData, setTestData] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // Handle field changes
  const handleChange = (field: string, value: any) => {
    setLocalDataSource(
      (prev) =>
        ({
          ...prev,
          [field]: value,
        }) as DataSourceSchema
    );
  };

  // Handle cache config changes
  const handleCacheChange = (field: string, value: any) => {
    setLocalDataSource(
      (prev) =>
        ({
          ...prev,
          cache: {
            ...prev?.cache,
            [field]: value,
          },
        }) as DataSourceSchema
    );
  };

  // Test data source
  const handleTest = async () => {
    if (!localDataSource) {return;}

    setTesting(true);
    setTestError(null);
    setTestData(null);

    try {
      // Use the actual data fetching logic
      const response = await fetch(localDataSource.endpoint || '');
      const data = await response.json();
      setTestData(data);
    } catch (error) {
      setTestError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setTesting(false);
    }
  };

  // Save configuration
  const handleSave = () => {
    onChange(localDataSource);
  };

  // Remove data source
  const handleRemove = () => {
    onChange(undefined);
    setLocalDataSource(undefined);
    setTestData(null);
    setTestError(null);
  };

  if (!schema.dataShape) {
    return <Alert severity="info">This component does not support dynamic data sources</Alert>;
  }

  return (
    <Stack spacing={3}>
      {/* Data source type */}
      <FormControl fullWidth size="small">
        <InputLabel>Data Source Type</InputLabel>
        <Select
          value={localDataSource?.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          label="Data Source Type"
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="rest">REST API</MenuItem>
          <MenuItem value="graphql">GraphQL</MenuItem>
          <MenuItem value="static">Static Data</MenuItem>
        </Select>
      </FormControl>

      {localDataSource?.type && (
        <>
          {/* REST/GraphQL configuration */}
          {(localDataSource.type === 'rest' || localDataSource.type === 'graphql') && (
            <>
              <TextField
                fullWidth
                size="small"
                label="Endpoint URL"
                value={localDataSource.endpoint || ''}
                onChange={(e) => handleChange('endpoint', e.target.value)}
                placeholder="https://api.example.com/data"
              />

              {localDataSource.type === 'rest' && (
                <FormControl fullWidth size="small">
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={localDataSource.method || 'GET'}
                    onChange={(e) => handleChange('method', e.target.value)}
                    label="Method"
                  >
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
              )}

              {localDataSource.type === 'graphql' && (
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  label="Query"
                  value={localDataSource.query || ''}
                  onChange={(e) => handleChange('query', e.target.value)}
                  placeholder="query GetData { ... }"
                />
              )}
            </>
          )}

          {/* Static data configuration */}
          {localDataSource.type === 'static' && (
            <TextField
              fullWidth
              size="small"
              multiline
              rows={6}
              label="Static Data (JSON)"
              value={localDataSource.endpoint || ''}
              onChange={(e) => handleChange('endpoint', e.target.value)}
              placeholder='{"items": [...]}'
            />
          )}

          {/* Cache configuration */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Cache Settings
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localDataSource.cache?.enabled ?? false}
                    onChange={(e) => handleCacheChange('enabled', e.target.checked)}
                  />
                }
                label="Enable Caching"
              />

              {localDataSource.cache?.enabled && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Cache Duration (seconds)
                  </Typography>
                  <Slider
                    value={(localDataSource.cache?.ttl || 60000) / 1000}
                    onChange={(_, value) => handleCacheChange('ttl', (value as number) * 1000)}
                    min={10}
                    max={3600}
                    step={10}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 10, label: '10s' },
                      { value: 60, label: '1m' },
                      { value: 300, label: '5m' },
                      { value: 3600, label: '1h' },
                    ]}
                  />
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Transform function */}
          <TextField
            fullWidth
            size="small"
            multiline
            rows={4}
            label="Transform Function (optional)"
            value={localDataSource.transform || ''}
            onChange={(e) => handleChange('transform', e.target.value)}
            placeholder="return data.items.map(item => ({ ...item, label: item.name }))"
            helperText="JavaScript function to transform the response data"
          />

          {/* Test and save buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PlayArrow />}
              onClick={handleTest}
              disabled={testing || !localDataSource.endpoint}
            >
              Test
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={!localDataSource.type}>
              Save Configuration
            </Button>
            <Button variant="outlined" color="error" onClick={handleRemove}>
              Remove
            </Button>
          </Stack>

          {/* Test results */}
          {testError && <Alert severity="error">{testError}</Alert>}

          {testData && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Test Data
              </Typography>
              <Box
                component="pre"
                sx={{
                  overflow: 'auto',
                  maxHeight: 300,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(testData, null, 2)}
              </Box>
            </Paper>
          )}
        </>
      )}

      {/* Expected data shape */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Expected Data Shape
        </Typography>
        <Box
          component="pre"
          sx={{
            overflow: 'auto',
            maxHeight: 200,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'text.secondary',
          }}
        >
          {JSON.stringify(schema.dataShape, null, 2)}
        </Box>
      </Paper>
    </Stack>
  );
};
