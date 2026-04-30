import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { favoriteService, salonFavoriteService, hairstyleFavoriteService } from '../services/favoriteService';

interface FavoriteButtonProps {
  itemId: string;
  itemType?: 'hairdresser' | 'salon' | 'hairstyle';
  size?: number;
  style?: any;
  onToggle?: (isFavorited: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType = 'hairdresser',
  size = 24,
  style,
  onToggle,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading]         = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  // Vérifier l'état initial au montage
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const svc = itemType === 'salon' ? salonFavoriteService : itemType === 'hairstyle' ? hairstyleFavoriteService : favoriteService;
        const result = await svc.checkFavorite(itemId);
        if (!cancelled) setIsFavorited(result);
      } catch {
        // silencieux si pas connecté
      }
    };
    check();
    return () => { cancelled = true; };
  }, [itemId, itemType]);

  const animateBounce = () =>
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40 }),
    ]).start();

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);

    const willFavorite = !isFavorited;

    // Mise à jour optimiste immédiate
    setIsFavorited(willFavorite);
    animateBounce();

    try {
      const svc = itemType === 'salon' ? salonFavoriteService : itemType === 'hairstyle' ? hairstyleFavoriteService : favoriteService;
      const result = willFavorite
        ? await svc.addToFavorites(itemId)
        : await svc.removeFromFavorites(itemId);

      if (result.success) {
        onToggle?.(willFavorite);
      } else {
        // Rollback si échec
        setIsFavorited(!willFavorite);
        const code = result.error?.code;
        if (code === 'NO_TOKEN' || code === 'INVALID_TOKEN') {
          Alert.alert('Connexion requise', 'Connectez-vous pour gérer vos favoris');
        } else if (code !== 'ALREADY_FAVORITE') {
          Alert.alert('Erreur', result.error?.message || 'Impossible de mettre à jour les favoris');
        }
      }
    } catch {
      setIsFavorited(!willFavorite);
      Alert.alert('Erreur', 'Une erreur réseau est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      style={[{ padding: 8, justifyContent: 'center', alignItems: 'center' }, style]}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={isFavorited ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorited ? '#FF4757' : '#bbb'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};
