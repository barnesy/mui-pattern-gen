import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Stack,
  Chip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

export interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'minimal' | 'transparent';
  showBreadcrumbs?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  status?: string;
  statusColor?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  metadata?: Array<{ label: string; value: string }>;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  };
  secondaryActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title = 'Page Title',
  subtitle = 'This is a page description that provides context about the content below',
  variant = 'default',
  showBreadcrumbs = true,
  breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Section', href: '/section' },
    { label: 'Current Page' },
  ],
  status,
  statusColor = 'default',
  metadata = [
    { label: 'Created', value: 'Jan 15, 2024' },
    { label: 'Modified', value: '2 hours ago' },
    { label: 'Owner', value: 'John Doe' },
  ],
  primaryAction = {
    label: 'Edit Page',
    icon: <EditIcon />,
    onClick: () => {},
  },
  secondaryActions = [
    { label: 'Share', icon: <ShareIcon />, onClick: () => {} },
    { label: 'Export', icon: <DownloadIcon />, onClick: () => {} },
  ],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const isMinimal = variant === 'minimal';
  const isTransparent = variant === 'transparent';

  const headerContent = (
    <>
      {/* Breadcrumbs */}
      {showBreadcrumbs && !isMinimal && breadcrumbs.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs
            separator={<ChevronRightIcon fontSize="small" />}
            sx={{ fontSize: '0.875rem' }}
          >
            <Link
              underline="hover"
              color="inherit"
              href="/"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
              {!isMobile && 'Home'}
            </Link>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <Typography
                  key={index}
                  color="text.primary"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={index}
                  underline="hover"
                  color="inherit"
                  href={crumb.href}
                  sx={{ fontSize: '0.875rem' }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>
      )}

      {/* Main Content */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
        justifyContent="space-between"
      >
        {/* Title Section */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              component="h1"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
            {status && (
              <Chip
                label={status}
                color={statusColor}
                size="small"
                sx={{ flexShrink: 0 }}
              />
            )}
          </Stack>

          {subtitle && !isMinimal && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Metadata */}
          {metadata.length > 0 && !isMinimal && (
            <Stack
              direction="row"
              spacing={3}
              flexWrap="wrap"
              sx={{ gap: 1 }}
            >
              {metadata.map((item, index) => (
                <Box key={index}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="span"
                  >
                    {item.label}:{' '}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="span"
                    fontWeight={500}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Actions Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            mt: { xs: 2, md: 0 },
          }}
        >
          {/* Secondary Actions */}
          {secondaryActions.length > 0 && !isMobile && (
            <>
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={action.onClick}
                  size={isTablet ? 'small' : 'medium'}
                >
                  {action.label}
                </Button>
              ))}
            </>
          )}

          {/* Primary Action */}
          {primaryAction && (
            <Button
              variant="contained"
              startIcon={primaryAction.icon}
              onClick={primaryAction.onClick}
              size={isTablet ? 'small' : 'medium'}
              fullWidth={isMobile}
            >
              {primaryAction.label}
            </Button>
          )}
        </Stack>
      </Stack>
    </>
  );

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        mb: 3,
        backgroundColor: isTransparent
          ? 'transparent'
          : theme.palette.background.default,
        borderBottom: isTransparent
          ? 'none'
          : `1px solid ${theme.palette.divider}`,
      }}
    >
      {headerContent}
    </Box>
  );
};