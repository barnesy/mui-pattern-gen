import React from 'react';
import { PropControl } from '../../components/patterns/PatternPropsPanel';

export const dataDisplayCardControls: PropControl[] = [
  // Variant control
  {
    name: 'variant',
    type: 'variant',
    label: 'Variant',
    defaultValue: 'stats',
    options: [
      { label: 'Stats', value: 'stats' },
      { label: 'List', value: 'list' },
      { label: 'Table', value: 'table' },
      { label: 'Workflow', value: 'workflow' },
      { label: 'Mixed', value: 'mixed' },
    ],
    group: 'General',
  },

  // Text props
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Performance Overview',
    group: 'General',
    isContent: true,
  },
  {
    name: 'subtitle',
    type: 'text',
    label: 'Subtitle',
    defaultValue: 'Last 30 days',
    group: 'General',
    isContent: true,
  },
  {
    name: 'emptyMessage',
    type: 'text',
    label: 'Empty Message',
    defaultValue: 'No data available',
    helperText: 'Message shown when no data',
    group: 'General',
    isContent: true,
  },

  // Appearance
  {
    name: 'elevation',
    type: 'slider',
    label: 'Elevation',
    defaultValue: 1,
    min: 0,
    max: 24,
    step: 1,
    group: 'Appearance',
  },
  {
    name: 'headerDivider',
    type: 'boolean',
    label: 'Header Divider',
    defaultValue: true,
    group: 'Appearance',
  },
  {
    name: 'contentPadding',
    type: 'boolean',
    label: 'Content Padding',
    defaultValue: true,
    group: 'Appearance',
  },
  {
    name: 'maxHeight',
    type: 'slider',
    label: 'Max Height (px)',
    defaultValue: 0,
    min: 0,
    max: 600,
    step: 50,
    helperText: '0 = no limit',
    group: 'Appearance',
  },

  // States
  {
    name: 'loading',
    type: 'boolean',
    label: 'Loading State',
    defaultValue: false,
    group: 'States',
  },
  {
    name: 'error',
    type: 'text',
    label: 'Error Message',
    defaultValue: '',
    helperText: 'Leave empty for no error',
    group: 'States',
    isContent: true,
  },

  // Demo data controls
  {
    name: 'demoDataType',
    type: 'select',
    label: 'Demo Data',
    defaultValue: '',
    options: [
      { label: 'Auto (based on variant)', value: '' },
      { label: 'Revenue Stats', value: 'revenue' },
      { label: 'User Activity', value: 'users' },
      { label: 'Task List', value: 'tasks' },
      { label: 'Sales Table', value: 'sales' },
      { label: 'Order Workflow', value: 'workflow' },
      { label: 'Dashboard Mix', value: 'dashboard' },
      { label: 'Empty', value: 'empty' },
    ],
    helperText: 'Override demo data or use auto based on variant',
    group: 'Demo Data',
  },
  {
    name: 'showMenuItems',
    type: 'boolean',
    label: 'Show Menu Items',
    defaultValue: true,
    helperText: 'Adds action menu to header',
    group: 'Features',
  },
  {
    name: 'showAction',
    type: 'boolean',
    label: 'Show Action Button',
    defaultValue: false,
    helperText: 'Adds custom action to header',
    group: 'Features',
  },
];

// Helper function to generate demo data based on type
export const getDemoData = (type: string) => {
  switch (type) {
    case 'revenue':
      return {
        stats: [
          { label: 'Total Revenue', value: '$125,430', trend: 'up', trendValue: '+12.5%', color: 'primary' },
          { label: 'New Customers', value: '1,234', trend: 'up', trendValue: '+8.3%', color: 'success' },
          { label: 'Avg Order Value', value: '$89.50', trend: 'down', trendValue: '-2.1%', color: 'warning' },
          { label: 'Conversion Rate', value: '3.45%', trend: 'neutral', color: 'info' },
        ],
      };
    
    case 'users':
      return {
        listItems: [
          {
            id: '1',
            primary: 'John Doe',
            secondary: 'Last active 2 minutes ago',
            avatar: 'JD',
            status: 'success',
          },
          {
            id: '2',
            primary: 'Jane Smith',
            secondary: 'Last active 1 hour ago',
            avatar: 'JS',
            status: 'info',
          },
          {
            id: '3',
            primary: 'Bob Johnson',
            secondary: 'Last active 3 days ago',
            avatar: 'BJ',
            status: 'warning',
          },
          {
            id: '4',
            primary: 'Alice Brown',
            secondary: 'Inactive',
            avatar: 'AB',
            status: 'error',
          },
        ],
      };
    
    case 'tasks':
      return {
        listItems: [
          {
            id: '1',
            primary: 'Review Q4 Reports',
            secondary: 'Due tomorrow',
            status: 'warning',
            action: React.createElement('span', { style: { color: '#ed6c02' } }, 'High Priority'),
          },
          {
            id: '2',
            primary: 'Team Meeting',
            secondary: 'Today at 3:00 PM',
            status: 'info',
          },
          {
            id: '3',
            primary: 'Update Documentation',
            secondary: 'Due next week',
            status: 'success',
          },
        ],
      };
    
    case 'sales':
      return {
        tableColumns: ['Product', 'Units Sold', 'Revenue', 'Growth'],
        tableData: [
          { Product: 'Product A', 'Units Sold': '1,234', Revenue: '$12,340', Growth: '+15%' },
          { Product: 'Product B', 'Units Sold': '987', Revenue: '$9,870', Growth: '+8%' },
          { Product: 'Product C', 'Units Sold': '756', Revenue: '$7,560', Growth: '-3%' },
          { Product: 'Product D', 'Units Sold': '543', Revenue: '$5,430', Growth: '+22%' },
        ],
      };
    
    case 'workflow':
      return {
        workflowSteps: [
          {
            id: '1',
            title: 'Order Received',
            description: 'Customer placed order #12345',
            status: 'completed',
            timestamp: '2 hours ago',
          },
          {
            id: '2',
            title: 'Payment Processed',
            description: 'Payment verified and confirmed',
            status: 'completed',
            timestamp: '1 hour ago',
          },
          {
            id: '3',
            title: 'Order Packed',
            description: 'Items packed and ready for shipping',
            status: 'active',
            timestamp: '30 minutes ago',
          },
          {
            id: '4',
            title: 'Shipped',
            description: 'Awaiting courier pickup',
            status: 'pending',
          },
          {
            id: '5',
            title: 'Delivered',
            description: 'Order delivered to customer',
            status: 'pending',
          },
        ],
      };
    
    case 'dashboard':
      return {
        stats: [
          { label: 'Active Users', value: '2,345', trend: 'up', trendValue: '+5.2%' },
          { label: 'Revenue', value: '$45,678', trend: 'up', trendValue: '+12.3%' },
        ],
        listItems: [
          {
            id: '1',
            primary: 'New order from John Doe',
            secondary: '5 minutes ago',
            status: 'info',
          },
          {
            id: '2',
            primary: 'System update completed',
            secondary: '1 hour ago',
            status: 'success',
          },
        ],
      };
    
    default:
      return {};
  }
};