import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

export const SurfaceShowcase: React.FC = () => {
  const [expanded, setExpanded] = React.useState<string | false>('panel1');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const imageData = [
    { id: 1, img: 'https://placehold.co/400x300/1976d2/white?text=Image+1', title: 'Image 1' },
    { id: 2, img: 'https://placehold.co/400x300/dc004e/white?text=Image+2', title: 'Image 2' },
    { id: 3, img: 'https://placehold.co/400x300/4caf50/white?text=Image+3', title: 'Image 3' },
    { id: 4, img: 'https://placehold.co/400x300/ff9800/white?text=Image+4', title: 'Image 4' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Surface Components
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Paper Elevations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <Typography>Elevation 0</Typography>
              </Paper>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography>Elevation 1 (default)</Typography>
              </Paper>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography>Elevation 3</Typography>
              </Paper>
              <Paper elevation={6} sx={{ p: 2 }}>
                <Typography>Elevation 6</Typography>
              </Paper>
              <Paper elevation={12} sx={{ p: 2 }}>
                <Typography>Elevation 12</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography>Outlined variant</Typography>
              </Paper>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Cards
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Simple Card
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Subtitle
                  </Typography>
                  <Typography variant="body2">
                    This is a simple card with text content only.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://placehold.co/400x140/1976d2/white?text=Card+Image"
                  alt="placeholder"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Card with Media
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This card includes an image at the top. Great for showcasing visual content.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Share</Button>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Accordion
            </Typography>
            <Box>
              <Accordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Accordion 1</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Accordion 2</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Accordion 3</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Image List
            </Typography>
            <ImageList 
              sx={{ width: '100%', height: { xs: 300, sm: 450 } }} 
              cols={isMobile ? 2 : 3}
            >
              {imageData.map((item) => (
                <ImageListItem key={item.id}>
                  <img
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <ImageListItemBar
                    title={item.title}
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        aria-label={`info about ${item.title}`}
                      >
                        <InfoIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};