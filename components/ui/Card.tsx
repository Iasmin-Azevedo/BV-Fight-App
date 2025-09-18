import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  onPress?: () => void;
  style?: any;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
  rounded?: boolean;
}

export function Card({
  children,
  title,
  onPress,
  style,
  elevation = 'medium',
  padding = 'medium',
  rounded = true,
}: CardProps) {
  const colorScheme = useColorScheme();
  
  // Determinar estilo de elevação
  const getElevationStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'low':
        return {
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        };
      case 'medium':
        return {
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        };
      case 'high':
        return {
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        };
      default:
        return {
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        };
    }
  };
  
  // Determinar estilo de padding
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: 8 };
      case 'medium':
        return { padding: 16 };
      case 'large':
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  };
  
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={[
        styles.card,
        { backgroundColor: Colors[colorScheme].card },
        rounded && styles.rounded,
        getElevationStyle(),
        getPaddingStyle(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {title && (
        <ThemedText style={styles.title}>{title}</ThemedText>
      )}
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    overflow: 'hidden',
  },
  rounded: {
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});