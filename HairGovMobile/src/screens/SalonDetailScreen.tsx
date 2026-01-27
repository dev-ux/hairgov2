import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Platform,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { API_URL } from '../config/constants';

// Fonction utilitaire pour formater les URLs d'images
const formatImageUrl = (url: string) => {
  try {
    if (!url) {
      return null;
    }

    // Nettoyer l'URL (supprimer les accolades, espaces, guillemets et autres caractères invalides)
    let cleanUrl = url.replace(/[{}"']/g, '').trim();

    // Si l'URL est déjà une URL complète, la retourner telle quelle
    if (cleanUrl.startsWith('http')) {
      return cleanUrl;
    }

    // Si l'URL commence par /uploads/photos/, la nettoyer et construire l'URL complète
    if (cleanUrl.startsWith('/uploads/photos/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      return `${baseUrl}${cleanUrl}`;
    }

    // Si l'URL commence par /uploads/, la nettoyer et construire l'URL complète
    if (cleanUrl.startsWith('/uploads/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      return `${baseUrl}${cleanUrl}`;
    }

    // Si l'URL commence par photos-, construire l'URL complète
    if (cleanUrl.startsWith('photos-')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      return `${baseUrl}/uploads/photos/${cleanUrl}`;
    }

    // Si l'URL ne contient que le nom du fichier sans préfixe
    if (!cleanUrl.includes('/')) {
      const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
      return `${baseUrl}/uploads/photos/${cleanUrl}`;
    }

    // Pour tout autre cas, essayer de construire avec /uploads/photos/
    const baseUrl = API_URL.replace('/api/v1', '').replace(/\/$/, '');
    const fileName = cleanUrl.split('/').pop();
    return `${baseUrl}/uploads/photos/${fileName}`;
  } catch (error) {
    console.error('Erreur lors du formatage de l\'URL:', error);
    return null;
  }
};

type RootStackParamList = {
    Home: undefined;
    SalonDetail: { salonId: string };
    Booking: { salonId: string; salonName: string };
};

type SalonDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SalonDetail'>;
type SalonDetailScreenRouteProp = RouteProp<RootStackParamList, 'SalonDetail'>;

interface Hairdresser {
    id: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    profile_photo: string | null;
}

interface SalonDetail {
    id: string;
    name: string;
    address: string;
    description?: string;
    latitude: string | number;
    longitude: string | number;
    photos: string[];
    is_validated?: boolean;
    created_at: string;
    updated_at: string;
    hairdresser?: Hairdresser;
}

const { width } = Dimensions.get('window');

const SalonDetailScreen = () => {
    const navigation = useNavigation<SalonDetailScreenNavigationProp>();
    const route = useRoute<SalonDetailScreenRouteProp>();

    // Configuration de l'en-tête avec bouton de retour personnalisé
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        marginLeft: 10,
                        padding: 8,
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const [salon, setSalon] = useState<SalonDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const salonId = route.params?.salonId;

    const fetchSalonDetails = useCallback(async () => {
        if (!salonId) {
            setError('Aucun identifiant de salon fourni');
            setLoading(false);
            return;
        }

        try {
            console.log('Récupération des détails du salon:', salonId);
            const response = await fetch(`${API_URL}/salons/${salonId}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Données reçues:', JSON.stringify(data, null, 2));

            if (data.success && data.data) {
                // Validation des données reçues
                const salonData = data.data;
                
                // S'assurer que les coordonnées sont des nombres valides
                if (salonData.latitude) {
                    salonData.latitude = parseFloat(salonData.latitude);
                }
                if (salonData.longitude) {
                    salonData.longitude = parseFloat(salonData.longitude);
                }
                
                // Validation des coordonnées
                if (isNaN(salonData.latitude) || isNaN(salonData.longitude)) {
                    console.warn('Coordonnées GPS invalides, utilisation de valeurs par défaut');
                    salonData.latitude = 48.8566; // Paris par défaut
                    salonData.longitude = 2.3522;
                }
                
                setSalon(salonData);
            } else {
                throw new Error(data.message || 'Données du salon non disponibles');
            }
        } catch (err) {
            console.error('Erreur lors du chargement du salon:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [salonId]);

    useEffect(() => {
        fetchSalonDetails();
    }, [fetchSalonDetails]);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        fetchSalonDetails();
    };

    const handlePhonePress = (phoneNumber?: string) => {
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`);
        }
    };

    const handleMapPress = () => {
        if (!salon) return;

        const lat = Number(salon.latitude);
        const lng = Number(salon.longitude);
        const label = encodeURIComponent(salon.name);

        const url = Platform.select({
            ios: `maps:${lat},${lng}?q=${label}`,
            android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
            default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        });

        if (url) {
            Linking.openURL(url).catch(console.error);
        }
    };

    const handleBookPress = () => {
        if (!salon) return;
        navigation.navigate('Booking', {
            salonId: salon.id,
            salonName: salon.name
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    if (error || !salon) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                    {error || 'Aucune donnée disponible pour ce salon'}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* En-tête avec l'image */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails du Salon</Text>
                <View style={{ width: 24 }} /> {/* Pour équilibrer le flexbox */}
            </View>

            <View style={styles.contentContainer}>
                {/* En-tête avec le nom et la vérification */}
                <View style={styles.headerRow}>
                    <Text style={styles.salonName} numberOfLines={2}>
                        {salon.name}
                    </Text>
                    {salon.is_validated && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={styles.verifiedText}>Vérifié</Text>
                        </View>
                    )}
                </View>

                {/* Adresse */}
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#6C63FF" />
                    <Text style={styles.address}>{salon.address}</Text>
                </View>

                {/* Coiffeur */}
                {salon.hairdresser ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Coiffeur</Text>
                        <View style={styles.hairdresserInfo}>
                            {salon.hairdresser.profile_photo ? (
                                <Image
                                    source={{ uri: salon.hairdresser.profile_photo }}
                                    style={styles.avatar}
                                    onError={() => {
                                        if (salon.hairdresser) {
                                            setSalon({
                                                ...salon,
                                                hairdresser: { ...salon.hairdresser, profile_photo: '' }
                                            });
                                        }
                                    }}
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Ionicons name="person" size={24} color="#fff" />
                                </View>
                            )}
                            <View>
                                <Text style={styles.hairdresserName}>
                                    {salon.hairdresser.full_name || 
                                     `${salon.hairdresser.first_name || ''} ${salon.hairdresser.last_name || ''}`.trim() || 
                                     'Nom non disponible'}
                                </Text>
                                {salon.hairdresser.phone && (
                                    <TouchableOpacity
                                        style={styles.phoneButton}
                                        onPress={() => handlePhonePress(salon.hairdresser?.phone)}
                                    >
                                        <Ionicons name="call-outline" size={16} color="#6C63FF" />
                                        <Text style={styles.phoneText}>{salon.hairdresser.phone}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Coiffeur</Text>
                        <Text style={styles.hairdresserName}>Informations non disponibles</Text>
                    </View>
                )}

                {/* Photos du salon */}
                {salon.photos && Array.isArray(salon.photos) && salon.photos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Photos</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.photosContainer}
                        >
                            {salon.photos.map((photo, index) => {
                                const imageUrl = formatImageUrl(photo);
                                return (
                                    <View key={index} style={styles.photoItem}>
                                        <Image
                                            source={imageUrl ? { uri: imageUrl, cache: 'reload' } : require('../assets/url_de_l_image_1.jpg')}
                                            style={styles.photoImage}
                                            resizeMode="cover"
                                            onError={(e) => {
                                                console.error('Erreur de chargement de la photo du salon:', {
                                                    error: e.nativeEvent.error,
                                                    photo: photo,
                                                    formattedUrl: imageUrl
                                                });
                                            }}
                                        />
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Description */}
                {salon.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{salon.description}</Text>
                    </View>
                )}

                {/* Carte */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Localisation</Text>
                    <TouchableOpacity
                        style={styles.mapContainer}
                        onPress={handleMapPress}
                        activeOpacity={0.8}
                    >
                        {salon.latitude && salon.longitude ? (
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: Number(salon.latitude) || 48.8566,
                                    longitude: Number(salon.longitude) || 2.3522,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: Number(salon.latitude) || 48.8566,
                                        longitude: Number(salon.longitude) || 2.3522,
                                    }}
                                    title={salon.name}
                                    description={salon.address}
                                />
                            </MapView>
                        ) : (
                            <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
                                <Ionicons name="location-outline" size={40} color="#ccc" />
                                <Text style={{ color: '#999', marginTop: 8 }}>Localisation non disponible</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Boutons d'action */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleBookPress}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Réserver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={handleMapPress}
                    >
                        <Ionicons name="navigate-outline" size={20} color="#6C63FF" />
                        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Y aller</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Conteneur principal
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 40,
    },
    // En-tête avec l'image
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#f5f5f5',
    },
    salonImage: {
        width: '100%',
        height: '100%',
    },
    noImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e1e1e1',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    // Contenu principal
    contentContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    salonName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    verifiedText: {
        color: '#4CAF50',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
    // Informations de base
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    address: {
        marginLeft: 8,
        color: '#666',
        flex: 1,
    },
    // Section coiffeur
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    hairdresserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    avatarPlaceholder: {
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hairdresserName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    phoneText: {
        color: '#6C63FF',
        marginLeft: 4,
        fontSize: 14,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    // Description
    description: {
        color: '#666',
        lineHeight: 22,
    },
    // Carte
    mapContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    map: {
        flex: 1,
    },
    // Boutons d'action
    buttonsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    primaryButton: {
        backgroundColor: '#6C63FF',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#6C63FF',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
    },
    secondaryButtonText: {
        color: '#6C63FF',
    },
    // États
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    errorText: {
        color: '#f44336',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    // Styles pour les photos
    photosContainer: {
        paddingLeft: 0,
        paddingRight: 16,
    },
    photoItem: {
        marginRight: 12,
        borderRadius: 8,
        overflow: 'hidden',
        width: 200,
        height: 150,
    },
    photoImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
});

export default SalonDetailScreen;
