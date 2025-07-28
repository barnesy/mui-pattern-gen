import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, MoreVert } from '@mui/icons-material';
import { DataShape, ComponentSchema } from '../../schemas/types';
import { commonDataShapes } from '../../schemas/registry';

export interface SchemaDataDisplayProps {
  data: any;
  title?: string;
  subtitle?: string;
  variant?: 'auto' | 'stats' | 'list' | 'table' | 'cards';
  showHeader?: boolean;
}

/**
 * Smart data display component that adapts to data shape
 */
export const SchemaDataDisplay: React.FC<SchemaDataDisplayProps> = ({
  data,
  title,
  subtitle,
  variant = 'auto',
  showHeader = true,
}) => {
  // Auto-detect best display variant
  const displayVariant = variant === 'auto' ? detectDisplayVariant(data) : variant;

  const renderHeader = () => {
    if (!showHeader || (!title && !subtitle)) {return null;}

    return (
      <CardHeader
        title={title}
        subheader={subtitle}
        action={
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        }
      />
    );
  };

  const renderContent = () => {
    switch (displayVariant) {
      case 'stats':
        return <StatsDisplay data={data} />;
      case 'list':
        return <ListDisplay data={data} />;
      case 'table':
        return <TableDisplay data={data} />;
      case 'cards':
        return <CardsDisplay data={data} />;
      default:
        return <JsonDisplay data={data} />;
    }
  };

  return (
    <Card>
      {renderHeader()}
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

// Display variants

const StatsDisplay: React.FC<{ data: any }> = ({ data }) => {
  const stats = Array.isArray(data) ? data : [data];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {stat.label}
            </Typography>
            <Typography variant="h4" component="div">
              {stat.value}
              {stat.unit && (
                <Typography variant="body1" component="span" ml={0.5}>
                  {stat.unit}
                </Typography>
              )}
            </Typography>
            {stat.trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {stat.trend === 'up' && <TrendingUp color="success" />}
                {stat.trend === 'down' && <TrendingDown color="error" />}
                {stat.trend === 'flat' && <TrendingFlat color="disabled" />}
                {stat.trendValue && (
                  <Typography
                    variant="body2"
                    color={
                      stat.trend === 'up'
                        ? 'success.main'
                        : stat.trend === 'down'
                          ? 'error.main'
                          : 'text.secondary'
                    }
                    ml={0.5}
                  >
                    {stat.trendValue}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

const ListDisplay: React.FC<{ data: any }> = ({ data }) => {
  const items = Array.isArray(data) ? data : [data];

  return (
    <List>
      {items.map((item, index) => (
        <ListItem key={item.id || index}>
          {item.avatar && (
            <Avatar src={item.avatar} sx={{ mr: 2 }}>
              {item.title?.[0]}
            </Avatar>
          )}
          <ListItemText
            primary={item.title || item.name || item.label}
            secondary={item.subtitle || item.description}
          />
          {item.status && (
            <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
          )}
        </ListItem>
      ))}
    </List>
  );
};

const TableDisplay: React.FC<{ data: any }> = ({ data }) => {
  let columns: string[] = [];
  let rows: any[] = [];

  if (data?.columns && data?.rows) {
    // Structured table data
    columns = data.columns;
    rows = data.rows;
  } else if (Array.isArray(data) && data.length > 0) {
    // Array of objects
    columns = Object.keys(data[0]);
    rows = data;
  } else {
    return <Typography>No table data available</Typography>;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={typeof column === 'object' ? column.key : column}>
                {typeof column === 'object' ? column.label : column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => {
                const key = typeof column === 'object' ? column.key : column;
                return <TableCell key={key}>{formatCellValue(row[key])}</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const CardsDisplay: React.FC<{ data: any }> = ({ data }) => {
  const items = Array.isArray(data) ? data : [data];

  return (
    <Grid container spacing={2}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={item.id || index}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {item.title || item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description || item.subtitle}
              </Typography>
              {item.metadata && (
                <Box mt={2}>
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <Typography key={key} variant="caption" display="block">
                      <strong>{key}:</strong> {String(value)}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const JsonDisplay: React.FC<{ data: any }> = ({ data }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
      <pre style={{ margin: 0, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
    </Paper>
  );
};

// Helper functions

function detectDisplayVariant(data: any): string {
  if (!data) {return 'json';}

  // Check for stats data
  if (Array.isArray(data) && data.length > 0 && data[0].label && data[0].value) {
    return 'stats';
  }

  // Check for table data
  if (data.columns && data.rows) {
    return 'table';
  }

  // Check for list data
  if (Array.isArray(data) && data.length > 0 && (data[0].title || data[0].name)) {
    return data.length > 5 ? 'list' : 'cards';
  }

  // Check for array of objects with many properties
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    Object.keys(data[0]).length > 3
  ) {
    return 'table';
  }

  return 'json';
}

function getStatusColor(status: string): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
    case 'active':
      return 'success';
    case 'error':
    case 'failed':
      return 'error';
    case 'pending':
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'default';
  }
}

function formatCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

// Component schema
export const SchemaDataDisplaySchema: ComponentSchema = {
  id: 'SchemaDataDisplay',
  name: 'Schema Data Display',
  type: 'display',
  category: 'data',
  description: 'Smart component that adapts display based on data shape',
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Card title',
    },
    {
      name: 'subtitle',
      type: 'string',
      description: 'Card subtitle',
    },
    {
      name: 'variant',
      type: 'enum',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Stats', value: 'stats' },
        { label: 'List', value: 'list' },
        { label: 'Table', value: 'table' },
        { label: 'Cards', value: 'cards' },
      ],
      default: 'auto',
      description: 'Display variant (auto-detects if not specified)',
    },
    {
      name: 'showHeader',
      type: 'boolean',
      default: true,
      description: 'Show card header',
    },
  ],
  // Accepts any data shape
  dataShape: {
    type: 'object',
    fields: {},
  },
};
