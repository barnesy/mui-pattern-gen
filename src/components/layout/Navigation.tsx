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
  Edit as EditIcon,
  ViewModule as ViewModuleIcon,
  AddBox as AddBoxIcon,
  AutoAwesome as AutoAwesomeIcon,
  Science as ScienceIcon,
  VerifiedUser as VerifiedUserIcon,
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
  { text: 'Pattern Generator', path: '/pattern-generator', icon: <AddBoxIcon /> },
  { text: 'Pattern Library', path: '/patterns', icon: <ViewModuleIcon /> },
  { text: 'Pattern AI Demo', path: '/pattern-ai-demo', icon: <AutoAwesomeIcon /> },
  { text: 'Update Test', path: '/pattern-update-test', icon: <ScienceIcon /> },
  { text: 'AI Validation', path: '/ai-validation', icon: <VerifiedUserIcon /> },
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