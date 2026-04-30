import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, CssBaseline, Toolbar, AppBar, Typography, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Avatar, Tooltip, useMediaQuery, useTheme,
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
  Logout as LogoutIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Coiffeurs',       icon: <PeopleIcon />,    path: '/hairdressers' },
  { text: 'Salons',          icon: <StoreIcon />,     path: '/salons' },
  { text: 'Réservations',    icon: <CalendarIcon />,  path: '/bookings' },
  { text: 'Utilisateurs',    icon: <PeopleIcon />,    path: '/users' },
  { text: 'Coiffures',       icon: <HairstyleIcon />, path: '/hairstyles' },
  { text: 'Paramètres',      icon: <SettingsIcon />,  path: '/settings' },
];

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = React.useState(!isMobile);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout, user } = useAuth();

  // Ferme automatiquement sur mobile après navigation
  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setOpen(false);
  };

  React.useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const drawerContent = (
    <>
      {/* Logo */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 2, minHeight: 60,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: 'linear-gradient(135deg, #6C63FF, #9D97FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HairstyleIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Typography fontWeight={700} fontSize={18} color="#fff">HairGov</Typography>
        </Box>
        <IconButton onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', p: 0.5 }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, pt: 2, px: 1.5, overflowY: 'auto' }}>
        <Typography variant="caption" sx={{
          px: 1.5, color: 'rgba(255,255,255,0.35)',
          fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Menu principal
        </Typography>
        <List sx={{ mt: 1 }} disablePadding>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNav(item.path)}
                  sx={{
                    borderRadius: 2, py: 1, px: 1.5,
                    bgcolor: active ? 'rgba(108,99,255,0.25)' : 'transparent',
                    '&:hover': { bgcolor: active ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)' },
                    transition: 'background .15s',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: active ? '#9D97FF' : 'rgba(255,255,255,0.5)' }}>
                    {React.cloneElement(item.icon, { fontSize: 'small' })}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    }}
                  />
                  {active && (
                    <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: '#6C63FF', ml: 1 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* User info */}
      <Box sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#6C63FF', fontSize: 13 }}>
            {(user as any)?.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography fontSize={13} fontWeight={600} color="#fff" noWrap>
              {(user as any)?.full_name || 'Administrateur'}
            </Typography>
            <Typography fontSize={11} color="rgba(255,255,255,0.45)" noWrap>Admin</Typography>
          </Box>
          <Tooltip title="Déconnexion">
            <IconButton
              size="small"
              onClick={() => { logout(); navigate('/login', { replace: true }); }}
              sx={{ color: 'rgba(255,255,255,0.45)', '&:hover': { color: '#fff' } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );

  const drawerSx = {
    width: DRAWER_WIDTH,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: DRAWER_WIDTH,
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)',
      border: 'none',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
    },
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* ─── AppBar ─── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: '#fff',
          borderBottom: '1px solid #E8EAF0',
          color: 'text.primary',
          width: { md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml:    { md: open ? `${DRAWER_WIDTH}px` : 0 },
          transition: 'width .2s, margin .2s',
        }}
      >
        <Toolbar sx={{ minHeight: '60px !important', px: { xs: 2, md: 3 } }}>
          {/* Hamburger — toujours visible sur mobile, visible sur desktop quand fermé */}
          {(!open || isMobile) && (
            <IconButton onClick={() => setOpen(true)} sx={{ mr: 1.5 }} edge="start">
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" fontWeight={700} color="primary" sx={{ flexGrow: 1, fontSize: { xs: 15, md: 18 } }}>
            HairGov Admin
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
              {(user as any)?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Tooltip title="Déconnexion">
              <IconButton
                onClick={() => { logout(); navigate('/login', { replace: true }); }}
                size="small"
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ─── Drawer mobile (temporaire / overlay) ─── */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            ...drawerSx,
            '& .MuiDrawer-paper': {
              ...drawerSx['& .MuiDrawer-paper'],
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* ─── Drawer desktop (persistant) ─── */}
      {!isMobile && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          sx={drawerSx}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* ─── Main content ─── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: open ? `${DRAWER_WIDTH}px` : 0 },
          transition: 'margin .2s',
          mt: '60px',
          p: { xs: 1.5, sm: 2, md: 3 },
          minHeight: 'calc(100vh - 60px)',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
