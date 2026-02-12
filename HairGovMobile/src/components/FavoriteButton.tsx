// components/FavoriteButton.tsx
import React from 'react';
import { TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  itemId: string;
  itemType?: 'hairdresser' | 'salon' | 'hairstyle';
  size?: number;
  style?: any;
  onPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType = 'hairdresser',
  size = 24,
  style,
  onPress
}) => {
  const { toggleFavorite, isFavorite, loading } = useFavorites();
  const [scaleValue] = React.useState(new Animated.Value(1));

  const favorited = isFavorite(itemId);

  const handlePress = async () => {
    if (loading) return;

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

    // Toggle du favori
    await toggleFavorite(itemId);
    
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
