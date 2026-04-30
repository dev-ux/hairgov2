import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Tooltip, Alert, CircularProgress,
  Dialog, Button, Grid, Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  Close as CloseIcon,
  ContentCut as ScissorsIcon,
  AttachMoney as MoneyIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { getAllBookings, Booking, deleteBooking } from '../../services/booking.service';

/* ── Statuts ── */
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; chip: 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default' }> = {
  pending:     { label: 'En attente', color: '#F59E0B', bg: '#FFFBEB', chip: 'warning'  },
  confirmed:   { label: 'Confirmé',   color: '#3B82F6', bg: '#EFF6FF', chip: 'info'     },
  accepted:    { label: 'Accepté',    color: '#3B82F6', bg: '#EFF6FF', chip: 'info'     },
  in_progress: { label: 'En cours',   color: '#6C63FF', bg: '#EEF0FF', chip: 'primary'  },
  completed:   { label: 'Terminé',    color: '#22C55E', bg: '#F0FDF4', chip: 'success'  },
  cancelled:   { label: 'Annulé',     color: '#EF4444', bg: '#FEF2F2', chip: 'error'    },
};

function formatDate(d: string) {
  if (!d) return '–';
  return new Date(d).toLocaleString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getInitials(name: string) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

/* ── Info card ── */
const InfoCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: React.ReactNode;
}> = ({ icon, iconColor, label, value }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1.5,
    p: 1.5, borderRadius: 2.5,
    bgcolor: '#F8F9FD', border: '1px solid #F0F0F8',
  }}>
    <Box sx={{
      width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
      background: iconColor + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Box sx={{ fontSize: 18, color: iconColor, display: 'flex' }}>
        {icon}
      </Box>
    </Box>
    <Box minWidth={0}>
      <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', lineHeight: 1.3 }} noWrap>
        {value}
      </Typography>
    </Box>
  </Box>
);

/* ── Section label ── */
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{
    fontSize: 11, fontWeight: 700, color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    mb: 1.5, mt: 0.5,
  }}>
    {children}
  </Typography>
);

/* ── Main component ── */
const BookingsPage: React.FC = () => {
  const [bookings, setBookings]       = useState<Booking[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [selected, setSelected]       = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const fetchBookings = async (signal?: AbortSignal) => {
    try {
      setLoading(true); setError(null);
      const res = await getAllBookings(signal);
      if (res.success) setBookings(res.data);
      else setError(res.message || 'Erreur lors de la récupération');
    } catch (err: any) {
      if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED')
        setError('Erreur de connexion au serveur');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchBookings(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await deleteBooking(deleteTarget.id);
      if (res.success) {
        setBookings(prev => prev.filter(b => b.id !== deleteTarget.id));
        setDeleteTarget(null);
        if (selected?.id === deleteTarget.id) setSelected(null);
      } else setError('Erreur lors de la suppression');
    } catch { setError('Erreur lors de la suppression'); }
    finally { setDeleting(false); }
  };

  return (
    <Box>
      {/* ── Page header ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4">Réservations</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {bookings.length} réservation{bookings.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Tooltip title="Actualiser">
          <IconButton onClick={() => fetchBookings()} size="small" sx={{ bgcolor: '#F0F2F8' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* ── Table ── */}
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Coiffeur</TableCell>
                <TableCell>Date prévue</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CalendarIcon sx={{ fontSize: 48, color: '#C7D2FE', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">Aucune réservation</Typography>
                  </TableCell>
                </TableRow>
              ) : bookings.map(booking => {
                const s = STATUS_CONFIG[booking.status] || { label: booking.status, chip: 'default' as const };
                return (
                  <TableRow key={booking.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelected(booking)}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#6C63FF', fontSize: 12 }}>
                          {booking.client_name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{booking.client_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{booking.client_phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={booking.service_type === 'home' ? <HomeIcon /> : <StoreIcon />}
                        label={booking.service_type === 'home' ? 'À domicile' : 'En salon'}
                        size="small" variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{booking.hairdresser?.full_name || '–'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(booking.scheduled_time)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {booking.client_price ? `${Number(booking.client_price).toLocaleString('fr-FR')} FCFA` : '–'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={s.label} color={s.chip as any} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error"
                          onClick={e => { e.stopPropagation(); setDeleteTarget(booking); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ════════════════════════════════════════
          DIALOG DÉTAILS — design repensé
      ════════════════════════════════════════ */}
      <Dialog
        open={!!selected} onClose={() => setSelected(null)}
        maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden', maxHeight: '92vh' } }}
      >
        {selected && (() => {
          const cfg = STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending;
          const hasMap = !!(selected.latitude && selected.longitude);
          const isHome = selected.service_type === 'home';

          return (
            <>
              {/* ── Header gradient ── */}
              <Box sx={{
                background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 60%, #3D3A7A 100%)',
                px: 3, pt: 3, pb: 3.5,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Cercles décoratifs */}
                {[
                  { w: 220, h: 220, top: -80, right: -60, op: 0.07 },
                  { w: 140, h: 140, bottom: -50, left: -30, op: 0.06 },
                ].map((c, i) => (
                  <Box key={i} sx={{
                    position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
                    background: 'white', opacity: c.op,
                    top: (c as any).top, bottom: (c as any).bottom,
                    left: (c as any).left, right: (c as any).right,
                  }} />
                ))}

                {/* Bouton fermer */}
                <IconButton onClick={() => setSelected(null)} size="small" sx={{
                  position: 'absolute', top: 14, right: 14,
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}>
                  <CloseIcon fontSize="small" />
                </IconButton>

                {/* Avatar + nom client */}
                <Box display="flex" alignItems="center" gap={2} mb={2} sx={{ position: 'relative', zIndex: 1 }}>
                  <Avatar sx={{
                    width: 56, height: 56, fontSize: 20, fontWeight: 800,
                    background: 'linear-gradient(135deg, #6C63FF, #9D97FF)',
                    border: '3px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 24px rgba(108,99,255,0.4)',
                  }}>
                    {getInitials(selected.client_name)}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                      {selected.client_name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.8} mt={0.5}>
                      <PhoneIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }} />
                      <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                        {selected.client_phone}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Badges statut + service */}
                <Box display="flex" alignItems="center" gap={1} sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.6,
                    bgcolor: cfg.color + '28', border: `1px solid ${cfg.color}55`,
                    borderRadius: 2, px: 1.2, py: 0.5,
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cfg.color }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>
                      {cfg.label}
                    </Typography>
                  </Box>

                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.6,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    borderRadius: 2, px: 1.2, py: 0.5,
                  }}>
                    {isHome
                      ? <HomeIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }} />
                      : <StoreIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }} />}
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                      {isHome ? 'À domicile' : 'En salon'}
                    </Typography>
                  </Box>

                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.6,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    borderRadius: 2, px: 1.2, py: 0.5,
                  }}>
                    <CalendarIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                      {formatDate(selected.scheduled_time)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* ── Corps scrollable ── */}
              <Box sx={{ overflowY: 'auto', px: 3, py: 2.5, flex: 1 }}>

                {/* Infos clés */}
                <SectionLabel>Informations</SectionLabel>
                <Grid container spacing={1.5} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoCard icon={<TimeIcon />} iconColor="#6C63FF" label="Durée estimée"
                      value={`${selected.estimated_duration} min`} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoCard icon={<CalendarIcon />} iconColor="#3B82F6" label="Réservé le"
                      value={formatDate(selected.created_at)} />
                  </Grid>
                  {selected.started_at && (
                    <Grid item xs={12} sm={6}>
                      <InfoCard icon={<TimeIcon />} iconColor="#22C55E" label="Démarré le"
                        value={formatDate(selected.started_at)} />
                    </Grid>
                  )}
                  {selected.completed_at && (
                    <Grid item xs={12} sm={6}>
                      <InfoCard icon={<TimeIcon />} iconColor="#22C55E" label="Terminé le"
                        value={formatDate(selected.completed_at)} />
                    </Grid>
                  )}
                  {selected.cancellation_reason && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 1.5, bgcolor: '#FEF2F2', borderRadius: 2, border: '1px solid #FECACA' }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#EF4444', mb: 0.5, textTransform: 'uppercase' }}>
                          Motif d'annulation
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: '#DC2626' }}>
                          {selected.cancellation_reason}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Finances */}
                <SectionLabel>Finances</SectionLabel>
                <Grid container spacing={1.5} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoCard icon={<MoneyIcon />} iconColor="#F59E0B" label="Frais de service"
                      value={selected.service_fee ? `${Number(selected.service_fee).toLocaleString('fr-FR')} FCFA` : '–'} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoCard icon={<MoneyIcon />} iconColor="#22C55E" label="Prix client"
                      value={selected.client_price ? `${Number(selected.client_price).toLocaleString('fr-FR')} FCFA` : '–'} />
                  </Grid>
                </Grid>

                {/* Coiffeur & coiffure */}
                {(selected.hairdresser || selected.hairstyle) && (
                  <>
                    <SectionLabel>Prestataire & Coiffure</SectionLabel>
                    <Grid container spacing={1.5} mb={3}>
                      {selected.hairdresser && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            p: 1.5, borderRadius: 2.5,
                            bgcolor: '#F8F9FD', border: '1px solid #F0F0F8',
                          }}>
                            {selected.hairdresser.profile_photo ? (
                              <Avatar src={selected.hairdresser.profile_photo}
                                sx={{ width: 38, height: 38, border: '2px solid #E8EAF0' }} />
                            ) : (
                              <Avatar sx={{ width: 38, height: 38, bgcolor: '#6C63FF18', color: '#6C63FF' }}>
                                <PersonIcon sx={{ fontSize: 18 }} />
                              </Avatar>
                            )}
                            <Box minWidth={0}>
                              <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Coiffeur
                              </Typography>
                              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }} noWrap>
                                {selected.hairdresser.full_name}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {selected.hairstyle && (
                        <Grid item xs={12} sm={6}>
                          <InfoCard icon={<ScissorsIcon />} iconColor="#FF6584" label="Coiffure"
                            value={`${selected.hairstyle.name}${selected.hairstyle.category ? ` · ${selected.hairstyle.category}` : ''}`} />
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}

                {/* Localisation */}
                <SectionLabel>Localisation</SectionLabel>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1.5, mb: hasMap ? 1.5 : 0,
                  borderRadius: 2.5, bgcolor: '#F8F9FD', border: '1px solid #F0F0F8',
                }}>
                  <Box sx={{
                    width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
                    background: '#6C63FF18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LocationIcon sx={{ fontSize: 18, color: '#6C63FF' }} />
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Adresse
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>
                      {selected.location_address}
                    </Typography>
                  </Box>
                  {hasMap && (
                    <Tooltip title="Ouvrir dans Google Maps">
                      <IconButton
                        size="small"
                        component="a"
                        href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        sx={{ color: '#6C63FF', bgcolor: '#6C63FF12', '&:hover': { bgcolor: '#6C63FF22' } }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Carte */}
                {hasMap && (
                  <Box sx={{
                    borderRadius: 3, overflow: 'hidden',
                    border: '1px solid #E8EAF0',
                    position: 'relative', height: 280,
                    boxShadow: '0 4px 20px rgba(108,99,255,0.10)',
                    mb: 1,
                  }}>
                    <iframe
                      title="Localisation réservation"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(selected.longitude) - 0.008}%2C${Number(selected.latitude) - 0.008}%2C${Number(selected.longitude) + 0.008}%2C${Number(selected.latitude) + 0.008}&layer=mapnik&marker=${selected.latitude}%2C${selected.longitude}`}
                      style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
                      loading="lazy"
                    />
                    <Box sx={{
                      position: 'absolute', bottom: 10, left: 10,
                      bgcolor: 'rgba(255,255,255,0.94)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 2, px: 1.5, py: 0.75,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                      display: 'flex', alignItems: 'center', gap: 0.6,
                    }}>
                      <LocationIcon sx={{ fontSize: 12, color: '#6C63FF' }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>
                        {Number(selected.latitude).toFixed(5)}, {Number(selected.longitude).toFixed(5)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* ── Footer ── */}
              <Box sx={{
                px: 3, py: 2, borderTop: '1px solid #F0F2F8',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
                bgcolor: '#FAFBFF',
              }}>
                <Button
                  variant="outlined" color="error" size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => { setDeleteTarget(selected); setSelected(null); }}
                  sx={{ borderRadius: 2 }}
                >
                  Supprimer
                </Button>
                <Button
                  variant="contained" onClick={() => setSelected(null)}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Fermer
                </Button>
              </Box>
            </>
          );
        })()}
      </Dialog>

      {/* ── Delete confirm dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: 3, bgcolor: '#FEF2F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
          }}>
            <DeleteIcon sx={{ color: '#EF4444', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} mb={0.5}>Supprimer la réservation ?</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            La réservation de <strong>{deleteTarget?.client_name}</strong> sera définitivement supprimée. Cette action est irréversible.
          </Typography>
          <Box display="flex" gap={1.5}>
            <Button fullWidth variant="outlined" onClick={() => setDeleteTarget(null)} disabled={deleting}
              sx={{ borderRadius: 2 }}>
              Annuler
            </Button>
            <Button fullWidth variant="contained" color="error" disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              onClick={handleDelete} sx={{ borderRadius: 2 }}>
              {deleting ? 'Suppression…' : 'Supprimer'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default BookingsPage;
