/**
 * Prototype Generator Page
 * UI for generating prototypes from DBML schemas using Claude Code integration
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  Switch,
  FormGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Storage as DatabaseIcon,
  ViewList as ListIcon,
  Info as DetailIcon,
  Edit as FormIcon,
  Dashboard as DashboardIcon,
  Preview as PreviewIcon,
  Download as ExportIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Code as CodeIcon
} from '@mui/icons-material';

import { 
  PrototypeGenerator,
  GenerationOptions,
  GenerationProgress,
  SubagentResponse,
  GenerationStage
} from '../services/generation/PrototypeGenerator';
import { DBMLParser, DBMLValidator } from '../services/dbml/DBMLParser';
import { UIComponentMapper } from '../services/generation/UIComponentMapper';
import { Prototype } from '../types/prototype';
import { useNavigate } from 'react-router-dom';

/**
 * Example DBML schemas for demonstration
 */
const EXAMPLE_SCHEMAS = {
  ecommerce: {
    name: 'E-commerce Platform',
    description: 'Basic e-commerce with users, products, and orders',
    dbml: `
Table users {
  id int [pk, increment]
  email varchar [unique, not null]
  name varchar [not null]
  password varchar [not null]
  created_at timestamp [default: 'now()']
  status varchar [default: 'active']
}

Table products {
  id int [pk, increment]
  name varchar [not null]
  description text
  price decimal(10,2) [not null]
  stock_quantity int [default: 0]
  category_id int [ref: > categories.id]
  created_at timestamp [default: 'now()']
}

Table categories {
  id int [pk, increment]
  name varchar [not null]
  description text
}

Table orders {
  id int [pk, increment]
  user_id int [ref: > users.id, not null]
  total_amount decimal(10,2) [not null]
  status varchar [default: 'pending']
  created_at timestamp [default: 'now()']
}

Table order_items {
  id int [pk, increment]
  order_id int [ref: > orders.id, not null]
  product_id int [ref: > products.id, not null]
  quantity int [not null]
  price decimal(10,2) [not null]
}
    `.trim()
  },
  blog: {
    name: 'Blog Platform',
    description: 'Simple blog with posts, comments, and categories',
    dbml: `
Table authors {
  id int [pk, increment]
  name varchar [not null]
  email varchar [unique, not null]
  bio text
  avatar_url varchar
  created_at timestamp [default: 'now()']
}

Table posts {
  id int [pk, increment]
  title varchar [not null]
  slug varchar [unique, not null]
  content text [not null]
  excerpt text
  author_id int [ref: > authors.id, not null]
  category_id int [ref: > categories.id]
  published boolean [default: false]
  published_at timestamp
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table categories {
  id int [pk, increment]
  name varchar [not null]
  slug varchar [unique, not null]
  description text
}

Table comments {
  id int [pk, increment]
  post_id int [ref: > posts.id, not null]
  author_name varchar [not null]
  author_email varchar [not null]
  content text [not null]
  approved boolean [default: false]
  created_at timestamp [default: 'now()']
}
    `.trim()
  },
  crm: {
    name: 'CRM System',
    description: 'Customer relationship management with contacts and deals',
    dbml: `
Table companies {
  id int [pk, increment]
  name varchar [not null]
  industry varchar
  website varchar
  phone varchar
  address text
  created_at timestamp [default: 'now()']
}

Table contacts {
  id int [pk, increment]
  company_id int [ref: > companies.id]
  first_name varchar [not null]
  last_name varchar [not null]
  email varchar [unique]
  phone varchar
  position varchar
  created_at timestamp [default: 'now()']
}

Table deals {
  id int [pk, increment]
  company_id int [ref: > companies.id, not null]
  contact_id int [ref: > contacts.id]
  title varchar [not null]
  value decimal(12,2)
  stage varchar [default: 'prospecting']
  probability int [default: 0]
  expected_close_date date
  created_at timestamp [default: 'now()']
}

Table activities {
  id int [pk, increment]
  deal_id int [ref: > deals.id]
  contact_id int [ref: > contacts.id]
  type varchar [not null]
  subject varchar [not null]
  description text
  completed boolean [default: false]
  due_date timestamp
  created_at timestamp [default: 'now()']
}
    `.trim()
  }
};

/**
 * Generation steps
 */
const GENERATION_STEPS = [
  'DBML Input',
  'Schema Validation',
  'Configuration',
  'Generation',
  'Review & Save'
];

/**
 * Stage to step mapping
 */
const STAGE_TO_STEP: Record<GenerationStage, number> = {
  'parsing': 1,
  'mapping': 2,
  'prompt_creation': 3,
  'subagent_coordination': 3,
  'response_validation': 3,
  'prototype_creation': 4,
  'complete': 4,
  'error': -1
};

export const PrototypeGenerator: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [dbmlContent, setDbmlContent] = useState('');
  const [prototypeName, setPrototypeName] = useState('');
  const [prototypeDescription, setPrototyDescription] = useState('');
  
  // Generation options
  const [options, setOptions] = useState<Partial<GenerationOptions['preferences']>>({
    includeViews: ['list', 'detail', 'form'],
    themeMode: 'light',
    componentStyle: 'standard',
    includeValidation: true,
    includeRelationships: true,
    generateTests: false
  });
  
  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [subagentResponses, setSubagentResponses] = useState<SubagentResponse[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [parsedSchema, setParsedSchema] = useState<any>(null);
  const [uiSuggestions, setUiSuggestions] = useState<any[]>([]);
  const [generatedPrototype, setGeneratedPrototype] = useState<Prototype | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  /**
   * Load example schema
   */
  const handleLoadExample = (key: keyof typeof EXAMPLE_SCHEMAS) => {
    const example = EXAMPLE_SCHEMAS[key];
    setDbmlContent(example.dbml);
    setPrototypeName(example.name);
    setPrototyDescription(example.description);
    setActiveStep(0);
  };

  /**
   * Validate DBML content
   */
  const handleValidateDBML = useCallback(() => {
    if (!dbmlContent.trim()) {
      setValidationResult({ valid: false, errors: [{ line: 1, message: 'DBML content is required', severity: 'error' }] });
      return;
    }

    try {
      const validation = DBMLValidator.validate(dbmlContent);
      setValidationResult(validation);
      
      if (validation.valid) {
        const parsed = DBMLParser.parse(dbmlContent);
        setParsedSchema(parsed);
        
        const suggestions = UIComponentMapper.generateSuggestions(parsed.tables, parsed.relationships);
        setUiSuggestions(suggestions);
        
        setActiveStep(2); // Move to configuration step
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [{ line: 1, message: error instanceof Error ? error.message : 'Parsing failed', severity: 'error' }]
      });
    }
  }, [dbmlContent]);

  /**
   * Start prototype generation
   */
  const handleStartGeneration = useCallback(async () => {
    if (!dbmlContent.trim() || !prototypeName.trim()) {
      return;
    }

    setIsGenerating(true);
    setActiveStep(3);
    setProgress(null);
    setSubagentResponses([]);

    const generationOptions: GenerationOptions = {
      dbmlContent,
      name: prototypeName,
      description: prototypeDescription,
      preferences: options as GenerationOptions['preferences'],
      onProgress: (progressUpdate) => {
        setProgress(progressUpdate);
        const stepIndex = STAGE_TO_STEP[progressUpdate.stage];
        if (stepIndex >= 0) {
          setActiveStep(stepIndex);
        }
      },
      onSubagentComplete: (response) => {
        setSubagentResponses(prev => [...prev, response]);
      }
    };

    try {
      const generator = new PrototypeGenerator();
      const prototype = await generator.generate(generationOptions);
      
      setGeneratedPrototype(prototype);
      setActiveStep(4); // Move to review step
    } catch (error) {
      console.error('Generation failed:', error);
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [dbmlContent, prototypeName, prototypeDescription, options]);

  /**
   * Save and navigate to prototype
   */
  const handleSavePrototype = () => {
    if (generatedPrototype) {
      navigate(`/prototypes/${generatedPrototype.id}`);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setDbmlContent('');
    setPrototypeName('');
    setPrototyDescription('');
    setActiveStep(0);
    setIsGenerating(false);
    setProgress(null);
    setSubagentResponses([]);
    setValidationResult(null);
    setParsedSchema(null);
    setUiSuggestions([]);
    setGeneratedPrototype(null);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h1" gutterBottom>
        Prototype Generator
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Generate complete UI prototypes from DBML database schemas using Claude Code integration.
        Define your database structure and let AI create the interface components.
      </Typography>

      {/* Example Schemas */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Start Examples
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {Object.entries(EXAMPLE_SCHEMAS).map(([key, example]) => (
            <Chip
              key={key}
              label={example.name}
              onClick={() => handleLoadExample(key as keyof typeof EXAMPLE_SCHEMAS)}
              variant="outlined"
              clickable
            />
          ))}
        </Stack>
      </Paper>

      {/* Generation Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
        {/* Step 1: DBML Input */}
        <Step>
          <StepLabel>
            <Stack direction="row" alignItems="center" spacing={1}>
              <DatabaseIcon fontSize="small" />
              <Typography>DBML Input</Typography>
            </Stack>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Database Schema (DBML)"
                placeholder="Enter your DBML schema here..."
                value={dbmlContent}
                onChange={(e) => setDbmlContent(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Define your database structure using DBML syntax"
              />
              
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Prototype Name"
                  value={prototypeName}
                  onChange={(e) => setPrototypeName(e.target.value)}
                  required
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Description"
                  value={prototypeDescription}
                  onChange={(e) => setPrototyDescription(e.target.value)}
                  sx={{ flex: 2 }}
                />
              </Stack>
              
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  onClick={() => setActiveStep(1)}
                  disabled={!dbmlContent.trim() || !prototypeName.trim()}
                >
                  Next: Validate Schema
                </Button>
                <Button onClick={handleReset}>Reset</Button>
              </Stack>
            </Box>
          </StepContent>
        </Step>

        {/* Step 2: Schema Validation */}
        <Step>
          <StepLabel>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckIcon fontSize="small" />
              <Typography>Schema Validation</Typography>
            </Stack>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              {!validationResult ? (
                <Button variant="contained" onClick={handleValidateDBML}>
                  Validate DBML Schema
                </Button>
              ) : validationResult.valid ? (
                <Stack spacing={2}>
                  <Alert severity="success">
                    Schema validation successful! Found {parsedSchema?.tables?.length || 0} tables
                    and {parsedSchema?.relationships?.length || 0} relationships.
                  </Alert>
                  
                  {/* Schema Summary */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Schema Summary</Typography>  
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Typography variant="subtitle2">Tables:</Typography>
                        <List dense>
                          {parsedSchema?.tables?.map((table: any) => (
                            <ListItem key={table.name}>
                              <ListItemIcon>
                                <DatabaseIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={table.name}
                                secondary={`${table.columns.length} columns`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* UI Suggestions Preview */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Suggested UI Components</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        {uiSuggestions.map((suggestion: any) => (
                          <Card key={suggestion.table} variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                {suggestion.table}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {suggestion.views.map((view: any) => (
                                  <Chip
                                    key={view.type}
                                    size="small"
                                    label={view.type}
                                    icon={
                                      view.type === 'list' ? <ListIcon fontSize="small" /> :
                                      view.type === 'detail' ? <DetailIcon fontSize="small" /> :
                                      view.type === 'form' ? <FormIcon fontSize="small" /> :
                                      <DashboardIcon fontSize="small" />
                                    }
                                  />
                                ))}
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Button 
                    variant="contained" 
                    onClick={() => setActiveStep(2)}
                  >
                    Next: Configure Generation
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Alert severity="error">
                    Schema validation failed. Please fix the following issues:
                  </Alert>
                  <List>
                    {validationResult.errors.map((error: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`Line ${error.line}: ${error.message}`}
                          secondary={error.severity}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button onClick={handleValidateDBML}>Re-validate</Button>
                </Stack>
              )}
            </Box>
          </StepContent>
        </Step>

        {/* Step 3: Configuration */}
        <Step>
          <StepLabel>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FormIcon fontSize="small" />
              <Typography>Configuration</Typography>
            </Stack>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <Stack spacing={3}>
                {/* View Selection */}
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" gutterBottom>
                    Views to Generate
                  </Typography>
                  <FormGroup row>
                    {(['list', 'detail', 'form', 'dashboard'] as const).map((view) => (
                      <FormControlLabel
                        key={view}
                        control={
                          <Switch
                            checked={options.includeViews?.includes(view) || false}
                            onChange={(e) => {
                              const includeViews = options.includeViews || [];
                              if (e.target.checked) {
                                setOptions(prev => ({
                                  ...prev,
                                  includeViews: [...includeViews, view]
                                }));
                              } else {
                                setOptions(prev => ({
                                  ...prev,
                                  includeViews: includeViews.filter(v => v !== view)
                                }));
                              }
                            }}
                          />
                        }
                        label={view.charAt(0).toUpperCase() + view.slice(1)}
                      />
                    ))}
                  </FormGroup>
                </FormControl>

                {/* Theme Mode */}
                <FormControl>
                  <InputLabel>Theme Mode</InputLabel>
                  <Select
                    value={options.themeMode || 'light'}
                    label="Theme Mode"
                    onChange={(e) => setOptions(prev => ({ ...prev, themeMode: e.target.value as 'light' | 'dark' }))}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                  </Select>
                </FormControl>

                {/* Component Style */}
                <FormControl>
                  <InputLabel>Component Style</InputLabel>
                  <Select
                    value={options.componentStyle || 'standard'}
                    label="Component Style"
                    onChange={(e) => setOptions(prev => ({ ...prev, componentStyle: e.target.value as any }))}
                  >
                    <MenuItem value="minimal">Minimal</MenuItem>
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="detailed">Detailed</MenuItem>
                  </Select>
                </FormControl>

                {/* Additional Options */}
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={options.includeValidation || false}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeValidation: e.target.checked }))}
                      />
                    }
                    label="Include Form Validation"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={options.includeRelationships || false}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeRelationships: e.target.checked }))}
                      />
                    }
                    label="Include Relationship Components"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={options.generateTests || false}
                        onChange={(e) => setOptions(prev => ({ ...prev, generateTests: e.target.checked }))}
                      />
                    }
                    label="Generate Unit Tests"
                  />
                </FormGroup>

                <Button 
                  variant="contained" 
                  onClick={handleStartGeneration}
                  disabled={!options.includeViews?.length}
                >
                  Start Generation
                </Button>
              </Stack>
            </Box>
          </StepContent>
        </Step>

        {/* Step 4: Generation */}
        <Step>
          <StepLabel>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CodeIcon fontSize="small" />
              <Typography>Generation</Typography>
            </Stack>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              {progress && (
                <Stack spacing={2}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  
                  <Alert severity={progress.stage === 'error' ? 'error' : 'info'}>
                    <Typography variant="body2">
                      {progress.message}
                    </Typography>
                    {progress.error && (
                      <Typography color="error" variant="caption">
                        {progress.error}
                      </Typography>
                    )}
                  </Alert>

                  {/* Subagent Progress */}
                  {subagentResponses.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                          Subagent Progress ({subagentResponses.length} completed)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {subagentResponses.map((response, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {response.success ? 
                                  <CheckIcon color="success" fontSize="small" /> :
                                  <ErrorIcon color="error" fontSize="small" />
                                }
                              </ListItemIcon>
                              <ListItemText
                                primary={`Task ${response.taskId}`}
                                secondary={
                                  response.success ? 
                                    `Completed in ${response.metadata?.processingTime}ms` :
                                    response.error
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Stack>
              )}

              {generatedPrototype && (
                <Alert severity="success">
                  <Typography>
                    Prototype generated successfully! Ready for review.
                  </Typography>
                </Alert>
              )}
            </Box>
          </StepContent>
        </Step>

        {/* Step 5: Review & Save */}
        <Step>
          <StepLabel>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PreviewIcon fontSize="small" />
              <Typography>Review & Save</Typography>
            </Stack>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              {generatedPrototype && (
                <Stack spacing={2}>
                  <Typography variant="h6">
                    Generated Prototype: {generatedPrototype.name}
                  </Typography>
                  
                  <Typography color="text.secondary">
                    {generatedPrototype.description}
                  </Typography>

                  {/* Prototype Stats */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Generation Summary
                      </Typography>
                      <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                        <Box>
                          <Typography variant="h6">
                            {Object.keys(generatedPrototype.configuration.components || {}).length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Components
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6">
                            {parsedSchema?.tables?.length || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tables
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6">
                            {parsedSchema?.relationships?.length || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Relations
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Stack direction="row" spacing={2}>
                    <Button 
                      variant="contained" 
                      onClick={handleSavePrototype}
                    >
                      Save & Open Prototype
                    </Button>
                    <Button 
                      variant="outlined"
                      onClick={() => setPreviewOpen(true)}
                      startIcon={<PreviewIcon />}
                    >
                      Preview
                    </Button>
                    <Button onClick={handleReset}>
                      Generate Another
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          </StepContent>
        </Step>
      </Stepper>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Prototype Preview: {generatedPrototype?.name}
            </Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {generatedPrototype && (
            <Box sx={{ height: '100%' }}>
              <Tabs 
                value={selectedTab} 
                onChange={(_, newValue) => setSelectedTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
              >
                <Tab label="Schema" />
                <Tab label="Components" />
                <Tab label="Configuration" />
              </Tabs>

              <Box sx={{ p: 2, height: 'calc(100% - 48px)', overflow: 'auto' }}>
                {selectedTab === 0 && (
                  <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(generatedPrototype.schema, null, 2)}
                  </pre>
                )}
                {selectedTab === 1 && (
                  <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(generatedPrototype.configuration.components, null, 2)}
                  </pre>
                )}
                {selectedTab === 2 && (
                  <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(generatedPrototype.configuration, null, 2)}
                  </pre>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};