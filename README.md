# MUI Pattern Generator

A comprehensive Material-UI component showcase and pattern generator with AI-powered design mode for visual component selection and inspection.

## Features

- **Component Showcase**: Interactive showcase of MUI components organized by category
- **Theme Viewer**: Real-time theme visualization with light/dark mode switching
- **AI Design Mode**: Revolutionary visual component selector and inspector
  - Toggle from header button (next to dark mode)
  - Hover to highlight components with purple outline
  - Click to select components with orange outline
  - View component metadata, props, and hierarchy
  - Smart exclusions for optimal UX
- **Pattern Generator**: Create and customize UI patterns with:
  - Draggable and resizable dialog interface
  - Live theme customization
  - Color picker integration
  - Property controls for fine-tuning
- **Responsive Design**: Mobile-friendly layout with navigation drawer
- **Best Practices**: Demonstrates MUI + Tailwind CSS integration patterns
- **Custom Brand Colors**: Integrated Frontify design system colors

## Tech Stack

- **React 18** with TypeScript
- **Material-UI v5** for component library
- **Tailwind CSS** for utility styling
- **Vite** for fast development and building
- **React Router** for navigation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mui-pattern-gen
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── AIDesignMode/    # AI Design Mode components and overlay
│   ├── layout/          # Layout components (Navigation, ResponsiveLayout)
│   └── showcase/        # Component showcase examples
├── contexts/            # React contexts (AIDesignModeContext)
├── pages/               # Route pages
├── providers/           # Provider components (AIDesignThemeProvider)
├── styles/              # CSS files including AI Design Mode styles
├── theme/               # MUI theme configuration with brand colors
├── utils/               # Utility functions
├── App.tsx              # Main app component with routing
└── main.tsx            # Application entry point
```

## Key Features

### Component Showcase
Browse through categorized MUI components:
- **Inputs**: Text fields, buttons, selects, checkboxes
- **Data Display**: Tables, lists, typography, tooltips
- **Feedback**: Alerts, progress indicators, dialogs, snackbars
- **Surfaces**: Cards, paper, app bars, accordions
- **Navigation**: Tabs, breadcrumbs, drawers, menus

### Theme Viewer
- Visual representation of the current theme
- Toggle between light and dark modes
- View all theme colors and typography settings
- Real-time updates when theme changes
- Custom brand colors:
  - Primary: Purple (#4B3FFF)
  - Secondary: Orange (#F86A0B)
  - Success: Green (#3AAB68)
  - Error: Red (#ED4B48)

### AI Design Mode
- **Visual Component Selection**: Click the AI Design Mode button in the header
- **Interactive Highlighting**: 
  - Purple outline on hover
  - Orange outline and overlay for selected components
- **Component Information**: View detailed metadata including:
  - Component name and type
  - Props and variants
  - DOM hierarchy path
- **Smart Exclusions**: 
  - Header components remain stable
  - Selection controls (checkbox, radio, switch) excluded to prevent layout issues
  - Tooltips and modals properly handled

### Pattern Generator
- Create custom UI patterns
- Adjust colors, spacing, and other properties
- Export generated patterns for use in your projects
- Draggable dialog interface for better workspace management

## Customization

### Theme
Modify the theme in `src/theme/` to customize:
- Color palettes (`palette.ts`, `darkPalette.ts`)
- Typography settings (`typography.ts`)
- Component overrides (`components.ts`)

### Adding New Components
1. Create a new showcase file in `src/components/showcase/`
2. Add your component examples
3. Import and add to the appropriate category in `ComponentShowcase.tsx`

## Recent Updates

- **AI Design Mode**: Added revolutionary visual component inspector
  - Moved toggle from floating button to header for better accessibility
  - Fixed header stability and flickering issues
  - Excluded selection controls to prevent layout jumping
  - Removed debug panel for cleaner interface
- **Brand Colors**: Integrated Frontify design system colors throughout
- **UI Improvements**: 
  - Updated component showcase descriptions
  - Removed toolbar spacer above navigation menu
  - Enhanced dark mode with brand-appropriate colors

## License

MIT