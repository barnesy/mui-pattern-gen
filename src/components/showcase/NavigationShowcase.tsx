import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Stepper,
  Step,
  StepLabel,
  Pagination,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  Restore as RestoreIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

export const NavigationShowcase: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [bottomNavValue, setBottomNavValue] = React.useState(0);
  const [activeStep, setActiveStep] = React.useState(0);

  const speedDialActions = [
    { icon: <SaveIcon />, name: 'Save' },
    { icon: <PrintIcon />, name: 'Print' },
    { icon: <ShareIcon />, name: 'Share' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Navigation Components
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 0 }}>
            <Typography variant="h6" sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
              App Bar with Tabs
            </Typography>
            <AppBar position="static" color="default">
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  App Title
                </Typography>
                <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
                  <Tab label="Tab 1" />
                  <Tab label="Tab 2" />
                  <Tab label="Tab 3" />
                </Tabs>
              </Toolbar>
            </AppBar>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Breadcrumbs
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Breadcrumbs>
                <Link underline="hover" color="inherit" href="#">
                  Home
                </Link>
                <Link underline="hover" color="inherit" href="#">
                  Catalog
                </Link>
                <Typography color="text.primary">Products</Typography>
              </Breadcrumbs>
              
              <Breadcrumbs separator="›">
                <Link underline="hover" color="inherit" href="#">
                  MUI
                </Link>
                <Link underline="hover" color="inherit" href="#">
                  Core
                </Link>
                <Typography color="text.primary">Breadcrumbs</Typography>
              </Breadcrumbs>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Drawer
            </Typography>
            <Button variant="contained" onClick={() => setDrawerOpen(true)}>
              Open Drawer
            </Button>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              <Box sx={{ width: 250, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Drawer Content
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Item 1" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Item 2" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Item 3" />
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Menu
            </Typography>
            <Button
              variant="contained"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Open Menu
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)}>My account</MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)}>Logout</MenuItem>
            </Menu>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Bottom Navigation
            </Typography>
            <BottomNavigation
              value={bottomNavValue}
              onChange={(_, value) => setBottomNavValue(value)}
              showLabels
            >
              <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
              <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
              <BottomNavigationAction label="Nearby" icon={<LocationIcon />} />
            </BottomNavigation>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Stepper
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              <Step>
                <StepLabel>Step 1</StepLabel>
              </Step>
              <Step>
                <StepLabel>Step 2</StepLabel>
              </Step>
              <Step>
                <StepLabel>Step 3</StepLabel>
              </Step>
            </Stepper>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(activeStep - 1)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                disabled={activeStep === 2}
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Pagination
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Pagination count={10} />
              <Pagination count={10} color="primary" />
              <Pagination count={10} variant="outlined" />
              <Pagination count={10} shape="rounded" />
              <Pagination count={10} size="small" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: 320, position: 'relative' }}>
            <Typography variant="h6" gutterBottom>
              Speed Dial
            </Typography>
            <SpeedDial
              ariaLabel="SpeedDial example"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon openIcon={<EditIcon />} />}
            >
              {speedDialActions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                />
              ))}
            </SpeedDial>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};