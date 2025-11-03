import api from './api';

export const getDashboardStats = async () => {
  try {
    // Récupérer le nombre de coiffeurs
    const hairdressersRes = await api.get('/admin/hairdressers');
    const hairdressersCount = hairdressersRes.data?.data?.length || 0;

    // Récupérer le nombre de salons (à implémenter côté backend si nécessaire)
    const salonsRes = await api.get('/admin/salons');
    const salonsCount = salonsRes.data?.data?.length || 0;

    // Récupérer le nombre de réservations (à implémenter côté backend si nécessaire)
    const bookingsRes = await api.get('/admin/bookings');
    const bookingsCount = bookingsRes.data?.data?.length || 0;

    // Calculer les revenus (à implémenter côté backend si nécessaire)
    // Pour l'instant, on utilise une valeur statique
    const revenue = 2450; // À remplacer par la logique réelle

    return {
      hairdressersCount,
      salonsCount,
      bookingsCount,
      revenue
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      hairdressersCount: 0,
      salonsCount: 0,
      bookingsCount: 0,
      revenue: 0
    };
  }
};
