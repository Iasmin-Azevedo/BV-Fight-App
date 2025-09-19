import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function AlunoLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          // textTransform: 'capitalize', // Removido - não suportado no React Native
        },
        headerTitleAlign: 'center',
        contentStyle: {
          backgroundColor: '#000',
        },
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="home"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="tecnicas"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="treinos"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="check-in"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="progresso"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="perfil"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}
