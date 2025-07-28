import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  FormatAlignLeft as AllIcon,
  BorderTop as TopIcon,
  BorderRight as RightIcon,
  BorderBottom as BottomIcon,
  BorderLeft as LeftIcon,
} from '@mui/icons-material';

interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SpacingControlProps {
  label: string;
  value: SpacingValue;
  onChange: (value: SpacingValue) => void;
  type?: 'margin' | 'padding';
  helperText?: string;
}

export const SpacingControl: React.FC<SpacingControlProps> = ({
  label,
  value,
  onChange,
  type = 'margin',
  helperText,
}) => {
  const theme = useTheme();
  const [linkedSides, setLinkedSides] = useState<'all' | 'none'>('none');

  const handleSideChange = useCallback(
    (side: keyof SpacingValue, newValue: number) => {
      if (linkedSides === 'all') {
        onChange({
          top: newValue,
          right: newValue,
          bottom: newValue,
          left: newValue,
        });
      } else {
        onChange({
          ...value,
          [side]: newValue,
        });
      }
    },
    [value, onChange, linkedSides]
  );

  const handleLinkedChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: 'all' | 'none' | null
  ) => {
    if (newValue !== null) {
      setLinkedSides(newValue);
      if (newValue === 'all') {
        // Set all sides to the top value
        onChange({
          top: value.top,
          right: value.top,
          bottom: value.top,
          left: value.top,
        });
      }
    }
  };

  const color = type === 'margin' ? 'primary' : 'secondary';

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="body2">{label}</Typography>
        <ToggleButtonGroup value={linkedSides} exclusive onChange={handleLinkedChange} size="small">
          <ToggleButton value="all" sx={{ px: 1, py: 0.5 }}>
            <Tooltip title="Link all sides">
              <AllIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Visual Spacing Box */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 200,
          border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
          borderRadius: 1,
          mb: 2,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        {/* Outer box (margin visualization) */}
        <Box
          sx={{
            position: 'absolute',
            top: `${value.top * 8}px`,
            right: `${value.right * 8}px`,
            bottom: `${value.bottom * 8}px`,
            left: `${value.left * 8}px`,
            border: `2px solid ${alpha(theme.palette[color].main, 0.3)}`,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette[color].main, 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette[color].main,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {type}
          </Typography>
        </Box>

        {/* Spacing value labels */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            py: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {value.top}
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            px: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {value.right}
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            py: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {value.bottom}
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            px: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {value.left}
          </Typography>
        </Box>
      </Box>

      {/* Input Controls */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
        }}
      >
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Stack key={side} spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {side === 'top' && <TopIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
              {side === 'right' && <RightIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
              {side === 'bottom' && (
                <BottomIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              )}
              {side === 'left' && <LeftIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
              <Typography variant="caption" color="text.secondary">
                {side.charAt(0).toUpperCase()}
              </Typography>
            </Stack>
            <TextField
              type="number"
              size="small"
              value={value[side]}
              onChange={(e) => {
                const newValue = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
                handleSideChange(side, newValue);
              }}
              inputProps={{
                min: 0,
                max: 10,
                step: 1,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  padding: '4px 8px',
                },
              }}
            />
          </Stack>
        ))}
      </Box>

      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
