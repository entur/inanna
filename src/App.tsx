import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header.tsx';
import Home from './pages/Home';
import DataOverview from './pages/DataOverview';
import MapView from './pages/MapView';
import { SearchProvider } from './components/search';
import { CssBaseline, Toolbar, Box, ThemeProvider } from '@mui/material';
import { useCustomization } from './contexts/CustomizationContext.tsx';
import { useAppTheme } from './hooks/useAppTheme';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  const { useCustomFeatures } = useCustomization();

  const { theme } = useAppTheme(useCustomFeatures);

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <SearchProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header />
          <Toolbar />
          <Box className="app-root">
            <Box className="app-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/data" element={<ProtectedRoute element={<DataOverview />} />} />
                <Route path="/map" element={<MapView />} />
              </Routes>
            </Box>
          </Box>
        </ThemeProvider>
      </SearchProvider>
    </BrowserRouter>
  );
}
