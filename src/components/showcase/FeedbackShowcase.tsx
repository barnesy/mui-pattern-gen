import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  AlertTitle,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Backdrop,
} from '@mui/material';

export const FeedbackShowcase: React.FC = () => {
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openBackdrop, setOpenBackdrop] = React.useState(false);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Feedback Components
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Alerts
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="error">This is an error alert!</Alert>
              <Alert severity="warning">This is a warning alert!</Alert>
              <Alert severity="info">This is an info alert!</Alert>
              <Alert severity="success">This is a success alert!</Alert>

              <Alert severity="error" variant="outlined">
                This is an outlined error alert!
              </Alert>

              <Alert severity="info" variant="filled">
                This is a filled info alert!
              </Alert>

              <Alert severity="warning" onClose={() => {}}>
                This alert can be closed!
              </Alert>

              <Alert severity="success">
                <AlertTitle>Success</AlertTitle>
                This is a success alert with a title!
              </Alert>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Progress
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Circular Progress
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <CircularProgress />
                  <CircularProgress color="secondary" />
                  <CircularProgress size={30} />
                  <CircularProgress variant="determinate" value={75} />
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Linear Progress
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <LinearProgress />
                  <LinearProgress color="secondary" />
                  <LinearProgress variant="determinate" value={50} />
                  <LinearProgress variant="buffer" value={60} valueBuffer={80} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Skeleton
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="text" />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rounded" height={60} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Snackbar
            </Typography>
            <Button variant="contained" onClick={() => setOpenSnackbar(true)}>
              Open Snackbar
            </Button>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenSnackbar(false)}
              message="This is a snackbar message"
              action={
                <Button color="inherit" size="small" onClick={() => setOpenSnackbar(false)}>
                  UNDO
                </Button>
              }
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Dialog
            </Typography>
            <Button variant="contained" onClick={() => setOpenDialog(true)}>
              Open Dialog
            </Button>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This is a dialog with some content. You can add any content here.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={() => setOpenDialog(false)} variant="contained">
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Backdrop
            </Typography>
            <Button variant="contained" onClick={() => setOpenBackdrop(true)}>
              Open Backdrop
            </Button>
            <Backdrop
              sx={{
                color: (theme) => theme.palette.common.white,
                zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
              open={openBackdrop}
              onClick={() => setOpenBackdrop(false)}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
