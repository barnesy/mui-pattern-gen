import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { AIDesignThemeProvider } from './providers/AIDesignThemeProvider';
import { ResponsiveLayout } from './components/layout/ResponsiveLayout';
import { Home } from './pages/Home';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { ThemeViewer } from './pages/ThemeViewer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { theme as baseTheme } from './theme/theme';
import { darkPalette } from './theme';

function App() {
  const [mode, setMode] = React.useState<PaletteMode>('light');

  const theme = React.useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: mode === 'light' ? baseTheme.palette : darkPalette,
      }),
    [mode]
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

  // Set initial dark mode class
  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <ErrorBoundary>
      <AIDesignThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<ResponsiveLayout toggleColorMode={toggleColorMode} isDarkMode={mode === 'dark'} />}
            >
              <Route index element={<Home />} />
              <Route path="components" element={<ComponentShowcase />} />
              <Route path="theme" element={<ThemeViewer />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AIDesignThemeProvider>
    </ErrorBoundary>
  );
}

export default App;