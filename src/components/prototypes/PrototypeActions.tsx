import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  FileCopy as DuplicateIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Code as ViewCodeIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Prototype, PrototypeStatus } from '../../types/prototype';

interface PrototypeActionsProps {
  prototype: Prototype;
  onEdit: (prototype: Prototype) => void;
  onDuplicate: (prototype: Prototype, newName: string) => void;
  onDelete: (prototype: Prototype) => void;
  onExport: (prototype: Prototype) => void;
  onStatusChange: (prototype: Prototype, status: PrototypeStatus) => void;
  onShare: (prototype: Prototype) => void;
}

interface DuplicateDialogProps {
  open: boolean;
  prototype: Prototype | null;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

const DuplicateDialog: React.FC<DuplicateDialogProps> = ({
  open,
  prototype,
  onClose,
  onConfirm,
}) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open && prototype) {
      setNewName(`${prototype.name} (Copy)`);
      setError('');
    }
  }, [open, prototype]);

  const handleConfirm = () => {
    if (!newName.trim()) {
      setError('Name is required');
      return;
    }
    
    if (newName.trim().length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }

    onConfirm(newName.trim());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          Duplicate Prototype
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Create a copy of "{prototype?.name}" with a new name.
          </Typography>
          
          <TextField
            label="New Name"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError('');
            }}
            error={Boolean(error)}
            helperText={error}
            fullWidth
            autoFocus
          />

          {prototype && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Original Prototype Details:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Schema Type:</strong> {prototype.schema.type}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {prototype.metadata.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(prototype.metadata.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          Create Copy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface DeleteDialogProps {
  open: boolean;
  prototype: Prototype | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  prototype,
  onClose,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const expectedText = prototype?.name || '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          Delete Prototype
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning">
            <Typography variant="body2">
              This action cannot be undone. This will permanently delete the prototype
              and all its configuration data.
            </Typography>
          </Alert>

          <Typography variant="body2">
            To confirm deletion, please type the prototype name exactly as it appears:
          </Typography>
          
          <Typography variant="body1" fontWeight="bold" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            {expectedText}
          </Typography>

          <TextField
            label="Confirm prototype name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            fullWidth
            placeholder={expectedText}
            error={confirmText !== expectedText && confirmText.length > 0}
            helperText={
              confirmText !== expectedText && confirmText.length > 0
                ? 'Name does not match'
                : ''
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={confirmText !== expectedText}
        >
          Delete Prototype
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const PrototypeActions: React.FC<PrototypeActionsProps> = ({
  prototype,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  onStatusChange,
  onShare,
}) => {
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDuplicateConfirm = (newName: string) => {
    onDuplicate(prototype, newName);
  };

  const handleDeleteConfirm = () => {
    onDelete(prototype);
    setDeleteDialogOpen(false);
  };

  const canArchive = prototype.metadata.status !== 'archived';
  const canUnarchive = prototype.metadata.status === 'archived';
  const canShare = prototype.metadata.status !== 'archived';

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Prototype Actions
          </Typography>

          <Stack spacing={2}>
            {/* Primary Actions */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Primary Actions
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  startIcon={<EditIcon />}
                  variant="contained"
                  onClick={() => onEdit(prototype)}
                >
                  Edit Configuration
                </Button>
                
                <Button
                  startIcon={<DuplicateIcon />}
                  variant="outlined"
                  onClick={() => setDuplicateDialogOpen(true)}
                >
                  Duplicate
                </Button>
                
                <Button
                  startIcon={<ExportIcon />}
                  variant="outlined"
                  onClick={() => onExport(prototype)}
                >
                  Export JSON
                </Button>
              </Stack>
            </Stack>

            <Divider />

            {/* Status Actions */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Status Management
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {canShare && (
                  <Button
                    startIcon={<ShareIcon />}
                    variant="outlined"
                    color="info"
                    onClick={() => onShare(prototype)}
                    disabled={prototype.metadata.status === 'shared'}
                  >
                    {prototype.metadata.status === 'shared' ? 'Shared' : 'Share'}
                  </Button>
                )}
                
                {canArchive && (
                  <Button
                    startIcon={<ArchiveIcon />}
                    variant="outlined"
                    color="warning"
                    onClick={() => onStatusChange(prototype, 'archived')}
                  >
                    Archive
                  </Button>
                )}
                
                {canUnarchive && (
                  <Button
                    startIcon={<UnarchiveIcon />}
                    variant="outlined"
                    color="success"
                    onClick={() => onStatusChange(prototype, 'active')}
                  >
                    Restore
                  </Button>
                )}
              </Stack>
            </Stack>

            <Divider />

            {/* Advanced Actions */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Advanced
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Tooltip title="View generated code (Coming Soon)">
                  <Button
                    startIcon={<ViewCodeIcon />}
                    variant="outlined"
                    disabled
                  >
                    View Code
                  </Button>
                </Tooltip>
                
                <Tooltip title="Version history (Coming Soon)">
                  <Button
                    startIcon={<HistoryIcon />}
                    variant="outlined"
                    disabled
                  >
                    History
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>

            <Divider />

            {/* Danger Zone */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="error.main">
                Danger Zone
              </Typography>
              
              <Button
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Prototype
              </Button>
            </Stack>
          </Stack>

          {/* Current Status */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Status
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={prototype.metadata.status}
                color={
                  prototype.metadata.status === 'active' ? 'success' :
                  prototype.metadata.status === 'shared' ? 'info' :
                  prototype.metadata.status === 'archived' ? 'warning' :
                  'default'
                }
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Version {prototype.metadata.version}
              </Typography>
            </Stack>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Last modified: {new Date(prototype.metadata.updatedAt).toLocaleString()}
            </Typography>
            
            {prototype.metadata.viewCount && prototype.metadata.viewCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                Views: {prototype.metadata.viewCount}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DuplicateDialog
        open={duplicateDialogOpen}
        prototype={prototype}
        onClose={() => setDuplicateDialogOpen(false)}
        onConfirm={handleDuplicateConfirm}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        prototype={prototype}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};