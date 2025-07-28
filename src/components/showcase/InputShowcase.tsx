import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  Slider,
  Rating,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useDensitySpacing } from '../../contexts/DensityModeContext';

export const InputShowcase: React.FC = () => {
  const [radioValue, setRadioValue] = React.useState('option1');
  const [selectValue, setSelectValue] = React.useState('');
  const [sliderValue, setSliderValue] = React.useState(30);
  const [toggleValue, setToggleValue] = React.useState('left');
  const [ratingValue, setRatingValue] = React.useState(3);

  const { gapNormal, paddingNormal, gapDense } = useDensitySpacing();

  const autocompleteOptions = ['Option 1', 'Option 2', 'Option 3'];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Input Components
      </Typography>

      <Grid container spacing={gapNormal}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: paddingNormal }}>
            <Typography variant="h6" gutterBottom>
              Text Fields
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: gapDense }}>
              <TextField label="Standard" variant="standard" />
              <TextField label="Outlined" variant="outlined" />
              <TextField label="Filled" variant="filled" />
              <TextField label="Disabled" disabled />
              <TextField label="With Helper Text" helperText="Some helpful text" />
              <TextField label="Error" error helperText="Error message" />
              <TextField label="Multiline" multiline rows={4} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: paddingNormal }}>
            <Typography variant="h6" gutterBottom>
              Buttons
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: gapDense }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="text">Text</Button>
                <Button variant="contained">Contained</Button>
                <Button variant="outlined">Outlined</Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="contained" color="primary">
                  Primary
                </Button>
                <Button variant="contained" color="secondary">
                  Secondary
                </Button>
                <Button variant="contained" color="error">
                  Error
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small">Small</Button>
                <Button size="medium">Medium</Button>
                <Button size="large">Large</Button>
              </Box>
              <Box>
                <Button variant="contained" startIcon={<SendIcon />}>
                  With Icon
                </Button>
              </Box>
              <ButtonGroup variant="contained">
                <Button>One</Button>
                <Button>Two</Button>
                <Button>Three</Button>
              </ButtonGroup>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: paddingNormal }}>
            <Typography variant="h6" gutterBottom>
              Selection Controls
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: gapDense }}>
              <Box>
                <FormControlLabel control={<Checkbox defaultChecked />} label="Checkbox" />
                <FormControlLabel control={<Checkbox />} label="Unchecked" />
                <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
              </Box>

              <FormControl>
                <FormLabel>Radio Group</FormLabel>
                <RadioGroup value={radioValue} onChange={(e) => setRadioValue(e.target.value)}>
                  <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
                  <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
                  <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
                </RadioGroup>
              </FormControl>

              <Box>
                <FormControlLabel control={<Switch defaultChecked />} label="Switch On" />
                <FormControlLabel control={<Switch />} label="Switch Off" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: paddingNormal }}>
            <Typography variant="h6" gutterBottom>
              Select & Autocomplete
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: gapDense }}>
              <FormControl fullWidth>
                <InputLabel>Select</InputLabel>
                <Select
                  value={selectValue}
                  label="Select"
                  onChange={(e) => setSelectValue(e.target.value)}
                >
                  <MenuItem value={10}>Option 1</MenuItem>
                  <MenuItem value={20}>Option 2</MenuItem>
                  <MenuItem value={30}>Option 3</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                options={autocompleteOptions}
                renderInput={(params) => <TextField {...params} label="Autocomplete" />}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: paddingNormal }}>
            <Typography variant="h6" gutterBottom>
              Slider & Rating
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: gapNormal }}>
              <Box>
                <Typography gutterBottom>Slider</Typography>
                <Slider
                  value={sliderValue}
                  onChange={(_, value) => setSliderValue(value as number)}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography gutterBottom>Rating</Typography>
                <Rating value={ratingValue} onChange={(_, value) => setRatingValue(value || 0)} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: paddingNormal }}>
            <Typography variant="h6" gutterBottom>
              Toggle Buttons
            </Typography>
            <ToggleButtonGroup
              value={toggleValue}
              exclusive
              onChange={(_, value) => value && setToggleValue(value)}
            >
              <ToggleButton value="left">Left</ToggleButton>
              <ToggleButton value="center">Center</ToggleButton>
              <ToggleButton value="right">Right</ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
