import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function AdminLayout() {
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
          // @ts-ignore
          textTransform: 'capitalize',
        },
        headerTitleAlign: 'center',
        contentStyle: {
          backgroundColor: '#000',
        },
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="gerenciar-tecnicas"
        options={{
          title: 'Gerenciar Técnicas',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="gerenciar-treinos"
        options={{
          title: 'Gerenciar Treinos',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="gerenciar-atletas"
        options={{
          title: 'Gerenciar Atletas',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="gerenciar-alunos"
        options={{
          title: 'Gerenciar Alunos',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="gerenciar-check-in"
        options={{
          title: 'Gerenciar Check-in',
          headerShown: true,
        }}
      />
    </Stack>
  );
}