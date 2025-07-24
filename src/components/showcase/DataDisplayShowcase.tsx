import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  AvatarGroup,
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Star as StarIcon,
  Info as InfoIcon,
  Folder as FolderIcon,
  Mail as MailIcon,
} from '@mui/icons-material';

export const DataDisplayShowcase: React.FC = () => {
  const tableData = [
    { id: 1, name: 'John Doe', role: 'Developer', status: 'Active' },
    { id: 2, name: 'Jane Smith', role: 'Designer', status: 'Active' },
    { id: 3, name: 'Bob Johnson', role: 'Manager', status: 'Inactive' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Data Display Components
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Typography
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="h1">h1. Heading</Typography>
              <Typography variant="h2">h2. Heading</Typography>
              <Typography variant="h3">h3. Heading</Typography>
              <Typography variant="h4">h4. Heading</Typography>
              <Typography variant="h5">h5. Heading</Typography>
              <Typography variant="h6">h6. Heading</Typography>
              <Typography variant="subtitle1">subtitle1. Lorem ipsum dolor sit amet</Typography>
              <Typography variant="subtitle2">subtitle2. Lorem ipsum dolor sit amet</Typography>
              <Typography variant="body1">body1. Lorem ipsum dolor sit amet</Typography>
              <Typography variant="body2">body2. Lorem ipsum dolor sit amet</Typography>
              <Typography variant="caption">caption text</Typography>
              <Typography variant="overline">overline text</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Avatars & Badges
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar>A</Avatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>B</Avatar>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>C</Avatar>
                <Avatar src="/broken-image.jpg" />
              </Box>
              
              <AvatarGroup max={4}>
                <Avatar>A</Avatar>
                <Avatar>B</Avatar>
                <Avatar>C</Avatar>
                <Avatar>D</Avatar>
                <Avatar>E</Avatar>
              </AvatarGroup>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Badge badgeContent={4} color="primary">
                  <MailIcon />
                </Badge>
                <Badge badgeContent={10} color="secondary">
                  <MailIcon />
                </Badge>
                <Badge variant="dot" color="error">
                  <MailIcon />
                </Badge>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Chips
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Basic" />
              <Chip label="Outlined" variant="outlined" />
              <Chip label="Clickable" onClick={() => {}} />
              <Chip label="Deletable" onDelete={() => {}} />
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
              <Chip label="With Icon" icon={<StarIcon />} />
              <Chip label="Small" size="small" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Lists
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText primary="List item 1" secondary="Secondary text" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>A</Avatar>
                </ListItemAvatar>
                <ListItemText primary="List item 2" secondary="With avatar" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="List item 3" secondary="Simple item" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Table
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={row.status === 'Active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Tooltips
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Delete">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add" placement="top">
                <Button variant="contained">Top</Button>
              </Tooltip>
              <Tooltip title="Add" placement="bottom">
                <Button variant="contained">Bottom</Button>
              </Tooltip>
              <Tooltip title="Add" placement="left">
                <Button variant="contained">Left</Button>
              </Tooltip>
              <Tooltip title="Add" placement="right">
                <Button variant="contained">Right</Button>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

import { Button } from '@mui/material';