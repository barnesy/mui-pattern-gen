# ConfigurationPanel Migration Guide

This guide explains how to migrate from the existing prop editing implementations to the unified `ConfigurationPanel` component.

## Overview

The `ConfigurationPanel` consolidates functionality from four existing implementations:

1. **PatternPropsPanel** - Most comprehensive, 12 control types, Update/Cancel workflow
2. **SchemaPropsForm** - Schema-driven with validation, grouped accordions
3. **PurePropsForm** - Pure React with local state and explicit save/cancel
4. **AIDesignModeDrawer** - Uses PatternPropsPanel with immediate updates for sub-components

## Migration Examples

### From PatternPropsPanel

**Before:**
```tsx
import { PatternPropsPanel, PropControl } from '../patterns/PatternPropsPanel';

const controls: PropControl[] = [
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Default Title',
    group: 'Content',
    isContent: true,
  },
  // ... more controls
];

<PatternPropsPanel
  controls={controls}
  values={values}
  onChange={onChange}
  onReset={onReset}
  hideActions={false}
/>
```

**After:**
```tsx
import { ConfigurationPanel } from '../configuration';

// Controls remain the same format
const controls = [
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Default Title',
    group: 'Content',
    isContent: true,
  },
  // ... more controls
];

<ConfigurationPanel
  source={{ type: 'controls', controls }}
  values={values}
  onChange={onChange}
  onReset={onReset}
  updateMode="batched"
  hideActions={false}
/>
```

**Migration Helper:**
```tsx
import { migrationHelpers } from '../configuration';

const props = migrationHelpers.fromPatternPropsPanel(controls, values);
<ConfigurationPanel {...props} onChange={onChange} />
```

### From SchemaPropsForm

**Before:**
```tsx
import { SchemaPropsForm } from '../design/SchemaPropsForm';

<SchemaPropsForm
  schema={componentSchema}
  values={values}
  onChange={onChange}
  showActions={true}
/>
```

**After:**
```tsx
import { ConfigurationPanel } from '../configuration';

<ConfigurationPanel
  source={{ type: 'schema', schema: componentSchema }}
  values={values}
  onChange={(name, value) => onChange({ ...values, [name]: value })}
  updateMode="batched"
  showGroupedAccordions={true}
  enableValidation={true}
/>
```

**Migration Helper:**
```tsx
import { migrationHelpers } from '../configuration';

const props = migrationHelpers.fromSchemaPropsForm(schema, values);
<ConfigurationPanel {...props} onChange={handleChange} />
```

### From PurePropsForm

**Before:**
```tsx
import { PurePropsForm } from '../design/PurePropsForm';

<PurePropsForm
  schema={componentSchema}
  instance={instance}
  onSave={onSave}
  onCancel={onCancel}
/>
```

**After:**
```tsx
import { ConfigurationPanel } from '../configuration';

<ConfigurationPanel
  source={{ type: 'schema', schema: componentSchema }}
  values={instance.props}
  onChange={(name, value) => {
    // Handle individual field changes if needed
  }}
  onSave={onSave}
  onCancel={onCancel}
  updateMode="explicit"
  showGroupedAccordions={true}
  enableValidation={true}
/>
```

**Migration Helper:**
```tsx
import { migrationHelpers } from '../configuration';

const props = migrationHelpers.fromPurePropsForm(schema, instance.props);
<ConfigurationPanel {...props} onSave={onSave} onCancel={onCancel} />
```

### From AIDesignModeDrawer Pattern Usage

**Before (inside AIDesignModeDrawer):**
```tsx
{selectedPattern.isSubComponent ? (
  <PatternPropsPanel
    controls={patternConfig}
    values={localProps}
    onChange={handleChange}
    hideActions={true}
  />
) : (
  <SettingsPanel
    controls={patternConfig}
    values={localProps}
    onChange={handleChange}
  />
)}
```

**After:**
```tsx
<ConfigurationPanel
  source={{ type: 'controls', controls: patternConfig }}
  values={localProps}
  onChange={handleChange}
  updateMode={selectedPattern.isSubComponent ? 'immediate' : 'batched'}
  hideActions={selectedPattern.isSubComponent}
  title={selectedPattern.isSubComponent ? 'Component Properties' : 'Pattern Settings'}
/>
```

## Key Differences and New Features

### 1. Update Modes

The `ConfigurationPanel` supports three update modes:

- **`immediate`**: Changes applied immediately (for sub-components)
- **`batched`**: Changes applied on Update button click (for patterns) 
- **`explicit`**: Changes applied on explicit save action (for design mode)

### 2. Source Types

Configuration can come from two sources:

```tsx
// From controls array (PatternPropsPanel style)
source={{ type: 'controls', controls: controlsArray }}

// From schema (SchemaPropsForm style)
source={{ type: 'schema', schema: componentSchema }}
```

### 3. Enhanced Validation

Built-in validation with common patterns:

```tsx
import { ValidationPresets, applyValidationPresets } from '../configuration/validation';

const controlsWithValidation = applyValidationPresets(controls, {
  email: 'email',
  name: 'name',
  url: 'url',
});
```

### 4. Flexible UI Modes

```tsx
<ConfigurationPanel
  showGroupedAccordions={true}  // Accordion groups like SchemaPropsForm
  compactMode={true}            // Smaller spacing and controls
  title="Custom Title"          // Custom panel title
/>
```

## Advanced Usage

### Custom Validation

```tsx
const controls = [
  {
    name: 'username',
    type: 'text',
    label: 'Username',
    required: true,
    validation: {
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      custom: (value) => {
        if (value && value.includes('admin')) {
          return 'Username cannot contain "admin"';
        }
        return null;
      },
    },
  },
];
```

### Mixed Control Sources

```tsx
import { convertSchemaToControls, mergeConfigurations } from '../configuration';

// Convert schema to controls
const schemaControls = convertSchemaToControls(schema);

// Add custom controls
const customControls = [
  {
    name: 'advancedMode',
    type: 'boolean',
    label: 'Advanced Mode',
    group: 'Advanced',
  },
];

// Merge them
const allControls = mergeConfigurations(schemaControls, customControls);

<ConfigurationPanel
  source={{ type: 'controls', controls: allControls }}
  values={values}
  onChange={onChange}
/>
```

### Event Handling

```tsx
<ConfigurationPanel
  source={{ type: 'controls', controls }}
  values={values}
  onChange={onChange}
  onValidationChange={(errors, isValid) => {
    console.log('Validation state:', { errors, isValid });
  }}
  enableValidation={true}
/>
```

## Migration Checklist

### Step 1: Install Dependencies
All dependencies are already available in the project.

### Step 2: Update Imports
```tsx
// Replace old imports
import { PatternPropsPanel } from '../patterns/PatternPropsPanel';
import { SchemaPropsForm } from '../design/SchemaPropsForm';
import { PurePropsForm } from '../design/PurePropsForm';

// With new import
import { ConfigurationPanel, migrationHelpers } from '../configuration';
```

### Step 3: Convert Props
Use migration helpers or manually convert props:

```tsx
// Quick migration
const configProps = migrationHelpers.fromPatternPropsPanel(controls, values);

// Manual conversion
const configProps = {
  source: { type: 'controls', controls },
  values,
  onChange,
  updateMode: 'batched',
};
```

### Step 4: Update Component Usage
Replace old component with `ConfigurationPanel`.

### Step 5: Test Functionality
- Verify all control types render correctly
- Test Update/Cancel workflow
- Validate form validation (if using schemas)
- Check responsive behavior

### Step 6: Remove Old Components (Optional)
Once migration is complete, old components can be deprecated.

## Troubleshooting

### Common Issues

1. **Controls not rendering**: Check that `source.type` matches your data structure
2. **Validation not working**: Ensure `enableValidation={true}` is set
3. **Updates not applying**: Verify `updateMode` matches your expected behavior
4. **Styling issues**: Check if `compactMode` or custom theme affects layout

### Debug Tips

```tsx
// Add debug props to see internal state
<ConfigurationPanel
  {...props}
  onValidationChange={(errors, isValid) => {
    console.debug('Validation:', { errors, isValid });
  }}
/>
```

## Performance Considerations

1. **Use MemoizedConfigurationPanel** for expensive re-renders:
```tsx
import { MemoizedConfigurationPanel } from '../configuration';

<MemoizedConfigurationPanel {...props} />
```

2. **Optimize onChange handlers**:
```tsx
const handleChange = useCallback((name, value) => {
  // Your change logic
}, [dependencies]);
```

3. **Consider updateMode**: Use `immediate` only when necessary, as it can cause frequent re-renders.

## Backward Compatibility

The `ConfigurationPanel` is designed to be backward compatible:

- All existing control types from `PatternPropsPanel` are supported
- Schema-based validation works the same way
- Update/Cancel workflow is preserved
- Group-based organization is maintained

Migration helpers ensure a smooth transition with minimal code changes.