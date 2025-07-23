# Pattern Generation Rules

## Overview
This project uses a simple file-based pattern generation system. Patterns are React components created using Material-UI (MUI) v5 that follow TypeScript best practices.

## When asked to generate a pattern:

### 1. **Always create patterns in `src/patterns/pending/` first**
- Use PascalCase for component names (e.g., `UserProfileCard.tsx`)
- Include TypeScript interfaces for all props
- Export both the component and its props interface

### 2. **Follow MUI best practices:**
- Use MUI components from '@mui/material'
- Use theme-aware styling with sx prop or useTheme hook
- Include proper TypeScript types for all props
- Make components responsive by default
- Support both light and dark modes

### 3. **Pattern structure:**
```typescript
import React from 'react';
import { /* MUI imports */ } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface ComponentNameProps {
  // Define all props with proper types
  // Make props optional when appropriate
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructure props with defaults
}) => {
  const theme = useTheme();
  
  return (
    // Implementation using MUI components
  );
};
```

### 4. **Create a configuration file** for interactive prop controls:
Create `src/patterns/pending/ComponentName.config.ts`:
```typescript
import { PropControl } from '../../components/patterns/PatternPropsPanel';

export const componentNameControls: PropControl[] = [
  // Variant control (if applicable)
  {
    name: 'variant',
    type: 'variant',
    label: 'Variant',
    defaultValue: 'default',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Minimal', value: 'minimal' },
      // Add more variants
    ],
    group: 'General',
  },
  
  // Text props
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    defaultValue: 'Default Title',
    group: 'General',
  },
  
  // Boolean props
  {
    name: 'showFeature',
    type: 'boolean',
    label: 'Show Feature',
    defaultValue: true,
    group: 'Features',
  },
  
  // Select props
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
    group: 'Appearance',
  },
  
  // Slider props
  {
    name: 'spacing',
    type: 'slider',
    label: 'Spacing',
    defaultValue: 2,
    min: 0,
    max: 10,
    step: 0.5,
    helperText: 'Adjust component spacing',
    group: 'Layout',
  },
];
```

**PropControl Types:**
- `text`: Text input field
- `number`: Numeric input field
- `boolean`: Switch/checkbox control
- `select`: Dropdown selection
- `slider`: Slider for numeric ranges
- `variant`: Toggle button group for variants

**Important:** The export name must be `{componentName}Controls` where componentName is camelCase.

### 5. **Update the context file** at `src/patterns/pending/.context.json`:
```json
{
  "current": "ComponentName",
  "category": "suggested-category"
}
```

### 6. **Loading states during updates:**
When updating a pattern:
1. First, replace the component with the PatternLoading component:
   ```typescript
   import React from 'react';
   import { PatternLoading } from '../../components/patterns/PatternLoading';
   
   export const ComponentName: React.FC = () => {
     return <PatternLoading />;
   };
   ```
2. Save the file (user sees loading animation)
3. Work on the actual updates
4. Replace with the updated implementation
5. Save again

## When asked to approve a pattern:

1. Move the file from `src/patterns/pending/ComponentName.tsx` to `src/patterns/{category}/ComponentName.tsx`
2. Move the config file (if exists) from `src/patterns/pending/ComponentName.config.ts` to `src/patterns/{category}/ComponentName.config.ts`
3. Update `src/patterns/{category}/index.ts` to export the component:
   ```typescript
   export { ComponentName } from './ComponentName';
   export type { ComponentNameProps } from './ComponentName';
   ```
4. Update the Pattern Library (`src/pages/PatternViewer.tsx`):
   - Add the component name to the appropriate category in the `acceptedPatterns` object
   - This ensures the pattern appears in the Pattern Library immediately
5. Clear or update the context file at `src/patterns/pending/.context.json`

## When asked to reject a pattern:

1. Delete the file from `src/patterns/pending/`
2. Delete the config file (if exists) from `src/patterns/pending/`
3. Clear the context file
4. If the pattern was previously accepted, remove it from the Pattern Library (`src/pages/PatternViewer.tsx`)

## Available categories:
- **auth**: Login forms, registration, password reset, 2FA
- **cards**: User profiles, product cards, info cards, stats cards
- **forms**: Contact forms, multi-step forms, search forms, filters
- **navigation**: Headers, sidebars, breadcrumbs, menus, tabs
- **lists**: Data tables, list items, grids, galleries
- **dashboards**: Stats widgets, charts, analytics, KPIs

## Pattern Requirements:

### Accessibility:
- Include proper ARIA labels
- Ensure keyboard navigation works
- Use semantic HTML elements via MUI components

### Responsiveness:
- Use MUI's breakpoint system
- Test on mobile, tablet, and desktop viewports
- Use responsive typography scale

### Theme Integration:
- Use theme.palette for colors
- Use theme.spacing() for consistent spacing
- Use theme.typography for text styles
- Support density modes (compact/comfortable/spacious)

### Performance:
- Use React.memo for expensive components
- Implement proper loading states
- Avoid inline function definitions in render

## Example Pattern Generation Flow:

1. User: "Generate a user profile card with avatar, name, role, and social links"
2. You create: `src/patterns/pending/UserProfileCard.tsx`
3. Update context.json with current pattern info
4. User: "Make the avatar larger and add a follow button"
5. You show loading state, then update the component
6. User: "Approve this as a card pattern"
7. You move to `src/patterns/cards/` and update exports

## Pattern Generator Features:

The Pattern Generator now includes these interactive features:
1. **Prop Controls Panel**: Dynamically modify all component props with Update/Cancel workflow
2. **Variant Selection**: Switch between component variants with toggle buttons
3. **Responsive Preview**: Test on Mobile (375px), Tablet (768px), and Desktop (1200px)
4. **Theme Toggle**: Preview in both light and dark modes
5. **Fullscreen Mode**: Expand preview for detailed testing (Exit with button or Esc key)
6. **Iframe Isolation**: Pattern preview runs in isolated iframe to prevent re-renders
7. **Auto-sizing**: Preview automatically adjusts height to fit content

## Best Practices for Interactive Patterns:

1. **Always create a config file** with prop controls for every pattern
2. **Group related props** using the `group` property (General, Features, Appearance, Layout, etc.)
3. **Provide helpful `helperText`** for complex props
4. **Use appropriate control types**:
   - `variant` for main component variations
   - `slider` for numeric ranges (spacing, size, etc.)
   - `boolean` for feature toggles
   - `select` for predefined options
   - `text` for user-provided content
5. **Set sensible `defaultValue`** for all props
6. **Make components responsive** - they should work at all preview sizes

## Important Notes:
- Always use absolute imports from '@mui/material'
- Include meaningful default props
- Add JSDoc comments for complex props
- Test components in both light and dark modes
- Consider mobile-first design approach
- Create a comprehensive config file for all patterns

## Technical Architecture:

### Pattern Generator Implementation:
1. **Main App** (`/src/pages/PatternGenerator.tsx`):
   - Monitors `.context.json` for current pattern
   - Manages prop state and preview settings
   - Handles fullscreen mode and device selection

2. **Preview Isolation** (`/src/preview/PatternPreviewApp.tsx`):
   - Separate React app loaded in iframe
   - Receives props via postMessage API
   - Reports content height back to parent
   - Prevents re-renders when editing props

3. **Prop Controls** (`/src/components/patterns/PatternPropsPanel.tsx`):
   - Local state management with Update/Cancel workflow
   - Debounced text inputs to prevent focus loss
   - Grouped controls in accordions
   - Supports multiple control types

4. **Build Configuration** (`vite.config.ts`):
   - Multiple entry points for main app and preview
   - Separate HTML templates for iframe isolation

### Key Implementation Details:
- **No focus loss**: Props are updated only when "Update" is clicked
- **Smooth transitions**: Height changes animate smoothly
- **Dark mode support**: Initial background color prevents white flash
- **Responsive testing**: Real-time viewport adjustments
- **Memory efficient**: Components unmount properly when switching patterns

## Pattern Library (`/patterns` route):

The Pattern Library provides a centralized view of all patterns in the system:

### Features:
1. **Browsing**: View all pending and accepted patterns in one place
2. **Search**: Filter patterns by name
3. **Category Filtering**: Filter by pattern category (auth, cards, forms, etc.)
4. **Status Filtering**: View all, pending only, or accepted only
5. **View Modes**: Grid view or list view
6. **Live Preview**: Click any pattern to see a live preview with responsive controls
7. **Device Preview**: Test patterns on Mobile (375px), Tablet (768px), and Desktop (1200px)

### Keeping the Library Updated:
When patterns are approved/rejected, you MUST update the Pattern Library:
1. Open `src/pages/PatternViewer.tsx`
2. Find the `acceptedPatterns` object (around line 129)
3. Add/remove pattern names from the appropriate category arrays
4. This ensures the library always reflects the current state of patterns

### Pattern Library Structure:
```typescript
const acceptedPatterns: Record<string, string[]> = {
  auth: ['LoginForm', 'RegisterForm'],  // Add approved auth patterns here
  cards: ['ProfileCard'],                // Add approved card patterns here
  forms: [],                             // Add approved form patterns here
  navigation: [],                        // Add approved navigation patterns here
  lists: [],                             // Add approved list patterns here
  dashboards: [],                        // Add approved dashboard patterns here
};
```

### Important Notes:
- The Pattern Library automatically discovers pending patterns from the context file
- Accepted patterns must be manually added to maintain accuracy
- The preview feature works for both pending and accepted patterns
- Patterns without config files will still preview but won't have interactive controls