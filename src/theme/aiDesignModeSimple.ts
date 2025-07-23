import { Theme } from '@mui/material/styles';

// Simple function to add AI design mode styles to components
export const addAIDesignModeStyles = (theme: Theme) => {
  const aiModeStyles = {
    '&[data-ai-mode="true"]': {
      position: 'relative',
      '&:hover': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
        cursor: 'pointer',
      },
      '&[data-ai-selected="true"]': {
        outline: `2px solid ${theme.palette.secondary.main}`,
        outlineOffset: '2px',
        boxShadow: `0 0 10px ${theme.palette.secondary.main}`,
      },
    },
  };

  const textFieldStyles = {
    '&[data-ai-mode="true"]': {
      '& .MuiOutlinedInput-root:hover': {
        '& fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: '2px',
        },
      },
      '&[data-ai-selected="true"] .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: theme.palette.secondary.main,
          borderWidth: '2px',
          boxShadow: `0 0 5px ${theme.palette.secondary.main}`,
        },
      },
    },
  };

  const cardStyles = {
    '&[data-ai-mode="true"]': {
      transition: 'all 0.2s ease',
      '&:hover': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
        transform: 'translateY(-2px)',
      },
      '&[data-ai-selected="true"]': {
        outline: `2px solid ${theme.palette.secondary.main}`,
        outlineOffset: '2px',
        boxShadow: `0 0 15px ${theme.palette.secondary.main}`,
      },
    },
  };

  const typographyStyles = {
    '&[data-ai-mode="true"]': {
      '&:hover': {
        outline: `1px dashed ${theme.palette.primary.main}`,
        outlineOffset: '4px',
      },
      '&[data-ai-selected="true"]': {
        outline: `1px solid ${theme.palette.secondary.main}`,
        outlineOffset: '4px',
      },
    },
  };

  return {
    aiModeStyles,
    textFieldStyles,
    cardStyles,
    typographyStyles,
  };
};