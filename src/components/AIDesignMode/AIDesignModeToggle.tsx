import React from 'react';
import { Fab, Tooltip, Box, Badge, IconButton } from '@mui/material';
import { AutoAwesome as AIIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAIDesignMode } from '../../contexts/AIDesignModeContext';

interface AIDesignModeToggleProps {
  variant?: 'fab' | 'icon';
}

export const AIDesignModeToggle: React.FC<AIDesignModeToggleProps> = ({ variant = 'fab' }) => {
  const { isEnabled, toggleEnabled } = useAIDesignMode();

  const buttonContent = (
    <Tooltip
      title={isEnabled ? 'Exit AI Design Mode' : 'Enter AI Design Mode'}
      placement={variant === 'fab' ? 'left' : 'bottom'}
    >
      <Badge
        color="primary"
        variant="dot"
        invisible={!isEnabled}
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: (theme) => theme.palette.success.main,
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
            '&::after': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              animation: isEnabled ? 'ripple 1.2s infinite ease-in-out' : 'none',
              border: '1px solid currentColor',
              content: '""',
            },
          },
          '@keyframes ripple': {
            '0%': {
              transform: 'scale(.8)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(2.4)',
              opacity: 0,
            },
          },
        }}
      >
        {variant === 'fab' ? (
          <Fab
            color={isEnabled ? 'secondary' : 'primary'}
            onClick={toggleEnabled}
            aria-label="toggle AI Design Mode"
            sx={{
              transition: 'all 0.3s ease',
              transform: isEnabled ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isEnabled
                ? (theme) => `0 0 20px ${theme.palette.secondary.main}80`
                : undefined,
            }}
          >
            {isEnabled ? <CloseIcon /> : <AIIcon />}
          </Fab>
        ) : (
          <IconButton
            color={isEnabled ? 'secondary' : 'inherit'}
            onClick={toggleEnabled}
            aria-label="toggle AI Design Mode"
            sx={{
              transition: 'all 0.3s ease',
              transform: isEnabled ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {isEnabled ? <CloseIcon /> : <AIIcon />}
          </IconButton>
        )}
      </Badge>
    </Tooltip>
  );

  if (variant === 'icon') {
    return buttonContent;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: (theme) => theme.zIndex.modal + 1,
      }}
    >
      {buttonContent}
    </Box>
  );
};
