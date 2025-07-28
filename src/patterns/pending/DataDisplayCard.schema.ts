import { ComponentSchema, DataShape } from '../../schemas/types';
import { commonDataShapes } from '../../schemas/registry';

/**
 * Schema definition for DataDisplayCard component
 */
export const DataDisplayCardSchema: ComponentSchema = {
  id: 'DataDisplayCard',
  name: 'Data Display Card',
  type: 'display',
  category: 'cards',
  description: 'Versatile card component that adapts to different data types',

  // Flexible data shape - can accept various formats
  dataShape: {
    type: 'object',
    fields: {
      // For stats variant
      stats: {
        type: 'array',
        itemType: {
          type: 'object',
          properties: {
            label: { type: 'string', required: true },
            value: { type: 'number', required: true },
            trend: { type: 'string', enum: ['up', 'down', 'neutral'] },
            trendValue: { type: 'string' },
            color: { type: 'string' },
          },
        },
      },
      // For list variant
      listItems: {
        type: 'array',
        itemType: {
          type: 'object',
          properties: {
            id: { type: 'string', required: true },
            primary: { type: 'string', required: true },
            secondary: { type: 'string' },
            avatar: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
      // For table variant
      tableColumns: {
        type: 'array',
        itemType: { type: 'string' },
      },
      tableData: {
        type: 'array',
        itemType: { type: 'object' },
      },
      // For workflow variant
      workflowSteps: {
        type: 'array',
        itemType: {
          type: 'object',
          properties: {
            id: { type: 'string', required: true },
            title: { type: 'string', required: true },
            description: { type: 'string' },
            status: { type: 'string', required: true },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  },

  props: [
    {
      name: 'variant',
      type: 'enum',
      options: [
        { label: 'Stats', value: 'stats' },
        { label: 'List', value: 'list' },
        { label: 'Table', value: 'table' },
        { label: 'Workflow', value: 'workflow' },
        { label: 'Mixed', value: 'mixed' },
      ],
      default: 'stats',
      group: 'General',
    },
    {
      name: 'title',
      type: 'string',
      default: 'Data Display',
      group: 'General',
    },
    {
      name: 'subtitle',
      type: 'string',
      group: 'General',
    },
    {
      name: 'showHeader',
      type: 'boolean',
      default: true,
      group: 'Layout',
    },
    {
      name: 'showDivider',
      type: 'boolean',
      default: true,
      group: 'Layout',
    },
    {
      name: 'emptyMessage',
      type: 'string',
      default: 'No data available',
      group: 'Content',
    },
  ],

  defaultProps: {
    variant: 'stats',
    title: 'Data Display',
    showHeader: true,
    showDivider: true,
  },
};

/**
 * Data source examples for different variants
 */
export const DataDisplayCardDataSources = {
  stats: {
    id: 'stats-source',
    type: 'rest' as const,
    endpoint: '/api/stats',
    responseShape: {
      type: 'object' as const,
      fields: {
        stats: commonDataShapes.stats.fields,
      },
    },
  },
  users: {
    id: 'users-source',
    type: 'rest' as const,
    endpoint: '/api/users',
    responseShape: commonDataShapes.listItems,
  },
  table: {
    id: 'table-source',
    type: 'rest' as const,
    endpoint: '/api/data/table',
    responseShape: commonDataShapes.tableData,
  },
};

/**
 * Transform functions for API responses
 */
export const DataDisplayCardTransforms = {
  // Transform raw API data to stats format
  apiToStats: `
    if (!data || !Array.isArray(data.metrics)) return { stats: [] };
    return {
      stats: data.metrics.map(m => ({
        label: m.name,
        value: m.value,
        trend: m.change > 0 ? 'up' : m.change < 0 ? 'down' : 'neutral',
        trendValue: m.change ? \`\${m.change > 0 ? '+' : ''}\${m.change}%\` : undefined,
        color: m.type === 'revenue' ? 'primary' : 'default',
      }))
    };
  `,

  // Transform user data to list format
  apiToList: `
    if (!Array.isArray(data)) return { listItems: [] };
    return {
      listItems: data.map(user => ({
        id: user.id,
        primary: user.name,
        secondary: user.email,
        avatar: user.avatarUrl,
        status: user.isActive ? 'active' : 'inactive',
      }))
    };
  `,
};
