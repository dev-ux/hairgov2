// components/FavoriteButton.tsx
import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';
import { useSalonFavorites } from '../hooks/useSalonFavorites';

interface FavoriteButtonProps {
  itemId: string;
  itemType?: 'hairdresser' | 'salon' | 'hairstyle';
  size?: number;
  style?: any;
  onPress?: () => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType = 'hairdresser',
  size = 24,
  style,
  onPress
}) => {
  // Utiliser le hook approprié selon le type
  const hairdresserFavorites = useFavorites();
  const salonFavorites = useSalonFavorites();
  
  let toggleFavorite, isFavorite, loading;
  
  switch (itemType) {
    case 'salon':
      ({ toggleFavorite, isFavorite, loading } = salonFavorites);
      break;
    case 'hairdresser':
    default:
      ({ toggleFavorite, isFavorite, loading } = hairdresserFavorites);
      break;
  }

  const [scaleValue] = React.useState(new Animated.Value(1));

  const favorited = isFavorite(itemId);

  const handlePress = async () => {
    if (loading) return;

    console.log('🔍 FavoriteButton - handlePress:', {
      itemType,
      itemId,
      itemIdLength: itemId.length,
      itemIdStart: itemId.substring(0, 8) + '...'
    });

    // Protection: ne pas continuer si itemId est invalide
    if (!itemId || typeof itemId !== 'string') {
      console.error('FavoriteButton - Invalid itemId:', itemId);
      return;
    }

    // Animation du cœur
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Toggle du favori
      await toggleFavorite(itemId);
    } catch (error) {
      console.error('FavoriteButton - Error in toggleFavorite:', error);
    }
    
    // Callback personnalisé
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      style={[
        {
          padding: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
        }}
      >
        <Ionicons
          name={favorited ? 'heart' : 'heart-outline'}
          size={size}
          color={favorited ? '#FF4757' : '#666'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};
