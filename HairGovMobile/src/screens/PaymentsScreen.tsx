import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type PaymentsScreenNavigationProp = NavigationProp<RootStackParamList, 'Payments'>;

type Payment = {
  id: string;
  date: string;
  amount: string;
  status: 'payé' | 'en attente' | 'échoué';
  service: string;
  method: string;
};

export const PaymentsScreen = () => {
  // Données factices pour l'exemple
  const payments: Payment[] = [
    { 
      id: '1', 
      date: '05 Nov 2023', 
      amount: '35,00 €', 
      status: 'payé',
      service: 'Coupe homme',
      method: 'Carte bancaire'
    },
    { 
      id: '2', 
      date: '01 Nov 2023', 
      amount: '65,00 €', 
      status: 'payé',
      service: 'Coloration + Soin',
      method: 'PayPal'
    },
  ];

    const navigation = useNavigation<PaymentsScreenNavigationProp>();
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'payé':
        return styles.statusPaid;
      case 'en attente':
        return styles.statusPending;
      case 'échoué':
        return styles.statusFailed;
      default:
        return {};
    }
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View>
          <Text style={styles.amount}>{item.amount}</Text>
          <Text style={styles.service}>{item.service}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.method}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.receiptButton}>
        <Ionicons name="receipt-outline" size={18} color="#007AFF" />
        <Text style={styles.receiptButtonText}>Voir le reçu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
         {/* En-tête personnalisé avec bouton de retour */}
              <View style={styles.headerContainer}>
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails du coiffeur</Text>
                <View style={{ width: 24 }} /> {/* Pour équilibrer le flexbox */}
              </View>
      <Text style={styles.title}>Paiements</Text>
      
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde disponible</Text>
        <Text style={styles.balanceAmount}>120,50 €</Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Ajouter des fonds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Ionicons name="arrow-up" size={18} color="#007AFF" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Retirer</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Historique des transactions</Text>
      
      {payments.length > 0 ? (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Aucun paiement récent</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  service: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusPaid: {
    backgroundColor: '#e6f7e6',
  },
  statusPending: {
    backgroundColor: '#fff8e6',
  },
  statusFailed: {
    backgroundColor: '#ffe6e6',
  },
  paymentDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  receiptButtonText: {
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default PaymentsScreen;
