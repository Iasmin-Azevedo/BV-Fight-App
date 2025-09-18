import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { UserService } from '../firebase/firebaseService';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [userType, setUserType] = useState<'aluno' | 'admin'>('aluno');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      console.log('Tentando login com email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login bem-sucedido, UID:', user.uid);

      // Buscar dados do usuário no Firestore
      console.log('Buscando dados do usuário no Firestore');
      const userData = await UserService.getUserData(user.uid);
      console.log('Dados do usuário:', userData);

      if (!userData) {
        console.log('Dados do usuário não encontrados');
        Alert.alert('Erro', 'Dados do usuário não encontrados. Faça o cadastro novamente.');
        return;
      }

      // Atualizar último acesso
      console.log('Atualizando último acesso');
      await UserService.updateLastAccess(user.uid);

      // Redireciona conforme o tipo de usuário
      console.log('Tipo de usuário:', userData.tipo);
      if (userData.tipo === 'admin') {
        console.log('Redirecionando para área de admin');
        setTimeout(() => {
          router.replace('/(admin)/dashboard');
        }, 500); // Pequeno atraso para garantir que o redirecionamento funcione
      } else {
        console.log('Redirecionando para área de aluno');
        setTimeout(() => {
          router.replace('/(aluno)/home');
        }, 500); // Pequeno atraso para garantir que o redirecionamento funcione
      }

    } catch (error: any) {
      let msg = 'Erro ao fazer login. Tente novamente.';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = 'E-mail ou senha inválidos.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'E-mail inválido.';
      }

      Alert.alert('Erro', msg);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Recuperar Senha', 'Funcionalidade em desenvolvimento');
  };



  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo e título */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: Colors[theme].accent }]}>
                <Image
                  source={require('../assets/images/icon.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <ThemedText style={styles.appTitle}>BV Fight Team</ThemedText>
            <ThemedText style={styles.appSubtitle}>Aprenda Jiu-Jitsu de forma digital</ThemedText>
          </View>

          {/* Seletor de tipo de usuário */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'aluno' && { backgroundColor: Colors[theme].accent }
              ]}
              onPress={() => setUserType('aluno')}
            >
              <IconSymbol
                name="person.fill"
                size={20}
                color={userType === 'aluno' ? '#FFFFFF' : Colors[theme].text}
              />
              <ThemedText
                style={[
                  styles.userTypeText,
                  userType === 'aluno' && { color: '#FFFFFF' }
                ]}
              >
                Aluno
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'admin' && { backgroundColor: Colors[theme].accent }
              ]}
              onPress={() => setUserType('admin')}
            >
              <IconSymbol
                name="person.badge.key.fill"
                size={20}
                color={userType === 'admin' ? '#FFFFFF' : Colors[theme].text}
              />
              <ThemedText
                style={[
                  styles.userTypeText,
                  userType === 'admin' && { color: '#FFFFFF' }
                ]}
              >
                Administrador
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Formulário de login */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <IconSymbol name="envelope.fill" size={20} color={Colors[theme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[theme].text }]}
                placeholder="Email"
                placeholderTextColor={Colors[theme].icon}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="lock.fill" size={20} color={Colors[theme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[theme].text }]}
                placeholder="Senha"
                placeholderTextColor={Colors[theme].icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol
                  name={showPassword ? "eye.slash.fill" : "eye.fill"}
                  size={20}
                  color={Colors[theme].icon}
                />
              </TouchableOpacity>
            </View>

            {/* Botão de login */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
              <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
            </TouchableOpacity>


            <View style={styles.buttonsContainer}>
            {/* Botão para cadastro */}
              <TouchableOpacity style={styles.cadastrarButton} onPress={() => router.replace('../cadastro')}>
                <ThemedText style={styles.cadastrarButtonText}>Cadastrar</ThemedText>
                <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Esqueci a senha */}
              <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                <ThemedText style={styles.forgotPasswordText}>Esqueci minha senha</ThemedText>
              </TouchableOpacity>
            </View>

          </View>








        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    padding: 20,
    paddingHorizontal: 30,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: Colors.light.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  cadastrarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cadastrarButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    flex: 1,
    alignItems: 'center',
  },
  forgotPasswordText: {
    alignItems: 'center',
    fontSize: 14,
    color: Colors.light.accent,
    textDecorationLine: 'underline',
  },
  demoInfoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoCredentials: {
    gap: 8,
  },
  credentialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credentialLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  credentialValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
});