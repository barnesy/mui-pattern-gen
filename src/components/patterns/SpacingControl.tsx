import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Paper,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import { SpacingConfig } from '../../types/PatternVariant';

interface SpacingControlProps {
  label: string;
  value: SpacingConfig;
  onChange: (value: SpacingConfig) => void;
  helperText?: string;
}

export const SpacingControl: React.FC<SpacingControlProps> = React.memo(({
  label,
  value,
  onChange,
  helperText,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [linked, setLinked] = React.useState(
    value.top === value.right && 
    value.right === value.bottom && 
    value.bottom === value.left
  );

  const handleSideChange = (side: keyof SpacingConfig, newValue: number) => {
    if (linked) {
      // Update all sides when linked
      onChange({
        top: newValue,
        right: newValue,
        bottom: newValue,
        left: newValue,
      });
    } else {
      // Update only the specific side
      onChange({
        ...value,
        [side]: newValue,
      });
    }
  };

  const handleLinkedChange = (newValue: number) => {
    onChange({
      top: newValue,
      right: newValue,
      bottom: newValue,
      left: newValue,
    });
  };

  const toggleLinked = () => {
    if (!linked) {
      // When linking, use the top value for all sides
      handleLinkedChange(value.top);
    }
    setLinked(!linked);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">{label}</Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ p: 0.5 }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Stack>
        
        <Stack direction="row" alignItems="center" spacing={1}>
          {linked && (
            <TextField
              type="number"
              size="small"
              value={value.top}
              onChange={(e) => handleLinkedChange(Number(e.target.value))}
              inputProps={{ min: 0, max: 100, step: 4 }}
              sx={{ width: 70 }}
            />
          )}
          <Tooltip title={linked ? "Unlink sides" : "Link all sides"}>
            <IconButton size="small" onClick={toggleLinked} color={linked ? "primary" : "default"}>
              {linked ? <LinkIcon fontSize="small" /> : <LinkOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {helperText && (
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          {helperText}
        </Typography>
      )}

      <Collapse in={expanded && !linked}>
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
              gap: 1,
              alignItems: 'center',
              maxWidth: 200,
              mx: 'auto',
            }}
          >
            {/* Top */}
            <Box />
            <TextField
              type="number"
              size="small"
              label="Top"
              value={value.top}
              onChange={(e) => handleSideChange('top', Number(e.target.value))}
              inputProps={{ min: 0, max: 100, step: 4 }}
            />
            <Box />

            {/* Left and Right */}
            <TextField
              type="number"
              size="small"
              label="Left"
              value={value.left}
              onChange={(e) => handleSideChange('left', Number(e.target.value))}
              inputProps={{ min: 0, max: 100, step: 4 }}
            />
            <Box
              sx={{
                width: '100%',
                height: 40,
                border: 2,
                borderStyle: 'dashed',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
            <TextField
              type="number"
              size="small"
              label="Right"
              value={value.right}
              onChange={(e) => handleSideChange('right', Number(e.target.value))}
              inputProps={{ min: 0, max: 100, step: 4 }}
            />

            {/* Bottom */}
            <Box />
            <TextField
              type="number"
              size="small"
              label="Bottom"
              value={value.bottom}
              onChange={(e) => handleSideChange('bottom', Number(e.target.value))}
              inputProps={{ min: 0, max: 100, step: 4 }}
            />
            <Box />
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
});