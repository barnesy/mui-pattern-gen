import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { DashboardExample } from './pages/DashboardExample';
import { SubComponentDebug } from './pages/SubComponentDebug';
import { SimpleSubComponentTest } from './pages/SimpleSubComponentTest';
import { SettingsPanelTest } from './pages/SettingsPanelTest';
import { ErrorBoundary } from './components/ErrorBoundary';
import { theme as baseTheme } from './theme/theme';
import { darkPalette } from './theme';
import './styles/darkMode.css';

function AppWithDensity() {
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

  const toggleColorMode = () => {
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
  };

  const toggleDensity = () => {
    setDensity((prevDensity) => {
      const newDensity = 
        prevDensity === 'comfortable' ? 'compact' : 
        prevDensity === 'compact' ? 'spacious' : 
        'comfortable';
      localStorage.setItem('mui-pattern-gen-density', newDensity);
      return newDensity;
    });
  };

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

  return (
    <AIDesignThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ResponsiveLayout 
                toggleColorMode={toggleColorMode} 
                isDarkMode={mode === 'dark'}
                toggleDensity={toggleDensity}
                density={density}
              />
            }
          >
            <Route index element={<Home />} />
            <Route path="components" element={<ComponentShowcase />} />
            <Route path="theme" element={<ThemeViewer />} />
            <Route path="theme-editor" element={<ThemeEditor />} />
            <Route path="patterns" element={<PatternViewer />} />
            <Route path="pattern-generator" element={<PatternGenerator />} />
            <Route path="pattern-studio" element={<PatternGenerator />} />
            <Route path="dashboard-example" element={<DashboardExample />} />
            <Route path="debug/subcomponents" element={<SubComponentDebug />} />
            <Route path="debug/simple" element={<SimpleSubComponentTest />} />
            <Route path="debug/settings" element={<SettingsPanelTest />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AIDesignThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DensityModeProvider>
        <AppWithDensity />
      </DensityModeProvider>
    </ErrorBoundary>
  );
}

export default App;