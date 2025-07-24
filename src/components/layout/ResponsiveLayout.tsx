import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Drawer,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ViewSidebar as SidebarIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  DensitySmall as CompactIcon,
  DensityMedium as ComfortableIcon,
  DensityLarge as SpaciousIcon,
} from '@mui/icons-material';
import { Navigation } from './Navigation';
import { AIDesignModeToggle } from '../AIDesignMode/AIDesignModeToggle';
import { AIDesignModeDrawer } from '../AIDesignMode/AIDesignModeDrawer';
import { DensityMode } from '../../contexts/DensityModeContext';
import { useAIDesignMode } from '../../contexts/AIDesignModeContext';

interface ResponsiveLayoutProps {
  toggleColorMode: () => void;
  isDarkMode: boolean;
  toggleDensity: () => void;
  density: DensityMode;
}

const LEFT_DRAWER_WIDTH = 240;
const RIGHT_DRAWER_WIDTH = 320;

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  toggleColorMode, 
  isDarkMode,
  toggleDensity,
  density 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isEnabled: isAIMode } = useAIDesignMode();
  
  // Drawer states
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  // Load drawer states from localStorage
  useEffect(() => {
    const savedLeftOpen = localStorage.getItem('left-drawer-open');
    const savedRightOpen = localStorage.getItem('right-drawer-open');
    
    if (savedLeftOpen !== null) {
      setLeftDrawerOpen(savedLeftOpen === 'true');
    }
    if (savedRightOpen !== null) {
      setRightDrawerOpen(savedRightOpen === 'true');
    }
  }, []);

  // Save drawer states
  useEffect(() => {
    localStorage.setItem('left-drawer-open', leftDrawerOpen.toString());
  }, [leftDrawerOpen]);

  useEffect(() => {
    localStorage.setItem('right-drawer-open', rightDrawerOpen.toString());
  }, [rightDrawerOpen]);

  // Auto-open right drawer when AI mode is enabled
  useEffect(() => {
    if (isAIMode && !rightDrawerOpen) {
      setRightDrawerOpen(true);
    }
  }, [isAIMode]);

  const toggleLeftDrawer = () => {
    setLeftDrawerOpen(!leftDrawerOpen);
  };

  const toggleRightDrawer = () => {
    setRightDrawerOpen(!rightDrawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle left drawer"
            edge="start"
            onClick={toggleLeftDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MUI Pattern Generator
          </Typography>
          <IconButton
            color="inherit"
            aria-label="toggle right drawer"
            onClick={toggleRightDrawer}
            sx={{ mr: 1 }}
          >
            <SidebarIcon sx={{ transform: 'scaleX(-1)' }} />
          </IconButton>
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
      {/* Left Drawer - Navigation */}
      <Drawer
        variant="permanent"
        open={leftDrawerOpen}
        sx={{
          width: leftDrawerOpen ? LEFT_DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: leftDrawerOpen ? LEFT_DRAWER_WIDTH : 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          },
        }}
      >
        <Navigation onItemClick={isMobile ? toggleLeftDrawer : undefined} />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: density === 'compact' ? 2 : density === 'spacious' ? 4 : 3,
          bgcolor: 'background.default',
          color: 'text.primary',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Right Drawer - AI Design Mode */}
      <Drawer
        variant="permanent"
        anchor="right"
        open={rightDrawerOpen && isAIMode}
        sx={{
          width: rightDrawerOpen && isAIMode ? RIGHT_DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: rightDrawerOpen && isAIMode ? RIGHT_DRAWER_WIDTH : 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          },
        }}
      >
        <Box sx={{ height: '100%' }}>
          <AIDesignModeDrawer />
        </Box>
      </Drawer>
    </Box>
  );
};