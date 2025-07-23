import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  DensitySmall as CompactIcon,
  DensityMedium as ComfortableIcon,
  DensityLarge as SpaciousIcon,
} from '@mui/icons-material';
import { Navigation } from './Navigation';
import { AIDesignModeToggle } from '../AIDesignMode/AIDesignModeToggle';
import { DensityMode } from '../../contexts/DensityModeContext';

interface ResponsiveLayoutProps {
  toggleColorMode: () => void;
  isDarkMode: boolean;
  toggleDensity: () => void;
  density: DensityMode;
}

const DRAWER_WIDTH = 240;

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  toggleColorMode, 
  isDarkMode,
  toggleDensity,
  density 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MUI Pattern Generator
          </Typography>
          <AIDesignModeToggle variant="icon" />
          <Tooltip title={`Density: ${density}`}>
            <IconButton
              color="inherit"
              onClick={toggleDensity}
              aria-label="toggle density mode"
              sx={{ mr: 1 }}
            >
              {density === 'compact' ? (
                <CompactIcon />
              ) : density === 'spacious' ? (
                <SpaciousIcon />
              ) : (
                <ComfortableIcon />
              )}
            </IconButton>
          </Tooltip>
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            aria-label="toggle dark mode"
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
          >
            <Navigation onItemClick={() => setMobileOpen(false)} />
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
            open
          >
            <Navigation />
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { 
            xs: density === 'compact' ? 1.5 : density === 'spacious' ? 3 : 2, 
            sm: density === 'compact' ? 2 : density === 'spacious' ? 4 : 3 
          },
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};