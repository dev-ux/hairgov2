import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 70,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  scrollView: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  // Service type styles
  selectedHairdresserDetails: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedHairdresserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedHairdresserInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  selectedHairdresserRating: {
    marginTop: 5,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  // Service type styles
  serviceTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  serviceTypeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTypeButtonActive: {
    backgroundColor: '#e6f0ff',
    borderWidth: 1,
    borderColor: '#3a86ff',
  },
  serviceTypeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  serviceTypeTextActive: {
    color: '#3a86ff',
    fontWeight: '600',
  },
  serviceTypeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#3a86ff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTypeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Salon list styles
  salonListContainer: {
    marginTop: 10,
  },
  salonItemsContainer: {
    maxHeight: 250,
  },
  salonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedSalonItem: {
    borderColor: '#3a86ff',
    backgroundColor: '#f0f7ff',
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  salonAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  salonPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3a86ff',
  },
  // Map container
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  // Date time picker
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateTimeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  // Button styles
  button: {
    backgroundColor: '#3a86ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requiredInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  hairdresserName: {
    fontSize: 18,
    color: '#3a86ff',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
});
