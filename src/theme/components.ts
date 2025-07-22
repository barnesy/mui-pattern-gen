import { Components, Theme } from '@mui/material/styles';

export const components: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        textTransform: 'none',
        fontWeight: 600,
      }),
      sizeLarge: {
        padding: '12px 24px',
        fontSize: '1rem',
      },
      sizeMedium: {
        padding: '8px 20px',
        fontSize: '0.875rem',
      },
      sizeSmall: {
        padding: '6px 16px',
        fontSize: '0.8125rem',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: theme.shape.borderRadius,
        },
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.palette.mode === 'light'
          ? '0 2px 8px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.3)',
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
      elevation1: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'light' 
          ? '0 2px 4px rgba(0,0,0,0.05)' 
          : '0 2px 4px rgba(0,0,0,0.2)',
      }),
      elevation2: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'light'
          ? '0 4px 8px rgba(0,0,0,0.08)'
          : '0 4px 8px rgba(0,0,0,0.3)',
      }),
      elevation3: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'light'
          ? '0 8px 16px rgba(0,0,0,0.1)'
          : '0 8px 16px rgba(0,0,0,0.4)',
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.divider,
      }),
    },
  },
  // Circular components - keep at 50%
  MuiAvatar: {
    styleOverrides: {
      root: {
        borderRadius: '50%', // Avatars always circular
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        borderRadius: '50%', // FABs always circular
      },
    },
  },
  // Previously had different radius - now using theme default
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  // Additional components for consistency
  MuiSelect: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiPopover: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        '&:first-of-type': {
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
        },
        '&:last-of-type': {
          borderBottomLeftRadius: theme.shape.borderRadius,
          borderBottomRightRadius: theme.shape.borderRadius,
        },
      }),
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiSnackbarContent-root': {
          borderRadius: theme.shape.borderRadius,
        },
      }),
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },
};