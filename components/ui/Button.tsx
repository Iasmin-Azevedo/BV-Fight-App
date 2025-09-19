import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './IconSymbol';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  
  // Determinar cores com base na variante
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors[colorScheme || 'light'].accent,
          borderColor: Colors[colorScheme || 'light'].accent,
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: Colors[colorScheme || 'light'].accent,
        };
      case 'danger':
        return {
          backgroundColor: '#F44336',
          borderColor: '#F44336',
        };
      default:
        return {
          backgroundColor: Colors[colorScheme || 'light'].accent,
          borderColor: Colors[colorScheme || 'light'].accent,
        };
    }
  };
  
  // Determinar tamanho do botão
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 6,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 10,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
    }
  };
  
  // Determinar cor do texto
  const getTextColor = () => {
    if (disabled) return 'rgba(255, 255, 255, 0.5)';
    
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return Colors[colorScheme || 'light'].text;
      case 'outline':
        return Colors[colorScheme || 'light'].accent;
      default:
        return '#FFFFFF';
    }
  };
  
  // Determinar tamanho do texto
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };
  
  // Determinar tamanho do ícone
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 18;
      case 'large':
        return 22;
      default:
        return 18;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <IconSymbol 
              name={icon as any} 
              size={getIconSize()} 
              color={getTextColor()} 
              style={styles.leftIcon} 
            />
          )}
          
          <Text style={[
            styles.text,
            { color: getTextColor(), fontSize: getTextSize() }
          ]}>
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <IconSymbol 
              name={icon as any} 
              size={getIconSize()} 
              color={getTextColor()} 
              style={styles.rightIcon} 
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});