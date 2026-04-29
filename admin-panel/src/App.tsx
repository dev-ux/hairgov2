import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { CircularProgress, Box } from '@mui/material';

import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import SalonsPage from './pages/salons/SalonsPage';
import DetailSalon from './pages/salons/DetailSalon';
import EditSalon from './pages/salons/EditSalon';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const DashboardPage    = React.lazy(() => import('./pages/DashboardPage'));
const HairdressersPage = React.lazy(() => import('./pages/hairdressers/HairdressersPage'));
const DetailHairdresser= React.lazy(() => import('./pages/hairdressers/DetailHairdresser'));
const BookingsPage     = React.lazy(() => import('./pages/bookings/BookingsPage'));
const UsersPage        = React.lazy(() => import('./pages/users/UsersPage'));
const SettingsPage     = React.lazy(() => import('./pages/settings/SettingsPage'));
const HairstylesPage   = React.lazy(() => import('./pages/hairstyles/HairstylesPage'));

const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

export const theme = createTheme({
  palette: {
    primary:    { main: '#6C63FF', light: '#9D97FF', dark: '#4B44CC' },
    secondary:  { main: '#FF6584', light: '#FF94A8', dark: '#CC3D5A' },
    success:    { main: '#22C55E' },
    warning:    { main: '#F59E0B' },
    error:      { main: '#EF4444' },
    info:       { main: '#3B82F6' },
    background: { default: '#F0F2F8', paper: '#FFFFFF' },
    text:       { primary: '#1A1A2E', secondary: '#64748B' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,.06)',
    '0 2px 8px rgba(0,0,0,.08)',
    '0 4px 16px rgba(0,0,0,.10)',
    '0 8px 24px rgba(0,0,0,.12)',
    ...Array(20).fill('0 8px 32px rgba(0,0,0,.14)'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10, fontWeight: 600 },
        contained: { boxShadow: '0 2px 8px rgba(108,99,255,.35)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 14 },
        outlined: { border: '1px solid #E8EAF0' },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,.07)' } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 10 },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#F8F9FD',
            fontWeight: 600,
            color: '#64748B',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #E8EAF0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: alpha('#6C63FF', 0.03) },
          '&:last-child td': { border: 0 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottom: '1px solid #F1F3F9' } },
    },
  },
});

const ProtectedRoutes = () => (
  <ProtectedRoute adminOnly>
    <AdminLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<DashboardPage />} />
          <Route path="/salons"        element={<SalonsPage />} />
          <Route path="/salons/:id"    element={<DetailSalon />} />
          <Route path="/salons/edit/:id" element={<EditSalon />} />
          <Route path="/hairdressers"  element={<HairdressersPage />} />
          <Route path="/hairdressers/:id" element={<DetailHairdresser />} />
          <Route path="/bookings"      element={<BookingsPage />} />
          <Route path="/users"         element={<UsersPage />} />
          <Route path="/settings"      element={<SettingsPage />} />
          <Route path="/hairstyles"    element={<HairstylesPage />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  </ProtectedRoute>
);

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/*"      element={<ProtectedRoutes />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

export default App;
