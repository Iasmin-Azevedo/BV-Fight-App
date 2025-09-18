import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="cadastro"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontWeight: 'bold' },
          title: 'Cadastro',
          contentStyle: { backgroundColor: '#000' },
        }}
      />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(aluno)" options={{ headerShown: false }} />
    </Stack>
  );
}
