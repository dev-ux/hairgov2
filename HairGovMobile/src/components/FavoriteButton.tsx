// components/FavoriteButton.tsx
import React, { useState } from 'react';
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
  // Temporairement désactivé pour éviter les crashes
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [scaleValue] = React.useState(new Animated.Value(1));

  const handlePress = async () => {
    if (loading) return;

    console.log('🔍 FavoriteButton - handlePress (temporairement désactivé):', {
      itemType,
      itemId
    });

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

    // Temporairement désactivé - juste l'animation
    setIsFavorited(!isFavorited);
    
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
          name={isFavorited ? "heart" : "heart-outline"}
          size={size}
          color={isFavorited ? "#FF4757" : "#666"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};
