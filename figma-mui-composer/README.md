# MUI Pattern Composer - Figma Plugin

A Figma plugin that composes patterns using Material-UI (MUI) primitives from the official MUI Figma library.

## Overview

This plugin allows you to:
- 🎨 Compose complex UI patterns using MUI components
- 🔄 Import components from the official MUI Figma library
- 🚀 Generate consistent designs based on your React patterns
- 🎯 Maintain design-code parity

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   cd figma-mui-composer
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. **IMPORTANT:** Import the plugin from the `dist` directory:
   - In Figma, go to Plugins → Development → Import plugin from manifest
   - Navigate to the `dist` folder: `figma-mui-composer/dist/`
   - Select the `manifest.json` file from the `dist` directory

⚠️ **Common Error:** If you see "ENOENT: no such file or directory" errors, you've imported from the wrong directory. Remove the plugin and reimport from `dist/`.

## Usage

### First-time Setup

1. **Open the MUI Figma Library**
   - Get the official MUI Figma library from [mui.com/store/items/figma-react/](https://mui.com/store/items/figma-react/)
   - Open the library file in Figma

2. **Run Component Discovery**
   - Open the plugin in the MUI library file
   - Go to the "Components" tab
   - Click "Discover Components"
   - The plugin will scan and save all MUI component keys

### Creating Patterns

1. **Open your design file**
   - Create a new file or open an existing one
   - Run the MUI Pattern Composer plugin

2. **Select a Pattern**
   - Browse available patterns by category
   - Search for specific patterns
   - Click on a pattern to select it

3. **Compose the Pattern**
   - Click "Create Pattern"
   - The plugin will import MUI components and compose them
   - The pattern will appear in your canvas

## Pattern Structure

Patterns are defined using a JSON structure:

```typescript
{
  name: 'PatternName',
  type: 'frame',
  layout: 'vertical' | 'horizontal',
  padding: number,
  spacing: number,
  children: [
    {
      type: 'mui:ComponentName',
      props: { /* component props */ },
      content: 'Text content',
      children: [ /* nested elements */ ]
    }
  ]
}
```

## Available Patterns

### Auth
- LoginForm - Sign in form with email/password
- RegisterForm - User registration form
- PasswordReset - Password recovery form

### Cards
- UserProfileCard - User profile display
- ProductCard - E-commerce product card
- StatsCard - Statistics display card

### Forms
- ContactForm - Contact/inquiry form
- SearchForm - Advanced search interface
- MultiStepForm - Multi-step form wizard

### Navigation
- Header - Top navigation bar
- Sidebar - Side navigation panel
- Breadcrumbs - Breadcrumb navigation

### Lists
- DataTable - Data table with features
- ImageGallery - Image grid gallery

### Dashboards
- StatsWidget - Statistics widget
- ChartWidget - Chart display widget

## Development

### Project Structure
```
figma-mui-composer/
├── src/
│   ├── code.ts              # Main plugin logic
│   ├── ui.tsx               # React UI
│   ├── composers/           # Pattern composition logic
│   │   ├── mui-mapper.ts    # MUI component mappings
│   │   ├── pattern-parser.ts # Pattern definitions
│   │   └── layout-engine.ts # Layout calculations
│   └── library/             # Component library data
├── manifest.json            # Plugin manifest
├── webpack.config.js        # Build configuration
└── package.json
```

### Development Commands

```bash
# Watch mode for development
npm run watch

# Production build
npm run build
```

### Adding New Patterns

1. Add pattern definition in `src/composers/pattern-parser.ts`
2. Add description in `src/ui.tsx`
3. Test the pattern composition
4. Submit a PR with the new pattern

## Technical Details

### Component Discovery
The plugin uses Figma's Plugin API to discover components:
- `figma.root.findAll()` - Find all components
- `figma.importComponentByKeyAsync()` - Import components
- `figma.clientStorage` - Store component keys

### Pattern Composition
Patterns are composed using:
- Auto-layout for responsive design
- Component instances from MUI library
- Proper spacing and padding
- Theme-aware styling

### Limitations
- Requires access to MUI Figma library
- Component keys must be discovered first
- Some dynamic features cannot be replicated
- Limited to Figma's component property API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Create an issue on GitHub
- Check existing patterns for examples
- Refer to MUI documentation for component details