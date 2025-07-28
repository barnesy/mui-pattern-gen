import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Button,
  useTheme,
} from '@mui/material';
import { MoreVert as MoreVertIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { ComponentInstance } from '../../contexts/DesignSystemContext';
import { SpacingConfig, getSpacingValue } from '../../types/PatternVariant';

export interface PureDataDisplayCardProps {
  title: string;
  subtitle?: string;
  showHeader?: boolean;
  showDivider?: boolean;
  showSubheader?: boolean;
  showMenuItems?: boolean;
  showAction?: boolean;
  demoDataType?: string;
  width?: { mode: 'auto' | '100%' | 'custom'; customValue?: number; unit?: 'px' | '%' };
  height?: { mode: 'auto' | '100%' | 'custom'; customValue?: number; unit?: 'px' | '%' };
  padding?: SpacingConfig;
  margin?: SpacingConfig;
  titleVariant?: string;
  subtitleVariant?: string;

  // For rendering children (sub-components)
  children?: React.ReactNode;

  // For managing sub-components
  onCreateSubComponent?: (type: string, props: any) => void;
  childInstances?: ComponentInstance[];
}

/**
 * Pure React version of DataDisplayCard that supports nested components
 */
export const PureDataDisplayCard: React.FC<PureDataDisplayCardProps> = ({
  title = 'Data Display',
  subtitle = 'Information panel',
  showHeader = true,
  showDivider = true,
  showSubheader = true,
  showMenuItems = true,
  showAction = false,
  width,
  height,
  padding,
  margin,
  titleVariant = 'h6',
  subtitleVariant = 'body2',
  children,
  onCreateSubComponent,
  childInstances = [],
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Get default padding
  const defaultPadding = { top: 16, right: 16, bottom: 16, left: 16 };
  const effectivePadding = padding || defaultPadding;

  // Generate demo menu items if needed
  const menuItems = showMenuItems
    ? [
        { label: 'Export Data', onClick: () => console.log('Export clicked') },
        { label: 'Share', onClick: () => console.log('Share clicked') },
        { label: 'Settings', onClick: () => console.log('Settings clicked') },
      ]
    : [];

  // Generate demo action if needed
  const action = showAction ? (
    <Button size="small" startIcon={<ArrowForwardIcon />}>
      View All
    </Button>
  ) : null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Calculate size styles
  const getSizeValue = (size?: { mode: string; customValue?: number; unit?: string }) => {
    if (!size) {return 'auto';}
    if (size.mode === 'auto') {return 'auto';}
    if (size.mode === '100%') {return '100%';}
    if (size.mode === 'custom' && size.customValue) {
      return `${size.customValue}${size.unit || 'px'}`;
    }
    return 'auto';
  };

  // Demo sub-components if no children
  const hasChildren = React.Children.count(children) > 0 || childInstances.length > 0;

  // Add demo sub-components button
  const addSubComponentButton = onCreateSubComponent && (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button
          size="small"
          variant="outlined"
          onClick={() =>
            onCreateSubComponent('LabelValuePair', {
              label: 'Metric',
              value: '1,234',
              variant: 'default',
            })
          }
        >
          Add Label-Value
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() =>
            onCreateSubComponent('LabelValuePair', {
              label: 'Growth',
              value: '+12.5%',
              variant: 'stacked',
              valueColor: 'success',
              showTrend: true,
              trend: 'up',
            })
          }
        >
          Add Stat
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Card
      elevation={1}
      sx={{
        width: getSizeValue(width),
        height: getSizeValue(height),
        display: 'flex',
        flexDirection: 'column',
        margin: margin ? getSpacingValue(margin) : undefined,
      }}
    >
      {showHeader && (
        <CardHeader
          title={title}
          titleTypographyProps={{ variant: titleVariant as any }}
          subheader={showSubheader ? subtitle : undefined}
          subheaderTypographyProps={{ variant: subtitleVariant as any }}
          action={
            <Stack direction="row" spacing={1}>
              {action}
              {menuItems.length > 0 && (
                <>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    {menuItems.map((item, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          item.onClick();
                          handleMenuClose();
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Stack>
          }
          sx={{
            '& .MuiCardHeader-action': {
              alignSelf: 'center',
            },
          }}
        />
      )}

      {showHeader && showDivider && <Divider />}

      <CardContent
        sx={{
          p: getSpacingValue(effectivePadding),
          flex: height ? 1 : 'none',
          overflow: 'auto',
          '&:last-child': {
            pb: effectivePadding.bottom + 'px',
          },
        }}
      >
        {!hasChildren ? (
          <Box>
            <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
              No data components added yet
            </Typography>
            {addSubComponentButton}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: childInstances.length > 2 ? 'repeat(2, 1fr)' : '1fr',
                md:
                  childInstances.length > 3
                    ? 'repeat(3, 1fr)'
                    : childInstances.length > 2
                      ? 'repeat(2, 1fr)'
                      : '1fr',
              },
              gap: 2,
            }}
          >
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
