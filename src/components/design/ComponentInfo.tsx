import React from 'react';
import { Box, Typography, Chip, Stack, List, ListItem, ListItemText, Paper } from '@mui/material';
import { ComponentSchema } from '../../schemas/types';
import { ComponentInstance } from '../../stores/designStore';

export interface ComponentInfoProps {
  schema: ComponentSchema;
  instance: ComponentInstance;
}

/**
 * Display component metadata and information
 */
export const ComponentInfo: React.FC<ComponentInfoProps> = ({ schema, instance }) => {
  return (
    <Stack spacing={2}>
      {/* Basic info */}
      <Box>
        <Typography variant="body2" color="text.secondary">
          Component ID
        </Typography>
        <Typography variant="body1" fontFamily="monospace">
          {schema.id}
        </Typography>
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          Instance ID
        </Typography>
        <Typography variant="body1" fontFamily="monospace" fontSize="0.875rem">
          {instance.id}
        </Typography>
      </Box>

      {/* Type and category */}
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Type & Category
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={schema.type} size="small" color="primary" />
          {schema.category && <Chip label={schema.category} size="small" variant="outlined" />}
        </Stack>
      </Box>

      {/* Description */}
      {schema.description && (
        <Box>
          <Typography variant="body2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1">{schema.description}</Typography>
        </Box>
      )}

      {/* Dependencies */}
      {schema.dependencies && schema.dependencies.length > 0 && (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Dependencies
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {schema.dependencies.map((dep) => (
              <Chip key={dep} label={dep} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}

      {/* Imports */}
      {schema.imports && schema.imports.length > 0 && (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Imports
          </Typography>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <Box
              component="pre"
              sx={{
                margin: 0,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                overflow: 'auto',
              }}
            >
              {schema.imports.join('\n')}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Metadata */}
      {instance.metadata && (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Metadata
          </Typography>
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemText
                primary="Created"
                secondary={new Date(instance.metadata.createdAt).toLocaleString()}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary="Updated"
                secondary={new Date(instance.metadata.updatedAt).toLocaleString()}
              />
            </ListItem>
            {instance.metadata.name && (
              <ListItem disableGutters>
                <ListItemText primary="Custom Name" secondary={instance.metadata.name} />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      {/* Props summary */}
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Configured Props
        </Typography>
        <Stack spacing={0.5}>
          {Object.entries(instance.props).map(([key, value]) => (
            <Box key={key} display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" sx={{ minWidth: 100 }}>
                {key}:
              </Typography>
              <Typography variant="caption" fontFamily="monospace">
                {JSON.stringify(value)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};
