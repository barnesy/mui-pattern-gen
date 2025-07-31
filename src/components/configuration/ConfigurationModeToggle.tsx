import React from 'react';
import { Fab, Tooltip, Box, Badge, IconButton, Chip } from '@mui/material';
import { Settings as ConfigIcon, Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { useConfigurationMode } from '../../contexts/ConfigurationModeContext';

interface ConfigurationModeToggleProps {
  variant?: 'fab' | 'icon';
}

export const ConfigurationModeToggle: React.FC<ConfigurationModeToggleProps> = ({ variant = 'fab' }) => {
  const { 
    isEnabled, 
    toggleEnabled, 
    currentPrototype,
    savePrototype,
  } = useConfigurationMode();

  const handleToggle = () => {
    toggleEnabled();
  };

  const handleQuickSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPrototype?.id) {
      await savePrototype();
    }
  };

  const buttonContent = (
    <Tooltip
      title={isEnabled ? 'Exit Configuration Mode' : 'Enter Configuration Mode'}
      placement={variant === 'fab' ? 'left' : 'bottom'}
    >
      <Badge
        color="primary"
        variant="dot"
        invisible={!isEnabled}
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: (theme) => 
              currentPrototype?.isDirty 
                ? theme.palette.warning.main 
                : theme.palette.success.main,
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
            onClick={handleToggle}
            aria-label="toggle Configuration Mode"
            sx={{
              transition: 'all 0.3s ease',
              transform: isEnabled ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isEnabled
                ? (theme) => `0 0 20px ${theme.palette.secondary.main}80`
                : undefined,
            }}
          >
            {isEnabled ? <CloseIcon /> : <ConfigIcon />}
          </Fab>
        ) : (
          <IconButton
            color={isEnabled ? 'secondary' : 'inherit'}
            onClick={handleToggle}
            aria-label="toggle Configuration Mode"
            sx={{
              transition: 'all 0.3s ease',
              transform: isEnabled ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {isEnabled ? <CloseIcon /> : <ConfigIcon />}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        {/* Prototype status indicator */}
        {isEnabled && currentPrototype && (
          <Chip
            label={currentPrototype.name}
            size="small"
            color={currentPrototype.isDirty ? 'warning' : 'success'}
            icon={currentPrototype.isDirty ? <SaveIcon /> : undefined}
            onClick={currentPrototype.isDirty && currentPrototype.id ? handleQuickSave : undefined}
            sx={{
              cursor: currentPrototype.isDirty && currentPrototype.id ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': currentPrototype.isDirty && currentPrototype.id ? {
                transform: 'scale(1.05)'
              } : undefined,
              backgroundColor: (theme) => 
                currentPrototype.isDirty 
                  ? theme.palette.warning.main
                  : theme.palette.success.main,
              color: (theme) => 
                currentPrototype.isDirty 
                  ? theme.palette.warning.contrastText
                  : theme.palette.success.contrastText,
            }}
          />
        )}
        
        {buttonContent}
      </Box>
    </Box>
  );
};