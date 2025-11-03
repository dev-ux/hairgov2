// Configuration de l'application
export const API_URL = 'http://localhost:3000';

// Types pour la navigation
declare global {
  type RootStackParamList = {
    Home: undefined;
    Barber: undefined;
    Booking: undefined;
    Map: undefined;
    BarberProfile: { hairdresserId: string };
  }

  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
