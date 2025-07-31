/**
 * Basic usage examples for ConfigurationPanel
 */

import React, { useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { ConfigurationPanel, ConfigControl } from '../index';

/**
 * Example 1: Basic Pattern Props (PatternPropsPanel replacement)
 */
export const BasicPatternPropsExample: React.FC = () => {
  const [values, setValues] = useState({
    title: 'Welcome Card',
    subtitle: 'A friendly greeting',
    showIcon: true,
    variant: 'elevated',
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
  });

  const controls: ConfigControl[] = [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      defaultValue: 'Welcome Card',
      group: 'Content',
      isContent: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      defaultValue: 'A friendly greeting',
      group: 'Content',
      isContent: true,
    },
    {
      name: 'showIcon',
      type: 'boolean',
      label: 'Show Icon',
      defaultValue: true,
      group: 'Features',
      isComponent: true,
      componentGroup: 'Header',
    },
    {
      name: 'variant',
      type: 'variant',
      label: 'Card Style',
      defaultValue: 'elevated',
      options: [
        { label: 'Flat', value: 'flat' },
        { label: 'Elevated', value: 'elevated' },
        { label: 'Outlined', value: 'outlined' },
      ],
      group: 'Appearance',
    },
    {
      name: 'padding',
      type: 'padding',
      label: 'Padding',
      defaultValue: { top: 16, right: 16, bottom: 16, left: 16 },
      group: 'Layout',
    },
  ];

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Pattern Props Example
      </Typography>
      <ConfigurationPanel
        source={{ type: 'controls', controls }}
        values={values}
        onChange={handleChange}
        updateMode="batched"
        title="Card Configuration"
      />
    </Box>
  );
};

/**
 * Example 2: Schema-based Form (SchemaPropsForm replacement)
 */
export const SchemaBasedExample: React.FC = () => {
  const [values, setValues] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    isActive: true,
    role: 'user',
  });

  const schema = {
    id: 'user-form',
    name: 'User Form',
    type: 'form' as const,
    props: [
      {
        name: 'name',
        type: 'string' as const,
        required: true,
        group: 'Personal',
      },
      {
        name: 'email',
        type: 'string' as const,
        required: true,
        group: 'Personal',
      },
      {
        name: 'age',
        type: 'number' as const,
        group: 'Personal',
      },
      {
        name: 'isActive',
        type: 'boolean' as const,
        group: 'Status',
      },
      {
        name: 'role',
        type: 'enum' as const,
        options: [
          { label: 'User', value: 'user' },
          { label: 'Admin', value: 'admin' },
          { label: 'Moderator', value: 'moderator' },
        ],
        group: 'Status',
      },
    ],
  };

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (newValues: Record<string, any>) => {
    console.log('Saving values:', newValues);
    // Handle save logic
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Schema-based Form Example
      </Typography>
      <ConfigurationPanel
        source={{ type: 'schema', schema }}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        updateMode="explicit"
        showGroupedAccordions={true}
        enableValidation={true}
        title="User Configuration"
      />
    </Box>
  );
};

/**
 * Example 3: Immediate Mode (Sub-component style)
 */
export const ImmediateModeExample: React.FC = () => {
  const [values, setValues] = useState({
    text: 'Button Text',
    color: 'primary',
    size: 'medium',
    disabled: false,
  });

  const controls: ConfigControl[] = [
    {
      name: 'text',
      type: 'text',
      label: 'Button Text',
      defaultValue: 'Button Text',
      isContent: true,
    },
    {
      name: 'color',
      type: 'select',
      label: 'Color',
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
      ],
    },
    {
      name: 'size',
      type: 'select',
      label: 'Size',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'disabled',
      type: 'boolean',
      label: 'Disabled',
      defaultValue: false,
    },
  ];

  const handleChange = (name: string, value: any) => {
    console.log(`${name} changed to:`, value);
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Immediate Mode Example (Sub-component style)
      </Typography>
      <ConfigurationPanel
        source={{ type: 'controls', controls }}
        values={values}
        onChange={handleChange}
        updateMode="immediate"
        hideActions={true}
        title="Button Properties"
        compactMode={true}
      />
    </Box>
  );
};

/**
 * Example 4: Advanced Validation
 */
export const ValidationExample: React.FC = () => {
  const [values, setValues] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    website: '',
  });

  const controls: ConfigControl[] = [
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        custom: (value: string) => {
          if (value && (value.includes('admin') || value.includes('root'))) {
            return 'Username cannot contain reserved words';
          }
          return null;
        },
      },
      helperText: 'Only letters, numbers, and underscores allowed',
    },
    {
      name: 'password',
      type: 'text',
      label: 'Password',
      required: true,
      validation: {
        minLength: 8,
        custom: (value: string) => {
          if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
          }
          return null;
        },
      },
    },
    {
      name: 'confirmPassword',
      type: 'text',
      label: 'Confirm Password',
      required: true,
      validation: {
        custom: (value: string) => {
          if (value && value !== values.password) {
            return 'Passwords do not match';
          }
          return null;
        },
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website',
      validation: {
        pattern: /^https?:\/\/.+/,
      },
      helperText: 'Must start with http:// or https://',
    },
  ];

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleValidationChange = (errors: Record<string, string>, isValid: boolean) => {
    console.log('Validation state:', { errors, isValid });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Advanced Validation Example
      </Typography>
      <ConfigurationPanel
        source={{ type: 'controls', controls }}
        values={values}
        onChange={handleChange}
        updateMode="batched"
        enableValidation={true}
        onValidationChange={handleValidationChange}
        title="Registration Form"
      />
    </Box>
  );
};

/**
 * Combined examples component
 */
export const ConfigurationPanelExamples: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        ConfigurationPanel Examples
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
        <BasicPatternPropsExample />
        <Divider />
        <SchemaBasedExample />
        <Divider />
        <ImmediateModeExample />
        <Divider />
        <ValidationExample />
      </Box>
    </Box>
  );
};