import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Palette as PaletteIcon,
  ViewModule as ViewModuleIcon,
  AddBox as AddBoxIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

interface NavigationItem {
  text: string;
  path: string;
  icon: React.ReactElement;
}

interface NavigationProps {
  onItemClick?: () => void;
}

const navigationItems: NavigationItem[] = [
  { text: 'Home', path: '/', icon: <HomeIcon /> },
  { text: 'Theme', path: '/theme', icon: <PaletteIcon /> },
  { text: 'Components', path: '/components', icon: <DashboardIcon /> },
  { text: 'Pattern Generator', path: '/pattern-generator', icon: <AddBoxIcon /> },
  { text: 'Pattern Library', path: '/patterns', icon: <ViewModuleIcon /> },
  { text: 'Dashboard Example', path: '/dashboard-example', icon: <AnalyticsIcon /> },
];

export const Navigation: React.FC<NavigationProps> = ({ onItemClick }) => {
  const location = useLocation();

  return (
    <Box>
      <Toolbar /> {/* Spacer for app bar */}
      <List>
      {navigationItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={onItemClick}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
      </List>
    </Box>
  );
};