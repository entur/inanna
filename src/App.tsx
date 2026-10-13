import { BrowserRouter, Routes, Route } from 'react-router';
import Header from './components/header/Header.tsx';
import Home from './pages/Home';
import StopPlaceView from './pages/StopPlaceView.tsx';
import MapView from './pages/MapView';
import { SearchProvider } from './components/search';
import { CssBaseline, Toolbar, Box, ThemeProvider } from '@mui/material';
import { useCustomization } from './contexts/CustomizationContext.tsx';
import { useAppTheme } from './hooks/useAppTheme';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EditingProvider } from './contexts/EditingContext.tsx';
import SessionExpiredDialog from './components/dialogs/SessionExpiredDialog.tsx';
import ProductView from './pages/ProductView.tsx';

export default function App() {
  const { useCustomFeatures } = useCustomization();

  const { theme } = useAppTheme(useCustomFeatures);

  return (
    <BrowserRouter>
      <SearchProvider>
        <ThemeProvider theme={theme}>
          <EditingProvider>
            <CssBaseline />
            <Header />
            <Toolbar
              sx={{
                minHeight: { xs: '64px' },
              }}
            />
            <Box className="app-root">
              <Box className="app-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/data" element={<ProtectedRoute element={<StopPlaceView />} />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/product" element={<ProductView />} />
                </Routes>
              </Box>
            </Box>
            <SessionExpiredDialog />
          </EditingProvider>
        </ThemeProvider>
      </SearchProvider>
    </BrowserRouter>
  );
}
