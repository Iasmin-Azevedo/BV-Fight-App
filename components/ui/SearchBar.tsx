import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from './IconSymbol';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  style?: any;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = 'Buscar...',
  style,
  autoFocus = false,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  
  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };
  
  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: Colors[colorScheme].card },
        style
      ]}
    >
      <IconSymbol 
        name="magnifyingglass" 
        size={20} 
        color={Colors[colorScheme].text} 
        style={styles.searchIcon} 
      />
      
      <TextInput
        style={[
          styles.input,
          { color: Colors[colorScheme].text }
        ]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={Colors[colorScheme].tabIconDefault}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        autoFocus={autoFocus}
      />
      
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <IconSymbol 
            name="xmark.circle.fill" 
            size={20} 
            color={Colors[colorScheme].tabIconDefault} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
});