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
  AccountBalance as AccountBalanceIcon,
  DataObject as DataObjectIcon,
  Architecture as ArchitectureIcon,
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
  { text: 'Schema Demo', path: '/schema-demo', icon: <DataObjectIcon /> },
  { text: 'Design System', path: '/design-system', icon: <ArchitectureIcon /> },
  { text: 'Dashboard Example', path: '/dashboard-example', icon: <AnalyticsIcon /> },
  { text: 'Gov Procurement', path: '/gov-procurement', icon: <AccountBalanceIcon /> },
  { text: 'Sub-Component Test', path: '/subcomponent-test', icon: <ViewModuleIcon /> },
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
