import React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import { InputShowcase } from '../components/showcase/InputShowcase';
import { DataDisplayShowcase } from '../components/showcase/DataDisplayShowcase';
import { FeedbackShowcase } from '../components/showcase/FeedbackShowcase';
import { NavigationShowcase } from '../components/showcase/NavigationShowcase';
import { SurfaceShowcase } from '../components/showcase/SurfaceShowcase';
import { TailwindMUIBestPractices } from '../components/showcase/TailwindMUIBestPractices';
import { BorderRadiusDebug } from '../components/showcase/BorderRadiusDebug';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`component-tabpanel-${index}`}
      aria-labelledby={`component-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ComponentShowcase: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Foundation Components
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Various variants, states, and configurations organized by category
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="component categories"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: { xs: 'auto', sm: 90 },
              px: { xs: 2, sm: 3 },
            }
          }}
        >
          <Tab label="Inputs" />
          <Tab label="Data Display" />
          <Tab label="Feedback" />
          <Tab label="Navigation" />
          <Tab label="Surfaces" />
          <Tab label="Tailwind CSS" />
          <Tab label="Border Radius" />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <InputShowcase />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <DataDisplayShowcase />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <FeedbackShowcase />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <NavigationShowcase />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <SurfaceShowcase />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <TailwindMUIBestPractices />
      </TabPanel>
      <TabPanel value={value} index={6}>
        <BorderRadiusDebug />
      </TabPanel>
    </Box>
  );
};