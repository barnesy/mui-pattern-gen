import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  SvgIcon,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InboxIcon from '@mui/icons-material/Inbox';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { SpacingConfig, getSpacingValue } from '../../types/PatternVariant';
import { TypographyVariant } from '../../types/TypographyConfig';

export interface EmptyStateCardProps {
  variant?: 'empty' | 'error' | 'no-results' | 'no-data';
  title?: string;
  description?: string;
  showIcon?: boolean;
  showAction?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  elevation?: number;
  iconSize?: 'small' | 'medium' | 'large';
  customIcon?: React.ReactNode;
  titleVariant?: TypographyVariant;
  descriptionVariant?: TypographyVariant;
  padding?: SpacingConfig;
  margin?: SpacingConfig;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  variant = 'empty',
  title = 'No items found',
  description = 'There are no items to display at this time.',
  showIcon = true,
  showAction = true,
  actionLabel = 'Add Item',
  onAction,
  elevation = 0,
  iconSize = 'medium',
  customIcon,
  titleVariant = 'h6',
  descriptionVariant = 'body2',
  padding,
  margin,
}) => {
  const theme = useTheme();

  const getIcon = () => {
    if (customIcon) return customIcon;
    
    const iconSizes = {
      small: 48,
      medium: 64,
      large: 96,
    };
    
    const size = iconSizes[iconSize];
    const iconProps = {
      sx: {
        fontSize: size,
        color: theme.palette.text.disabled,
        mb: 2,
      },
    };

    switch (variant) {
      case 'error':
        return <ErrorOutlineIcon {...iconProps} />;
      case 'no-results':
        return <SearchOffIcon {...iconProps} />;
      case 'no-data':
        return <FolderOpenIcon {...iconProps} />;
      case 'empty':
      default:
        return <InboxIcon {...iconProps} />;
    }
  };

  const getDefaultContent = () => {
    switch (variant) {
      case 'error':
        return {
          title: 'Something went wrong',
          description: 'An error occurred while loading the content. Please try again.',
          actionLabel: 'Retry',
        };
      case 'no-results':
        return {
          title: 'No results found',
          description: 'Try adjusting your search or filters to find what you\'re looking for.',
          actionLabel: 'Clear Filters',
        };
      case 'no-data':
        return {
          title: 'No data available',
          description: 'Start by adding some data to see it displayed here.',
          actionLabel: 'Add Data',
        };
      case 'empty':
      default:
        return {
          title: 'No items found',
          description: 'There are no items to display at this time.',
          actionLabel: 'Add Item',
        };
    }
  };

  const defaults = getDefaultContent();
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;
  const displayActionLabel = actionLabel || defaults.actionLabel;

  return (
    <Card
      elevation={elevation}
      sx={{
        width: '100%',
        margin: margin ? getSpacingValue(margin) : undefined,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 4,
            padding: padding ? getSpacingValue(padding) : undefined,
          }}
        >
          {showIcon && getIcon()}
          
          <Typography
            variant={titleVariant}
            component="h3"
            gutterBottom
            sx={{ mb: 1 }}
          >
            {displayTitle}
          </Typography>
          
          <Typography
            variant={descriptionVariant}
            color="text.secondary"
            sx={{ mb: showAction ? 3 : 0, maxWidth: 400 }}
          >
            {displayDescription}
          </Typography>
          
          {showAction && (
            <Button
              variant="contained"
              color="primary"
              onClick={onAction}
              size="medium"
            >
              {displayActionLabel}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};