import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Stack,
  Paper,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PropControl } from './PatternPropsPanel';
import { SpacingControl } from './SpacingControl';
import { SizeControl } from '../AIDesignMode/SizeControl';
import { TypographyControl } from './TypographyControl';
import { SpacingConfig } from '../../types/PatternVariant';
import { deepEqual } from '../../utils/deepEqual';

// Re-export for compatibility
export type SettingControl = PropControl;

// Memoized control components to prevent re-renders
const BooleanControl = React.memo<{
  control: PropControl;
  value: boolean;
  onChange: (name: string, value: any) => void;
}>(
  ({ control, value, onChange }) => (
    <FormControlLabel
      control={
        <Switch
          checked={!!value}
          onChange={(e) => onChange(control.name, e.target.checked)}
          size="small"
        />
      }
      label={control.label}
    />
  ),
  (prev, next) =>
    prev.value === next.value &&
    prev.control.name === next.control.name &&
    prev.onChange === next.onChange
);

const SelectControl = React.memo<{
  control: PropControl;
  value: any;
  onChange: (name: string, value: any) => void;
}>(
  ({ control, value, onChange }) => (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {control.label}
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {control.options?.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            size="small"
            onClick={() => onChange(control.name, option.value)}
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
      {control.helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {control.helperText}
        </Typography>
      )}
    </Box>
  ),
  (prev, next) =>
    prev.value === next.value &&
    prev.control.name === next.control.name &&
    prev.onChange === next.onChange
);

const SliderControl = React.memo<{
  control: PropControl;
  value: number;
  onChange: (name: string, value: any) => void;
}>(
  ({ control, value, onChange }) => (
    <Box>
      <Typography variant="body2" gutterBottom>
        {control.label}
        {control.name !== 'width' && control.name !== 'height' ? `: ${value}` : ''}
      </Typography>
      <Slider
        value={value ?? control.min ?? 0}
        onChange={(_, newValue) => onChange(control.name, newValue)}
        step={control.step || 1}
        valueLabelDisplay="auto"
        marks
        size="small"
      />
      {control.helperText && (
        <Typography variant="caption" color="text.secondary">
          {control.helperText}
        </Typography>
      )}
    </Box>
  ),
  (prev, next) =>
    prev.value === next.value &&
    prev.control.name === next.control.name &&
    prev.onChange === next.onChange
);

const VariantControl = React.memo<{
  control: PropControl;
  value: any;
  onChange: (name: string, value: any) => void;
}>(
  ({ control, value, onChange }) => (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {control.label}
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {control.options?.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            size="small"
            onClick={() => onChange(control.name, option.value)}
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
      {control.helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {control.helperText}
        </Typography>
      )}
    </Box>
  ),
  (prev, next) =>
    prev.value === next.value &&
    prev.control.name === next.control.name &&
    prev.onChange === next.onChange
);

const MemoizedSpacingControl = React.memo<{
  control: PropControl;
  value: SpacingConfig;
  onChange: (name: string, value: any) => void;
}>(
  ({ control, value, onChange }) => {
    const spacingValue = value || {
      top: control.defaultValue?.top || 16,
      right: control.defaultValue?.right || 16,
      bottom: control.defaultValue?.bottom || 16,
      left: control.defaultValue?.left || 16,
    };

    return (
      <SpacingControl
        label={control.label}
        value={spacingValue}
        onChange={(newValue) => onChange(control.name, newValue)}
        helperText={control.helperText}
      />
    );
  },
  (prev, next) =>
    deepEqual(prev.value, next.value) &&
    prev.control.name === next.control.name &&
    prev.onChange === next.onChange
);

const MemoizedSizeControl = React.memo<{
  control: PropControl;
  value: any;
  onChange: (name: string, value: any) => void;
}>(
  ({ control, value, onChange }) => (
    <SizeControl
      label={control.label}
      value={value || control.defaultValue || { mode: 'auto' }}
      onChange={(newValue) => onChange(control.name, newValue)}
      min={control.min}
      max={control.max}
      step={control.step}
      helperText={control.helperText}
    />
  ),
  (prev, next) => deepEqual(prev.value, next.value) && prev.control.name === next.control.name
);

const MemoizedTypographyControl = React.memo<{
  control: PropControl;
  value: any;
  onChange: (name: string, value: any) => void;
}>(
  ({ control, value, onChange }) => (
    <TypographyControl
      label={control.label}
      value={value || control.defaultValue || 'body1'}
      onChange={(newValue) => onChange(control.name, newValue)}
      helperText={control.helperText}
      options={control.options}
    />
  ),
  (prev, next) =>
    prev.value === next.value &&
    prev.control.name === next.control.name &&
    prev.onChange === next.onChange
);

interface SettingsPanelProps {
  controls: PropControl[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  debug?: boolean; // Optional debug mode
}

export const SettingsPanel: React.FC<SettingsPanelProps> = React.memo(
  ({ controls, values, onChange, debug = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Debug logging
    React.useEffect(() => {
      if (debug) {
        console.log('[SettingsPanel] Rendered with values:', values);
      }
    });

    // Memoize control filtering and grouping
    const {
      settingsControls,
      componentControls,
      spacingControls,
      typographyControls,
      regularBooleanControls,
      otherControls,
      groupedComponentControls,
    } = React.useMemo(() => {
      // Filter out content controls (text/number) and width/height controls
      const settingsControls = controls.filter(
        (c) =>
          !c.isContent &&
          [
            'boolean',
            'select',
            'slider',
            'variant',
            'spacing',
            'size',
            'padding',
            'margin',
            'typography',
          ].includes(c.type) &&
          c.name !== 'width' &&
          c.name !== 'height'
      );

      // Separate controls by type
      const componentControls = settingsControls.filter(
        (c) => c.type === 'boolean' && c.isComponent
      );
      const spacingControls = settingsControls.filter((c) =>
        ['padding', 'margin', 'spacing'].includes(c.type)
      );
      const typographyControls = settingsControls.filter((c) => c.type === 'typography');
      const regularBooleanControls = settingsControls.filter(
        (c) => c.type === 'boolean' && !c.isComponent
      );
      const otherControls = settingsControls.filter(
        (c) =>
          c.type !== 'boolean' && !['padding', 'margin', 'spacing', 'typography'].includes(c.type)
      );

      // Group component controls by componentGroup
      const groupedComponentControls = componentControls.reduce(
        (acc, control) => {
          const group = control.componentGroup || 'Other';
          if (!acc[group]) {acc[group] = [];}
          acc[group].push(control);
          return acc;
        },
        {} as Record<string, PropControl[]>
      );

      return {
        settingsControls,
        componentControls,
        spacingControls,
        typographyControls,
        regularBooleanControls,
        otherControls,
        groupedComponentControls,
      };
    }, [controls]);

    // Create a stable render function that uses memoized components
    const renderControl = React.useCallback(
      (control: PropControl) => {
        const value = values[control.name] ?? control.defaultValue;

        switch (control.type) {
          case 'boolean':
            return (
              <BooleanControl
                key={control.name}
                control={control}
                value={value}
                onChange={onChange}
              />
            );

          case 'select':
            return (
              <SelectControl
                key={control.name}
                control={control}
                value={value}
                onChange={onChange}
              />
            );

          case 'slider':
            return (
              <SliderControl
                key={control.name}
                control={control}
                value={value}
                onChange={onChange}
              />
            );

          case 'variant':
            return (
              <VariantControl
                key={control.name}
                control={control}
                value={value}
                onChange={onChange}
              />
            );

          case 'spacing':
            return (
              <MemoizedSpacingControl
                key={control.name}
                control={control}
                value={value || control.defaultValue || { top: 0, right: 0, bottom: 0, left: 0 }}
                onChange={onChange}
              />
            );

          case 'size':
            return (
              <MemoizedSizeControl
                key={control.name}
                control={control}
                value={value}
                onChange={onChange}
              />
            );

          case 'padding':
          case 'margin':
            return (
              <MemoizedSpacingControl
                key={control.name}
                control={control}
                value={value}
                onChange={onChange}
              />
            );

          case 'typography':
            return (
              <MemoizedTypographyControl
                key={control.name}
                control={control}
                value={value}
                onChange={onChange}
              />
            );

          default:
            return null;
        }
      },
      [values, onChange]
    );

    // If no settings controls, show a message
    if (settingsControls.length === 0) {
      return (
        <Paper elevation={0} sx={{ p: 2 }} data-ai-ignore="true">
          <Typography variant="body2" color="text.secondary" align="center">
            No settings available for this pattern
          </Typography>
        </Paper>
      );
    }

    // Render component controls section
    const renderComponentSection = () => {
      if (componentControls.length === 0) {return null;}

      return (
        <Paper elevation={0} sx={{ overflow: 'hidden' }} data-ai-ignore="true">
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Components
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Toggle pattern components on/off
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ p: isMobile ? 1.5 : 2 }}>
            {Object.entries(groupedComponentControls).map(([groupName, groupControls]) => (
              <Box key={groupName}>
                {Object.keys(groupedComponentControls).length > 1 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    {groupName}
                  </Typography>
                )}
                <Stack spacing={1}>{groupControls.map((control) => renderControl(control))}</Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      );
    };

    // Render settings section
    const renderSettingsSection = () => {
      const hasSettings =
        spacingControls.length > 0 ||
        typographyControls.length > 0 ||
        regularBooleanControls.length > 0 ||
        otherControls.length > 0;
      if (!hasSettings) {return null;}

      return (
        <Paper elevation={0} sx={{ overflow: 'hidden' }} data-ai-ignore="true">
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Settings
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ p: isMobile ? 1.5 : 2 }}>
            {/* Spacing controls at the top */}
            {spacingControls.length > 0 && (
              <Box>
                <Stack spacing={2}>
                  {spacingControls.map((control) => renderControl(control))}
                </Stack>
                {(typographyControls.length > 0 ||
                  regularBooleanControls.length > 0 ||
                  otherControls.length > 0) && <Divider sx={{ my: 2 }} />}
              </Box>
            )}

            {/* Typography controls */}
            {typographyControls.length > 0 && (
              <Box>
                <Stack spacing={2}>
                  {typographyControls.map((control) => renderControl(control))}
                </Stack>
                {(regularBooleanControls.length > 0 || otherControls.length > 0) && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            )}

            {/* Regular boolean controls grouped together */}
            {regularBooleanControls.length > 0 && (
              <Box>
                <Stack spacing={1}>
                  {regularBooleanControls.map((control) => renderControl(control))}
                </Stack>
                {otherControls.length > 0 && <Divider sx={{ my: 2 }} />}
              </Box>
            )}

            {/* Other controls */}
            {otherControls.map((control) => renderControl(control))}
          </Stack>
        </Paper>
      );
    };

    return (
      <Stack spacing={isMobile ? 2 : 3} data-ai-ignore="true">
        {renderComponentSection()}
        {renderSettingsSection()}
      </Stack>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    // Only re-render if controls change or relevant values change
    if (prevProps.controls !== nextProps.controls || prevProps.onChange !== nextProps.onChange) {
      if (prevProps.debug || nextProps.debug) {
        console.log('[SettingsPanel] Re-rendering due to controls or onChange change');
      }
      return false;
    }

    // Check if any values that are actually rendered have changed
    const settingsControls = prevProps.controls.filter(
      (c) =>
        !c.isContent &&
        [
          'boolean',
          'select',
          'slider',
          'variant',
          'spacing',
          'size',
          'padding',
          'margin',
          'typography',
        ].includes(c.type) &&
        c.name !== 'width' &&
        c.name !== 'height'
    );

    // Only check values for controls that are actually rendered
    for (const control of settingsControls) {
      const prevValue = prevProps.values[control.name] ?? control.defaultValue;
      const nextValue = nextProps.values[control.name] ?? control.defaultValue;

      // Use deep equality for all values
      if (!deepEqual(prevValue, nextValue)) {
        if (prevProps.debug || nextProps.debug) {
          console.log(
            `[SettingsPanel] Re-rendering due to value change for "${control.name}":`,
            prevValue,
            '→',
            nextValue
          );
        }
        return false;
      }
    }

    if (prevProps.debug || nextProps.debug) {
      console.log('[SettingsPanel] Skipping re-render - no relevant changes detected');
    }
    return true;
  }
);
