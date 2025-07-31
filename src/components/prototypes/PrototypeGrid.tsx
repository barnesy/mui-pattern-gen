import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Visibility as PreviewIcon,
  Edit as EditIcon,
  FileCopy as DuplicateIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreVertIcon,
  Schema as SchemaIcon,
  AccountTree as ComponentIcon,
  Storage as DatabaseIcon,
  Apps as ApplicationIcon,
  Extension as CustomIcon,
} from '@mui/icons-material';
import { Prototype, SchemaType } from '../../types/prototype';

interface PrototypeGridProps {
  prototypes: Prototype[];
  viewMode: 'grid' | 'list';
  onPreview: (prototype: Prototype) => void;
  onEdit: (prototype: Prototype) => void;
  onDuplicate: (prototype: Prototype) => void;
  onDelete: (prototype: Prototype) => void;
  onExport: (prototype: Prototype) => void;
}

const schemaTypeIcons: Record<SchemaType, React.ReactElement> = {
  component: <ComponentIcon />,
  dbml: <DatabaseIcon />,
  application: <ApplicationIcon />,
  custom: <CustomIcon />,
};

const schemaTypeColors: Record<SchemaType, string> = {
  component: '#1976d2',
  dbml: '#9c27b0',
  application: '#2e7d32',
  custom: '#ed6c02',
};

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  active: 'success',
  shared: 'info',
  archived: 'warning',
};

interface PrototypeCardProps {
  prototype: Prototype;
  onPreview: (prototype: Prototype) => void;
  onEdit: (prototype: Prototype) => void;
  onDuplicate: (prototype: Prototype) => void;
  onDelete: (prototype: Prototype) => void;
  onExport: (prototype: Prototype) => void;
}

const PrototypeCard: React.FC<PrototypeCardProps> = ({
  prototype,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
}) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: schemaTypeColors[prototype.schema.type],
            }}
          >
            {schemaTypeIcons[prototype.schema.type]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h3" noWrap>
              {prototype.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {prototype.schema.type}
            </Typography>
          </Box>
          <Chip
            label={prototype.metadata.status}
            color={statusColors[prototype.metadata.status]}
            size="small"
          />
        </Stack>

        {prototype.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {prototype.description}
          </Typography>
        )}

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Created: {formatDate(prototype.metadata.createdAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Modified: {formatDate(prototype.metadata.updatedAt)}
          </Typography>
          {prototype.metadata.viewCount && prototype.metadata.viewCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              Views: {prototype.metadata.viewCount}
            </Typography>
          )}
        </Stack>

        {prototype.metadata.tags && prototype.metadata.tags.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
            {prototype.metadata.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
            {prototype.metadata.tags.length > 3 && (
              <Chip label={`+${prototype.metadata.tags.length - 3}`} size="small" variant="outlined" />
            )}
          </Stack>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Preview">
            <IconButton size="small" onClick={() => onPreview(prototype)}>
              <PreviewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(prototype)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <div>
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => { onDuplicate(prototype); setMenuAnchor(null); }}>
              <DuplicateIcon sx={{ mr: 1 }} fontSize="small" />
              Duplicate
            </MenuItem>
            <MenuItem onClick={() => { onExport(prototype); setMenuAnchor(null); }}>
              <ExportIcon sx={{ mr: 1 }} fontSize="small" />
              Export
            </MenuItem>
            <MenuItem 
              onClick={() => { onDelete(prototype); setMenuAnchor(null); }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
              Delete
            </MenuItem>
          </Menu>
        </div>
      </CardActions>
    </Card>
  );
};

interface PrototypeListItemProps {
  prototype: Prototype;
  onPreview: (prototype: Prototype) => void;
  onEdit: (prototype: Prototype) => void;
  onDuplicate: (prototype: Prototype) => void;
  onDelete: (prototype: Prototype) => void;
  onExport: (prototype: Prototype) => void;
}

const PrototypeListItem: React.FC<PrototypeListItemProps> = ({
  prototype,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
}) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <ListItem
      divider
      sx={{
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: schemaTypeColors[prototype.schema.type],
          mr: 2,
        }}
      >
        {schemaTypeIcons[prototype.schema.type]}
      </Avatar>
      
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" component="span">
              {prototype.name}
            </Typography>
            <Chip
              label={prototype.metadata.status}
              color={statusColors[prototype.metadata.status]}
              size="small"
            />
            <Chip
              label={prototype.schema.type}
              variant="outlined"
              size="small"
            />
          </Stack>
        }
        secondary={
          <Stack spacing={0.5}>
            {prototype.description && (
              <Typography variant="body2" color="text.secondary">
                {prototype.description}
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" color="text.secondary">
                Created: {formatDate(prototype.metadata.createdAt)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Modified: {formatDate(prototype.metadata.updatedAt)}
              </Typography>
              {prototype.metadata.viewCount && prototype.metadata.viewCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Views: {prototype.metadata.viewCount}
                </Typography>
              )}
            </Stack>
            {prototype.metadata.tags && prototype.metadata.tags.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                {prototype.metadata.tags.slice(0, 5).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
                {prototype.metadata.tags.length > 5 && (
                  <Chip label={`+${prototype.metadata.tags.length - 5}`} size="small" variant="outlined" />
                )}
              </Stack>
            )}
          </Stack>
        }
      />
      
      <ListItemSecondaryAction>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Preview">
            <IconButton size="small" onClick={() => onPreview(prototype)}>
              <PreviewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(prototype)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
        </Stack>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => { onDuplicate(prototype); setMenuAnchor(null); }}>
            <DuplicateIcon sx={{ mr: 1 }} fontSize="small" />
            Duplicate
          </MenuItem>
          <MenuItem onClick={() => { onExport(prototype); setMenuAnchor(null); }}>
            <ExportIcon sx={{ mr: 1 }} fontSize="small" />
            Export
          </MenuItem>
          <MenuItem 
            onClick={() => { onDelete(prototype); setMenuAnchor(null); }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export const PrototypeGrid: React.FC<PrototypeGridProps> = ({
  prototypes,
  viewMode,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
}) => {
  if (viewMode === 'list') {
    return (
      <List>
        {prototypes.map((prototype) => (
          <PrototypeListItem
            key={prototype.id}
            prototype={prototype}
            onPreview={onPreview}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onExport={onExport}
          />
        ))}
      </List>
    );
  }

  return (
    <Grid container spacing={3}>
      {prototypes.map((prototype) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={prototype.id}>
          <PrototypeCard
            prototype={prototype}
            onPreview={onPreview}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onExport={onExport}
          />
        </Grid>
      ))}
    </Grid>
  );
};