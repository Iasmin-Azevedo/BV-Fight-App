import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase/firebase';
import { UserService } from '../firebase/firebaseService';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function CadastroScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [faixa, setFaixa] = useState('');

  const handleCadastro = async () => {
    if (!nome || !cpf || !dataNascimento || !genero || !faixa || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    try {
      console.log('Iniciando cadastro para:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuário Firebase criado com UID:', user.uid);

      // Verificar se é email de admin
      const isAdmin = UserService.isAdminEmail(email);
      console.log('É email de admin?', isAdmin);

      // Criar usuário usando o UserService
      // Passando o UID do Firebase para garantir consistência
      console.log('Criando documento do usuário no Firestore com UID:', user.uid);
      const success = await UserService.createUser({
        nome,
        cpf,
        numero: '',
        dataNascimento,
        genero,
        faixa,
        email,
        tipo: isAdmin ? 'admin' : 'aluno' // Define o tipo com base no email
      }, user.uid); // Passando o UID do usuário Firebase

      console.log('Resultado da criação do usuário:', success);
      if (success) {
        console.log('Redirecionando para tela de login');
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Erro', 'Falha ao salvar dados do usuário. Tente novamente.');
      }
    } catch (error: any) {
      let msg = 'Erro ao cadastrar. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'E-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      }
      Alert.alert('Erro', msg);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: Colors[theme].accent }]}>
                <Image source={require('../assets/images/icon.png')} style={styles.logoImage} />
              </View>
            </View>
            <ThemedText style={styles.appTitle}>Cadastro</ThemedText>
            <ThemedText style={styles.appSubtitle}>Crie sua conta para acessar o BV Fight Team</ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <IconSymbol name="person.fill" size={20} color={Colors[theme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[theme].text }]}
                placeholder="Nome Completo"
                placeholderTextColor={Colors[theme].icon}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="creditcard.fill" size={20} color={Colors[theme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[theme].text }]}
                placeholder="CPF"
                placeholderTextColor={Colors[theme].icon}
                value={cpf}
                onChangeText={setCpf}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={14}
              />
            </View>


            <View style={styles.inputContainer}>
              <IconSymbol name="calendar" size={20} color={Colors[theme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[theme].text }]}
                placeholder="Data de Nascimento"
                placeholderTextColor={Colors[theme].icon}
                value={dataNascimento}
                onChangeText={setDataNascimento}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="person.2.fill" size={20} color={Colors[theme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[theme].text }]}
                placeholder="Gênero"
                placeholderTextColor={Colors[theme].icon}
                value={genero}
                onChangeText={setGenero}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="staroflife.fill" size={20} color={Colors[theme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[theme].text }]}
                placeholder="Faixa"
                placeholderTextColor={Colors[theme].icon}
                value={faixa}
                onChangeText={setFaixa}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

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

            <View style={styles.inputContainer}>
              <IconSymbol name="lock.fill" size={20} color={Colors[theme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[theme].text }]}
                placeholder="Confirmar Senha"
                placeholderTextColor={Colors[theme].icon}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.cadastroButton} onPress={handleCadastro}>
              <ThemedText style={styles.cadastroButtonText}>Cadastrar</ThemedText>
              <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginRedirectButton} onPress={() => router.replace('/login')}>
              <ThemedText style={styles.loginRedirectText}>Já tem conta? Entrar</ThemedText>
            </TouchableOpacity>
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
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    padding: 20
  },
  cadastroButton: {
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
  cadastroButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  loginRedirectButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  loginRedirectText: {
    fontSize: 14,
    color: Colors.light.accent,
    textDecorationLine: 'underline',
  },
});