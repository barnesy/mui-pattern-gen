import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';

interface TypographyControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  options?: { label: string; value: string }[];
}

const defaultTypographyOptions = [
  { label: 'H1', value: 'h1' },
  { label: 'H2', value: 'h2' },
  { label: 'H3', value: 'h3' },
  { label: 'H4', value: 'h4' },
  { label: 'H5', value: 'h5' },
  { label: 'H6', value: 'h6' },
  { label: 'Subtitle 1', value: 'subtitle1' },
  { label: 'Subtitle 2', value: 'subtitle2' },
  { label: 'Body 1', value: 'body1' },
  { label: 'Body 2', value: 'body2' },
  { label: 'Caption', value: 'caption' },
  { label: 'Overline', value: 'overline' },
];

export const TypographyControl: React.FC<TypographyControlProps> = React.memo(
  ({ label, value, onChange, helperText, options = defaultTypographyOptions }) => {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {options.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              size="small"
              onClick={() => onChange(option.value)}
              data-ai-ignore="true"
              sx={(theme) => ({
                bgcolor:
                  value === option.value
                    ? theme.palette.mode === 'dark'
                      ? 'primary.dark'
                      : 'primary.light'
                    : theme.palette.mode === 'dark'
                      ? 'grey.800'
                      : 'grey.200',
                color:
                  value === option.value
                    ? theme.palette.mode === 'dark'
                      ? 'primary.contrastText'
                      : 'primary.main'
                    : 'text.secondary',
                fontWeight: value === option.value ? 600 : 400,
                border:
                  value === option.value
                    ? `1px solid ${theme.palette.primary.main}`
                    : '1px solid transparent',
                '&:hover': {
                  bgcolor:
                    value === option.value
                      ? theme.palette.mode === 'dark'
                        ? 'primary.dark'
                        : 'primary.light'
                      : theme.palette.mode === 'dark'
                        ? 'grey.700'
                        : 'grey.300',
                },
              })}
            />
          ))}
        </Stack>
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        )}
      </Box>
    );
  }
);
