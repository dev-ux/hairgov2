// Import de la configuration depuis constants.ts
export { API_URL } from './config/constants';

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
