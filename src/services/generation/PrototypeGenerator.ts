/**
 * Prototype Generator Service
 * Orchestrates prototype generation from DBML schemas using subagents
 * Handles prompt engineering, subagent coordination, and response validation
 */

import { DBMLParser, ParsedDBML } from '../dbml/DBMLParser';
import { UIComponentMapper, UIComponentSuggestion } from './UIComponentMapper';
import { PrototypeService } from '../PrototypeService';
import { 
  Prototype, 
  CreatePrototypeInput, 
  DBMLPrototypeSchema,
  PrototypeConfiguration 
} from '../../types/prototype';

/**
 * Generation progress stages
 */
export type GenerationStage = 
  | 'parsing'
  | 'mapping'
  | 'prompt_creation'
  | 'subagent_coordination'
  | 'response_validation'
  | 'prototype_creation'
  | 'complete'
  | 'error';

/**
 * Generation progress information
 */
export interface GenerationProgress {
  stage: GenerationStage;
  progress: number; // 0-100
  message: string;
  details?: any;
  error?: string;
}

/**
 * Subagent task configuration
 */
export interface SubagentTask {
  id: string;
  type: 'view_generation' | 'component_creation' | 'integration_setup';
  prompt: string;
  context: Record<string, any>;
  expectedOutput: {
    type: 'component' | 'configuration' | 'integration';
    format: 'typescript' | 'json' | 'jsx';
  };
  priority: number;
  dependencies?: string[];
}

/**
 * Subagent response
 */
export interface SubagentResponse {
  taskId: string;
  success: boolean;
  output?: any;
  error?: string;
  metadata?: {
    processingTime: number;
    tokensUsed?: number;
    confidence?: number;
  };
}

/**
 * Generation options
 */
export interface GenerationOptions {
  // DBML source
  dbmlContent: string;
  
  // Prototype metadata
  name: string;
  description?: string;
  
  // Generation preferences
  preferences?: {
    includeViews?: Array<'list' | 'detail' | 'form' | 'dashboard'>;
    themeMode?: 'light' | 'dark';
    componentStyle?: 'minimal' | 'standard' | 'detailed';
    includeValidation?: boolean;
    includeRelationships?: boolean;
    generateTests?: boolean;
  };
  
  // Subagent configuration
  subagentConfig?: {
    maxConcurrency?: number;
    timeoutMs?: number;
    retryAttempts?: number;
  };
  
  // Callbacks
  onProgress?: (progress: GenerationProgress) => void;
  onSubagentComplete?: (response: SubagentResponse) => void;
}

/**
 * Prompt templates for different generation tasks
 */
const PROMPT_TEMPLATES = {
  LIST_VIEW: `
You are a UI/UX expert tasked with generating a React component for a data list view.

Database Schema:
{schema}

Table: {tableName}
Columns: {columns}
Relationships: {relationships}

Requirements:
- Create a professional list/table component using Material-UI
- Include search, filtering, and sorting capabilities
- Support pagination for large datasets
- Add action buttons (view, edit, delete)
- Use responsive design principles
- Follow TypeScript best practices

Component Style: {componentStyle}
Theme Mode: {themeMode}

Generate a complete React component with TypeScript interfaces.
Include proper prop types and default values.
Use Material-UI components and follow the project's coding standards.

Return only the component code in TypeScript format.
`,

  DETAIL_VIEW: `
You are a UI/UX expert tasked with generating a React component for a detailed record view.

Database Schema:
{schema}

Table: {tableName}
Columns: {columns}
Relationships: {relationships}

Requirements:
- Create a comprehensive detail view component using Material-UI
- Display all fields in an organized, readable format
- Include breadcrumb navigation
- Add action buttons (edit, delete, back)
- Show related data from foreign key relationships
- Use cards and proper spacing for visual hierarchy
- Support both light and dark themes

Component Style: {componentStyle}
Theme Mode: {themeMode}

Generate a complete React component with TypeScript interfaces.
Include proper handling of loading states and empty data.
Use Material-UI components consistently.

Return only the component code in TypeScript format.
`,

  FORM_VIEW: `
You are a UI/UX expert tasked with generating a React form component for data entry.

Database Schema:
{schema}

Table: {tableName}
Columns: {columns}
Relationships: {relationships}

Requirements:
- Create a comprehensive form component using Material-UI
- Map database fields to appropriate input components
- Include form validation based on database constraints
- Handle foreign key relationships with select dropdowns
- Add proper error handling and user feedback
- Include save/cancel actions
- Use responsive layout that works on mobile

Validation Rules:
{validationRules}

Component Style: {componentStyle}
Theme Mode: {themeMode}

Generate a complete React component with TypeScript interfaces.
Include form state management and validation logic.
Use Material-UI form components and validation patterns.

Return only the component code in TypeScript format.
`,

  DASHBOARD_VIEW: `
You are a UI/UX expert tasked with generating a React dashboard component for data analytics.

Database Schema:
{schema}

Table: {tableName}
Columns: {columns}
Relationships: {relationships}
Numeric Fields: {numericFields}

Requirements:
- Create an analytics dashboard using Material-UI
- Include key metrics and statistics cards
- Add charts for numeric data trends
- Provide filtering and date range selection
- Use responsive grid layout
- Include export functionality
- Support real-time data updates

Component Style: {componentStyle}
Theme Mode: {themeMode}

Generate a complete React component with TypeScript interfaces.
Include mock data and chart integration (use Chart.js or similar).
Focus on clear data visualization and user experience.

Return only the component code in TypeScript format.
`,

  INTEGRATION_SETUP: `
You are a full-stack developer tasked with creating integration code for a generated prototype.

Database Schema:
{schema}

Generated Components: {components}

Requirements:
- Create routing configuration for all views
- Set up data fetching hooks and services
- Configure form submission handlers  
- Add proper error boundaries
- Include loading states management
- Set up navigation between views
- Configure theme and styling

Generate the following integration files:
1. Routing configuration
2. Data service hooks
3. Navigation setup
4. Error handling
5. State management integration

Return well-structured TypeScript code with proper imports and exports.
Focus on clean architecture and maintainability.
`
};

/**
 * Prototype Generator class
 */
export class PrototypeGenerator {
  private subagentTasks: Map<string, SubagentTask> = new Map();
  private subagentResponses: Map<string, SubagentResponse> = new Map();
  private progressCallback?: (progress: GenerationProgress) => void;

  /**
   * Generate a prototype from DBML content
   */
  async generate(options: GenerationOptions): Promise<Prototype> {
    this.progressCallback = options.onProgress;
    
    try {
      // Stage 1: Parse DBML
      this.updateProgress('parsing', 10, 'Parsing DBML schema...');
      const parsedDBML = this.parseDBML(options.dbmlContent);
      
      // Stage 2: Map to UI components
      this.updateProgress('mapping', 25, 'Mapping database entities to UI components...');
      const uiSuggestions = this.mapToUIComponents(parsedDBML);
      
      // Stage 3: Create prompts and tasks
      this.updateProgress('prompt_creation', 40, 'Creating generation prompts...');
      const tasks = this.createSubagentTasks(parsedDBML, uiSuggestions, options);
      
      // Stage 4: Execute subagent tasks
      this.updateProgress('subagent_coordination', 55, 'Coordinating subagent tasks...');
      const responses = await this.executeSubagentTasks(tasks, options);
      
      // Stage 5: Validate and merge responses
      this.updateProgress('response_validation', 75, 'Validating and merging responses...');
      const validatedResults = this.validateAndMergeResponses(responses);
      
      // Stage 6: Create prototype
      this.updateProgress('prototype_creation', 90, 'Creating prototype...');
      const prototype = await this.createPrototype(
        options, 
        parsedDBML, 
        validatedResults
      );
      
      // Complete
      this.updateProgress('complete', 100, 'Prototype generation complete!');
      return prototype;
      
    } catch (error) {
      this.updateProgress('error', 0, 'Generation failed', undefined, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Parse DBML content
   */
  private parseDBML(dbmlContent: string): ParsedDBML {
    try {
      // Validate DBML syntax
      const validation = DBMLValidator.validate(dbmlContent);
      if (!validation.valid) {
        throw new Error(`DBML validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }
      
      return DBMLParser.parse(dbmlContent);
    } catch (error) {
      throw new Error(`Failed to parse DBML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map parsed DBML to UI component suggestions
   */
  private mapToUIComponents(parsedDBML: ParsedDBML): UIComponentSuggestion[] {
    return UIComponentMapper.generateSuggestions(parsedDBML.tables, parsedDBML.relationships);
  }

  /**
   * Create subagent tasks for parallel generation
   */
  private createSubagentTasks(
    parsedDBML: ParsedDBML,
    uiSuggestions: UIComponentSuggestion[],
    options: GenerationOptions
  ): SubagentTask[] {
    const tasks: SubagentTask[] = [];
    let taskId = 0;

    for (const suggestion of uiSuggestions) {
      const table = parsedDBML.tables.find(t => t.name === suggestion.table);
      if (!table) continue;

      for (const view of suggestion.views) {
        // Skip views not included in preferences
        if (options.preferences?.includeViews && 
            !options.preferences.includeViews.includes(view.type)) {
          continue;
        }

        const task: SubagentTask = {
          id: `task_${++taskId}`,
          type: 'view_generation',
          prompt: this.createPromptForView(view, table, parsedDBML, options),
          context: {
            table: table.name,
            view: view.type,
            columns: table.columns,
            relationships: parsedDBML.relationships.filter(r => 
              r.fromTable === table.name || r.toTable === table.name
            )
          },
          expectedOutput: {
            type: 'component',
            format: 'typescript'
          },
          priority: this.getViewPriority(view.type),
          dependencies: []
        };

        tasks.push(task);
      }
    }

    // Add integration setup task
    const integrationTask: SubagentTask = {
      id: `task_${++taskId}`,
      type: 'integration_setup',
      prompt: this.createIntegrationPrompt(parsedDBML, uiSuggestions, options),
      context: {
        tables: parsedDBML.tables.map(t => t.name),
        views: uiSuggestions.flatMap(s => s.views.map(v => ({ table: s.table, view: v.type })))
      },
      expectedOutput: {
        type: 'integration',
        format: 'typescript'
      },
      priority: 1, // Lower priority - depends on components
      dependencies: tasks.map(t => t.id) // Depends on all component tasks
    };

    tasks.push(integrationTask);

    return tasks;
  }

  /**
   * Execute subagent tasks with coordination
   */
  private async executeSubagentTasks(
    tasks: SubagentTask[],
    options: GenerationOptions
  ): Promise<SubagentResponse[]> {
    const config = options.subagentConfig || {};
    const maxConcurrency = config.maxConcurrency || 3;
    const timeoutMs = config.timeoutMs || 30000;
    const retryAttempts = config.retryAttempts || 2;

    const responses: SubagentResponse[] = [];
    const executing = new Set<string>();
    const completed = new Set<string>();
    const failed = new Set<string>();

    // Sort tasks by priority and dependencies
    const sortedTasks = this.sortTasksByPriority(tasks);

    while (completed.size + failed.size < tasks.length) {
      // Find tasks ready to execute
      const readyTasks = sortedTasks.filter(task => 
        !executing.has(task.id) && 
        !completed.has(task.id) && 
        !failed.has(task.id) &&
        task.dependencies.every(dep => completed.has(dep))
      );

      // Start new tasks up to concurrency limit
      const availableSlots = maxConcurrency - executing.size;
      const tasksToStart = readyTasks.slice(0, availableSlots);

      for (const task of tasksToStart) {
        executing.add(task.id);
        
        // Execute task (simulate subagent call)
        this.executeTask(task, timeoutMs, retryAttempts)
          .then(response => {
            responses.push(response);
            executing.delete(task.id);
            
            if (response.success) {
              completed.add(task.id);
            } else {
              failed.add(task.id);
            }

            if (options.onSubagentComplete) {
              options.onSubagentComplete(response);
            }
          })
          .catch(error => {
            const errorResponse: SubagentResponse = {
              taskId: task.id,
              success: false,
              error: error.message
            };
            responses.push(errorResponse);
            executing.delete(task.id);
            failed.add(task.id);
          });
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Wait for all executing tasks to complete
    while (executing.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return responses;
  }

  /**
   * Execute a single subagent task (simulated)
   */
  private async executeTask(
    task: SubagentTask,
    timeoutMs: number,
    retryAttempts: number
  ): Promise<SubagentResponse> {
    const startTime = Date.now();

    // In a real implementation, this would call the actual subagent service
    // For now, we'll simulate with a mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        const processingTime = Date.now() - startTime;
        
        // Generate mock component code based on task type
        const mockOutput = this.generateMockOutput(task);
        
        resolve({
          taskId: task.id,
          success: true,
          output: mockOutput,
          metadata: {
            processingTime,
            confidence: 0.85
          }
        });
      }, Math.random() * 2000 + 1000); // Simulate 1-3 second processing
    });
  }

  /**
   * Generate mock output for development/testing
   */
  private generateMockOutput(task: SubagentTask): any {
    const { table, view } = task.context;
    
    if (task.type === 'view_generation') {
      return {
        componentName: `${table}${view}`,
        code: this.generateMockComponentCode(table, view),
        imports: ['React', '@mui/material', '@mui/icons-material'],
        exports: [`${table}${view}`]
      };
    } else if (task.type === 'integration_setup') {
      return {
        routing: this.generateMockRoutingCode(task.context.tables),
        services: this.generateMockServiceCode(task.context.tables),
        navigation: this.generateMockNavigationCode()
      };
    }

    return {};
  }

  /**
   * Validate and merge subagent responses
   */
  private validateAndMergeResponses(responses: SubagentResponse[]): any {
    const successful = responses.filter(r => r.success);
    const failed = responses.filter(r => !r.success);

    if (failed.length > 0) {
      console.warn(`${failed.length} subagent tasks failed:`, failed.map(f => f.error));
    }

    // Merge successful responses
    const components = successful
      .filter(r => r.output?.componentName)
      .map(r => r.output);

    const integration = successful
      .find(r => r.output?.routing)?.output;

    return {
      components,
      integration,
      stats: {
        total: responses.length,
        successful: successful.length,
        failed: failed.length,
        averageProcessingTime: successful.reduce((sum, r) => 
          sum + (r.metadata?.processingTime || 0), 0) / successful.length
      }
    };
  }

  /**
   * Create final prototype from generated results
   */
  private async createPrototype(
    options: GenerationOptions,
    parsedDBML: ParsedDBML,
    results: any
  ): Promise<Prototype> {
    const schema: DBMLPrototypeSchema = {
      type: 'dbml',
      data: {
        dbml: options.dbmlContent,
        tables: parsedDBML.tables.map(table => ({
          name: table.name,
          columns: table.columns.map(col => ({
            name: col.name,
            type: col.type,
            constraints: col.constraints
          }))
        }))
      }
    };

    const configuration: PrototypeConfiguration = {
      theme: {
        mode: options.preferences?.themeMode || 'light'
      },
      components: results.components.reduce((acc: any, comp: any) => {
        acc[comp.componentName] = {
          code: comp.code,
          imports: comp.imports,
          exports: comp.exports
        };
        return acc;
      }, {}),
      custom: {
        integration: results.integration,
        generationStats: results.stats,
        dbmlSchema: parsedDBML
      }
    };

    const input: CreatePrototypeInput = {
      name: options.name,
      description: options.description || `Generated from DBML schema with ${parsedDBML.tables.length} tables`,
      schema,
      configuration,
      metadata: {
        tags: ['generated', 'dbml', 'subagent'],
        status: 'draft'
      }
    };

    return await PrototypeService.create(input);
  }

  // Helper methods

  private createPromptForView(
    view: any,
    table: any,
    parsedDBML: ParsedDBML,
    options: GenerationOptions
  ): string {
    const templateKey = `${view.type.toUpperCase()}_VIEW` as keyof typeof PROMPT_TEMPLATES;
    const template = PROMPT_TEMPLATES[templateKey] || PROMPT_TEMPLATES.LIST_VIEW;

    return template
      .replace('{schema}', JSON.stringify(parsedDBML, null, 2))
      .replace('{tableName}', table.name)
      .replace('{columns}', JSON.stringify(table.columns, null, 2))
      .replace('{relationships}', JSON.stringify(parsedDBML.relationships, null, 2))
      .replace('{componentStyle}', options.preferences?.componentStyle || 'standard')
      .replace('{themeMode}', options.preferences?.themeMode || 'light')
      .replace('{validationRules}', this.generateValidationRules(table))
      .replace('{numericFields}', JSON.stringify(
        table.columns.filter((col: any) => 
          ['int', 'integer', 'decimal', 'float', 'double'].includes(col.type)
        )
      ));
  }

  private createIntegrationPrompt(
    parsedDBML: ParsedDBML,
    uiSuggestions: UIComponentSuggestion[],
    options: GenerationOptions
  ): string {
    return PROMPT_TEMPLATES.INTEGRATION_SETUP
      .replace('{schema}', JSON.stringify(parsedDBML, null, 2))
      .replace('{components}', JSON.stringify(uiSuggestions, null, 2));
  }

  private getViewPriority(viewType: string): number {
    const priorities = {
      'list': 4,
      'detail': 3,
      'form': 3,
      'dashboard': 2
    };
    return priorities[viewType as keyof typeof priorities] || 1;
  }

  private sortTasksByPriority(tasks: SubagentTask[]): SubagentTask[] {
    return [...tasks].sort((a, b) => {
      // First, sort by dependencies (tasks with no dependencies first)
      if (a.dependencies.length !== b.dependencies.length) {
        return a.dependencies.length - b.dependencies.length;
      }
      // Then by priority (higher priority first)
      return b.priority - a.priority;
    });
  }

  private generateValidationRules(table: any): string {
    return table.columns
      .filter((col: any) => col.isNotNull || col.constraints.length > 0)
      .map((col: any) => `${col.name}: ${col.isNotNull ? 'required' : 'optional'}`)
      .join(', ');
  }

  private generateMockComponentCode(table: string, view: string): string {
    return `
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface ${table}${view}Props {
  // Generated props for ${table} ${view}
}

export const ${table}${view}: React.FC<${table}${view}Props> = (props) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ${table} ${view}
      </Typography>
      <Typography color="text.secondary">
        Generated ${view} view for ${table}
      </Typography>
    </Paper>
  );
};
`.trim();
  }

  private generateMockRoutingCode(tables: string[]): string {
    return `
// Generated routing configuration
export const routes = [
${tables.map(table => `
  { path: '/${table.toLowerCase()}', component: ${table}List },
  { path: '/${table.toLowerCase()}/:id', component: ${table}Detail },
  { path: '/${table.toLowerCase()}/new', component: ${table}Form },`).join('')}
];
`.trim();
  }

  private generateMockServiceCode(tables: string[]): string {
    return `
// Generated data services
${tables.map(table => `
export const use${table}Data = () => {
  // Generated data hook for ${table}
  return { data: [], loading: false, error: null };
};`).join('')}
`.trim();
  }

  private generateMockNavigationCode(): string {
    return `
// Generated navigation configuration
export const navigationItems = [
  // Generated navigation items
];
`.trim();
  }

  private updateProgress(
    stage: GenerationStage,
    progress: number,
    message: string,
    details?: any,
    error?: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        message,
        details,
        error
      });
    }
  }
}

// Import validator from DBMLParser (fix missing import)
import { DBMLValidator } from '../dbml/DBMLParser';