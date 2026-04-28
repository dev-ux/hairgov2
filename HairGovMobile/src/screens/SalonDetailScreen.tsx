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
import { FavoriteButton } from '../components/FavoriteButton';

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

// Solution temporaire : mapper les URLs manquantes vers des images existantes
const getWorkingImageUrl = (originalUrl: string): string => {
    // Si c'est déjà une URL complète (Cloudinary), la retourner directement
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
        console.log('getWorkingImageUrl - URL complète détectée:', originalUrl);
        return originalUrl;
    }

    // Extraire le nom du fichier de l'URL
    const filename = originalUrl.split('/').pop() || '';

    // Construire l'URL correcte sans /api/v1/
    const baseUrl = 'https://hairgov2.onrender.com';
    return `${baseUrl}/uploads/photos/${filename}`;
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
            console.log('Status detail salon:', response.status);

            // 1) Gérer le 304 AVANT tout parse JSON
            if (response.status === 304) {
                // Si tu n'as pas de cache local pour ce salon, considère que c'est une erreur
                throw new Error('Les données du salon n’ont pas changé (304) et aucune donnée locale n’est disponible.');
            }

            // 2) Gérer les autres erreurs
            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData?.message) {
                        errorMessage = errorData.message;
                    }
                } catch {
                    // body vide ou non JSON
                }
                throw new Error(errorMessage);
            }

            // 3) Ici seulement, on parse le JSON
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

    // Protection supplémentaire - ne pas rendre si salon est null
    if (!salon) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* En-tête avec bouton de retour */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Salon Details</Text>
                <View style={styles.favoriteContainer}>
                    {salon?.id && (
                        <FavoriteButton itemId={salon.id} itemType="salon" size={24} />
                    )}
                </View>
            </View>

            <View style={styles.contentContainer}>
                {/* Photo principale du salon */}
                {salon.photos && Array.isArray(salon.photos) && salon.photos.length > 0 && (
                    <View style={styles.photoContainer}>
                        {(() => {
                            const firstPhoto = salon.photos[0];
                            if (firstPhoto && typeof firstPhoto === 'string') {
                                try {
                                    const imageUrl = getWorkingImageUrl(firstPhoto);
                                    return (
                                        <Image
                                            source={{ uri: imageUrl, cache: 'reload' }}
                                            style={styles.mainPhoto}
                                            resizeMode="cover"
                                            onError={(e) => {
                                                console.error('Erreur de chargement de la photo principale:', {
                                                    error: e.nativeEvent.error,
                                                    photo: firstPhoto,
                                                    mappedUrl: imageUrl
                                                });
                                            }}
                                        />
                                    );
                                } catch (error) {
                                    console.error('Erreur dans getWorkingImageUrl:', error);
                                    return null;
                                }
                            }
                            return null;
                        })()}
                    </View>
                )}

                {/* Nom du salon */}
                <Text style={styles.salonName} numberOfLines={2}>
                    {salon.name}
                </Text>

                {/* Adresse */}
                <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={20} color="#6C63FF" />
                    <Text style={styles.address}>{salon.address}</Text>
                </View>

                {/* Galerie de photos */}
                {salon.photos && Array.isArray(salon.photos) && salon.photos.length > 1 && (
                    <View style={styles.galleryContainer}>
                        <Text style={styles.sectionTitle}>Photos</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.galleryScroll}
                        >
                            {salon.photos.map((photo, index) => {
                                if (!photo || typeof photo !== 'string') {
                                    return null;
                                }
                                try {
                                    const imageUrl = getWorkingImageUrl(photo);
                                    return (
                                        <View key={index} style={styles.galleryItem}>
                                            {imageUrl ? (
                                                <Image
                                                    source={{ uri: imageUrl, cache: 'reload' }}
                                                    style={styles.galleryPhoto}
                                                    resizeMode="cover"
                                                    onError={(e) => {
                                                        console.error('Erreur de chargement de la photo de la galerie:', {
                                                            error: e.nativeEvent.error,
                                                            photo: photo,
                                                            mappedUrl: imageUrl
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                <View style={[styles.galleryPhoto, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                                                    <Ionicons name="image-outline" size={30} color="#999" />
                                                </View>
                                            )}
                                        </View>
                                    );
                                } catch (error) {
                                    console.error('Erreur dans getWorkingImageUrl:', error);
                                    return null;
                                }
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Carte de localisation */}
                <View style={styles.mapContainer}>
                    <Text style={styles.sectionTitle}>Localisation</Text>
                    <TouchableOpacity
                        style={styles.mapWrapper}
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
    // Contenu principal
    contentContainer: {
        padding: 16,
    },
    // En-tête
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
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
    favoriteContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    // Photo principale
    photoContainer: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#f5f5f5',
    },
    mainPhoto: {
        width: '100%',
        height: '100%',
    },
    // Nom du salon
    salonName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    // Adresse
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    address: {
        marginLeft: 8,
        color: '#666',
        flex: 1,
        fontSize: 16,
    },
    // Galerie de photos
    galleryContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    galleryScroll: {
        paddingLeft: 0,
        paddingRight: 16,
    },
    galleryItem: {
        marginRight: 12,
        borderRadius: 8,
        overflow: 'hidden',
        width: 200,
        height: 150,
    },
    galleryPhoto: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    // Carte de localisation
    mapContainer: {
        marginTop: 20,
    },
    mapWrapper: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    map: {
        flex: 1,
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
});

export default SalonDetailScreen;
