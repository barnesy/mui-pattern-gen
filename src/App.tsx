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
import { GameHub } from './pages/GameHub';
import { ErrorBoundary } from './components/ErrorBoundary';
import { theme as baseTheme } from './theme/theme';
import { darkPalette } from './theme';

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

  // Set initial dark mode class
  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
            <Route path="patterns" element={<PatternGenerator />} />
            <Route path="game" element={<GameHub />} />
            <Route path="pattern-studio" element={<PatternGenerator />} />
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