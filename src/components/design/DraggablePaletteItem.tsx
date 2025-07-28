import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { useDrag } from 'react-dnd';
import { ComponentSchema } from '../../schemas/types';

export interface PaletteDragItem {
  type: 'new-component';
  schemaId: string;
  schema: ComponentSchema;
}

export interface DraggablePaletteItemProps {
  schema: ComponentSchema;
  onAddComponent: (schemaId: string) => void;
}

/**
 * Draggable component from palette
 */
export const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({
  schema,
  onAddComponent,
}) => {
  const [{ isDragging }, drag] = useDrag<PaletteDragItem, unknown, { isDragging: boolean }>({
    type: 'new-component',
    item: {
      type: 'new-component',
      schemaId: schema.id,
      schema,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Card
      ref={drag}
      variant="outlined"
      onClick={() => onAddComponent(schema.id)}
      sx={{
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          {schema.name}
        </Typography>
        {schema.description && (
          <Typography variant="caption" color="text.secondary">
            {schema.description}
          </Typography>
        )}
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {schema.props.slice(0, 3).map((prop) => (
            <Chip
              key={prop.name}
              label={prop.name}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
          {schema.props.length > 3 && (
            <Chip
              label={`+${schema.props.length - 3}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
