import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  CssBaseline,
  Toolbar,
  AppBar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  styled
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  ContentCut as HairstyleIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 300; // Largeur du menu latéral

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  width: `calc(100% - ${drawerWidth}px)`,
  ...(open && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    width: '100%',
  }),
}));

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Coiffeurs', icon: <PeopleIcon />, path: '/hairdressers' },
  { text: 'Salons', icon: <StoreIcon />, path: '/salons' },
  { text: 'Réservations', icon: <CalendarIcon />, path: '/bookings' },
  { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/users' },
  { text: 'Hairstyles', icon: <HairstyleIcon />, path: '/hairstyles' },
  { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
];

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* En-tête */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin - HairGov
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="Déconnexion">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Barre latérale */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            paddingTop: '64px',
            position: 'fixed',
            height: '100vh',
            zIndex: (theme) => theme.zIndex.drawer - 1,
            boxShadow: 3,
            border: 'none',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 8px 16px', justifyContent: 'flex-end' }}>
          <ChevronLeftIcon onClick={handleDrawerClose} sx={{ cursor: 'pointer' }} />
        </div>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              disablePadding
            >
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Contenu principal */}
      <Main open={open}>
        <Toolbar /> {/* Pour compenser l'app bar fixe */}
        {children || <Outlet />}
      </Main>
    </Box>
  );
};

export default AdminLayout;
