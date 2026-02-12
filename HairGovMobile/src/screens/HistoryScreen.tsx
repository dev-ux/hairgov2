import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/constants';

interface HistoryItem {
  id: string;
  type: 'appointment' | 'service' | 'payment';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'cancelled' | 'pending';
  price?: number;
  salon_name?: string;
  hairstyle_name?: string;
}

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/user/history`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.data);
      } else {
        setError('Impossible de charger l\'historique');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur lors du chargement de l\'historique:', err);
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    // Récupérer le token depuis AsyncStorage ou votre système de stockage
    return 'your-token-here';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'appointment': return 'calendar-outline';
      case 'service': return 'cut-outline';
      case 'payment': return 'card-outline';
      default: return 'document-outline';
    }
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.type) as any} 
            size={20} 
            color="#fff" 
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Terminé' : 
             item.status === 'cancelled' ? 'Annulé' : 'En cours'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.itemDescription}>{item.description}</Text>
      
      {item.price && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Montant:</Text>
          <Text style={styles.priceAmount}>{item.price}€</Text>
        </View>
      )}
      
      {item.salon_name && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>{item.salon_name}</Text>
        </View>
      )}
      
      {item.hairstyle_name && (
        <View style={styles.serviceContainer}>
          <Ionicons name="cut-outline" size={14} color="#666" />
          <Text style={styles.serviceText}>{item.hairstyle_name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement de l\'historique...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="sad-outline" size={50} color="#999" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    padding: 16,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default HistoryScreen;
