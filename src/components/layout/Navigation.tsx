import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Palette as PaletteIcon,
  Edit as EditIcon,
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
  { text: 'Editor', path: '/theme-editor', icon: <EditIcon /> },
  { text: 'Theme', path: '/theme', icon: <PaletteIcon /> },
  { text: 'Components', path: '/components', icon: <DashboardIcon /> },
];

export const Navigation: React.FC<NavigationProps> = ({ onItemClick }) => {
  const location = useLocation();

  return (
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
  );
};