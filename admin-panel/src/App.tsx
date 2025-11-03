import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { CircularProgress, Box } from '@mui/material';

// Layout et pages
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages avec chargement paresseux
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const SalonsPage = React.lazy(() => import('./pages/salons/SalonsPage'));
const HairdressersPage = React.lazy(() => import('./pages/hairdressers/HairdressersPage'));
const BookingsPage = React.lazy(() => import('./pages/bookings/BookingsPage'));
const UsersPage = React.lazy(() => import('./pages/users/UsersPage'));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));

// Composant de chargement
const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// Création du thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// Composant pour les routes protégées
const ProtectedRoutes = () => (
  <ProtectedRoute adminOnly>
    <AdminLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/salons" element={<SalonsPage />} />
          <Route path="/hairdressers" element={<HairdressersPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  </ProtectedRoute>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
