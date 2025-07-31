import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { AIDesignThemeProvider } from './providers/AIDesignThemeProvider';
import { DensityModeProvider, DensityMode } from './contexts/DensityModeContext';
import { ResponsiveLayout } from './components/layout/ResponsiveLayout';
import { Home } from './pages/Home';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { ThemeViewer } from './pages/ThemeViewer';
import { ThemeEditor } from './pages/ThemeEditor';
import { PatternGenerator } from './pages/PatternGenerator';
import { PatternViewer } from './pages/PatternViewer';
import { PrototypeViewer } from './pages/PrototypeViewer';
import { DashboardExample } from './pages/DashboardExample';
import GovProcurementDashboard from './pages/GovProcurementDashboard';
import SubComponentTest from './pages/SubComponentTest';
import { SubComponentDebug } from './pages/SubComponentDebug';
import { SimpleSubComponentTest } from './pages/SimpleSubComponentTest';
import { SettingsPanelTest } from './pages/SettingsPanelTest';
import TestSubComponents from './pages/TestSubComponents';
import SubComponentUpdateTest from './pages/SubComponentUpdateTest';
import SimpleSubComponentDebug from './pages/SimpleSubComponentDebug';
import { SchemaDemo } from './pages/SchemaDemo';
import { DesignSystemDemo } from './pages/DesignSystemDemo';
import { DesignSystemTest } from './pages/DesignSystemTest';
import { PureDesignSystem } from './pages/PureDesignSystem';
import { EnhancedDesignSystem } from './pages/EnhancedDesignSystem';
import { DesignWithPatterns } from './pages/DesignWithPatterns';
import { NestedDesignSystem } from './pages/NestedDesignSystem';
import { DragDropDesignSystem } from './pages/DragDropDesignSystem';
import { ErrorBoundary } from './components/ErrorBoundary';
import { theme as baseTheme } from './theme/theme';
import { darkPalette } from './theme';
import './styles/darkMode.css';

function AppWithDensity(): React.ReactElement {
  const [mode, setMode] = React.useState<PaletteMode>('light');
  const [density, setDensity] = React.useState<DensityMode>(() => {
    const stored = localStorage.getItem('mui-pattern-gen-density');
    return (stored as DensityMode) || 'comfortable';
  });

  const densitySpacing = density === 'compact' ? 6 : density === 'spacious' ? 10 : 8;

  const theme = React.useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: mode === 'light' ? baseTheme.palette : darkPalette,
        spacing: densitySpacing,
        components: {
          ...baseTheme.components,
          MuiButton: {
            ...baseTheme.components?.MuiButton,
            defaultProps: {
              size: density === 'compact' ? 'small' : density === 'spacious' ? 'large' : 'medium',
            },
          },
          MuiTextField: {
            ...baseTheme.components?.MuiTextField,
            defaultProps: {
              size: density === 'compact' ? 'small' : 'medium',
            },
          },
          MuiTable: {
            ...baseTheme.components?.MuiTable,
            defaultProps: {
              size: density === 'compact' ? 'small' : 'medium',
            },
          },
          MuiChip: {
            ...baseTheme.components?.MuiChip,
            defaultProps: {
              size: density === 'compact' ? 'small' : 'medium',
            },
          },
        },
      }),
    [mode, density, densitySpacing]
  );

  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      // Update Tailwind dark mode class
      if (newMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  }, []);

  const toggleDensity = React.useCallback(() => {
    setDensity((prevDensity) => {
      const newDensity =
        prevDensity === 'comfortable'
          ? 'compact'
          : prevDensity === 'compact'
            ? 'spacious'
            : 'comfortable';
      localStorage.setItem('mui-pattern-gen-density', newDensity);
      return newDensity;
    });
  }, []);

  // Set initial dark mode class and data attribute
  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-mui-color-scheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-mui-color-scheme', 'light');
    }
  }, [mode]);

  // Set density attribute
  React.useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const router = React.useMemo(() => {
    return createBrowserRouter(
      [
        {
          path: '/',
          element: (
            <ResponsiveLayout
              toggleColorMode={toggleColorMode}
              isDarkMode={mode === 'dark'}
              toggleDensity={toggleDensity}
              density={density}
            />
          ),
          children: [
            { index: true, element: <Home /> },
            { path: 'components', element: <ComponentShowcase /> },
            { path: 'theme', element: <ThemeViewer /> },
            { path: 'theme-editor', element: <ThemeEditor /> },
            { path: 'patterns', element: <PatternViewer /> },
            { path: 'prototypes', element: <PrototypeViewer /> },
            { path: 'pattern-generator', element: <PatternGenerator /> },
            { path: 'pattern-studio', element: <PatternGenerator /> },
            { path: 'dashboard-example', element: <DashboardExample /> },
            { path: 'gov-procurement', element: <GovProcurementDashboard /> },
            { path: 'subcomponent-test', element: <SubComponentTest /> },
            { path: 'debug/subcomponents', element: <SubComponentDebug /> },
            { path: 'debug/simple', element: <SimpleSubComponentTest /> },
            { path: 'debug/settings', element: <SettingsPanelTest /> },
            { path: 'test-subcomponents', element: <TestSubComponents /> },
            { path: 'subcomponent-update-test', element: <SubComponentUpdateTest /> },
            { path: 'simple-debug', element: <SimpleSubComponentDebug /> },
            { path: 'schema-demo', element: <SchemaDemo /> },
            { path: 'design-system', element: <DesignSystemDemo /> },
            { path: 'design-test', element: <DesignSystemTest /> },
            { path: 'pure-design', element: <PureDesignSystem /> },
            { path: 'enhanced-design', element: <EnhancedDesignSystem /> },
            { path: 'design-patterns', element: <DesignWithPatterns /> },
            { path: 'nested-design', element: <NestedDesignSystem /> },
            { path: 'drag-drop-design', element: <DragDropDesignSystem /> },
          ],
        },
      ],
      {
        future: {
          v7_startTransition: true,
        },
      }
    );
  }, [mode, density, toggleColorMode, toggleDensity]);

  return (
    <AIDesignThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </AIDesignThemeProvider>
  );
}

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <DensityModeProvider>
        <AppWithDensity />
      </DensityModeProvider>
    </ErrorBoundary>
  );
}

export default App;
