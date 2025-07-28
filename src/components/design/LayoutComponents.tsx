import React from 'react';
import { Container, Grid, Stack, Divider, Box, Typography } from '@mui/material';

/**
 * Container wrapper for design system
 */
export const ContainerComponent: React.FC<{
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  children?: React.ReactNode;
  isDropTarget?: boolean;
}> = ({ maxWidth = 'lg', disableGutters = false, children, isDropTarget = false }) => {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        minHeight: hasChildren ? 'auto' : 100,
        transition: 'all 0.2s ease',
        ...(isDropTarget && {
          backgroundColor: 'action.hover',
          borderRadius: 1,
        }),
      }}
    >
      {hasChildren ? (
        children
      ) : (
        <Box
          sx={{
            minHeight: 100,
            border: '2px dashed',
            borderColor: isDropTarget ? 'primary.main' : 'divider',
            backgroundColor: isDropTarget ? 'action.hover' : 'transparent',
            p: 3,
            borderRadius: 1,
            textAlign: 'center',
            color: 'text.secondary',
            transition: 'all 0.2s ease',
          }}
        >
          Container - Drop components here
        </Box>
      )}
    </Container>
  );
};

/**
 * Grid container wrapper for design system
 */
export const GridContainerComponent: React.FC<{
  spacing?: number;
  direction?: 'row' | 'column';
  children?: React.ReactNode;
  isDropTarget?: boolean;
}> = ({ spacing = 2, direction = 'row', children, isDropTarget = false }) => {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <Grid
      container
      spacing={spacing}
      direction={direction}
      sx={{
        minHeight: hasChildren ? 'auto' : 120,
        border: hasChildren ? 'none' : '2px dashed',
        borderColor: isDropTarget ? 'primary.main' : 'divider',
        backgroundColor: isDropTarget ? 'action.hover' : 'transparent',
        p: hasChildren ? 0 : 3,
        borderRadius: 1,
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {hasChildren ? (
        React.Children.map(children, (child, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {child}
          </Grid>
        ))
      ) : (
        <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            color: isDropTarget ? 'primary.main' : 'text.secondary',
            fontWeight: isDropTarget ? 'medium' : 'normal',
            transition: 'all 0.2s ease',
          }}
        >
          <Typography variant="body2">
            {isDropTarget ? '📦 Drop component here' : 'Grid Container - Drop components here'}
          </Typography>
        </Box>
      )}
    </Grid>
  );
};

/**
 * Stack wrapper for design system
 */
export const StackComponent: React.FC<{
  direction?: 'row' | 'column';
  spacing?: number;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  children?: React.ReactNode;
  isDropTarget?: boolean;
}> = ({
  direction = 'column',
  spacing = 2,
  alignItems = 'stretch',
  children,
  isDropTarget = false,
}) => {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <Stack
      direction={direction}
      spacing={spacing}
      alignItems={alignItems}
      sx={{
        minHeight: hasChildren ? 'auto' : 100,
        border: hasChildren ? 'none' : '2px dashed',
        borderColor: isDropTarget ? 'primary.main' : 'divider',
        backgroundColor: isDropTarget ? 'action.hover' : 'transparent',
        p: hasChildren ? 0 : 3,
        borderRadius: 1,
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {hasChildren ? (
        children
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            color: isDropTarget ? 'primary.main' : 'text.secondary',
            fontWeight: isDropTarget ? 'medium' : 'normal',
            transition: 'all 0.2s ease',
          }}
        >
          <Typography variant="body2">
            {isDropTarget ? '📦 Drop component here' : 'Stack - Drop components here'}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

/**
 * Divider wrapper for design system
 */
export const DividerComponent: React.FC<{
  orientation?: 'horizontal' | 'vertical';
  variant?: 'fullWidth' | 'inset' | 'middle';
}> = ({ orientation = 'horizontal', variant = 'fullWidth' }) => {
  return (
    <Box sx={{ my: 2, mx: orientation === 'vertical' ? 2 : 0 }}>
      <Divider orientation={orientation} variant={variant} />
    </Box>
  );
};

/**
 * Register all layout components
 */
export function registerLayoutComponents(registry: Map<string, React.ComponentType<any>>) {
  registry.set('Container', ContainerComponent);
  registry.set('Grid', GridContainerComponent);
  registry.set('Stack', StackComponent);
  registry.set('Divider', DividerComponent);
}
