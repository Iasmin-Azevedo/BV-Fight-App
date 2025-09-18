import { router } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '../../firebase/firebase';
import { UserData, UserService } from '../../firebase/firebaseService';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  faixa: string;
  graus: number;
  academia: string;
  instrutor: string;
  dataInicio: string;
  avatar?: string;
  peso: string;
  altura: string;
  categoria: string;
}

export default function PerfilScreen() {
  console.log('Tela de perfil carregada!');
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userInfo = await UserService.getUserData(user.uid);
        setUserData(userInfo);
      } else {
        router.replace('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    try { router.dismissAll(); } catch {}
    router.replace('/login');
  };

  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', 'Funcionalidade em desenvolvimento');
  };

  const handleChangePassword = () => {
    Alert.alert('Alterar Senha', 'Funcionalidade em desenvolvimento');
  };

  const handlePrivacySettings = () => {
    Alert.alert('Configurações de Privacidade', 'Funcionalidade em desenvolvimento');
  };

  const handleHelp = () => {
    Alert.alert('Ajuda', 'Funcionalidade em desenvolvimento');
  };

  const handleAbout = () => {
    Alert.alert('Sobre o App', 'Tatame Digital v1.0.0\n\nAplicativo para aprendizado de jiu-jitsu');
  };

  const getBeltColor = (faixa: string) => {
    switch (faixa.toLowerCase()) {
      case 'branca': return '#FFFFFF';
      case 'azul': return '#0066CC';
      case 'roxa': return '#660099';
      case 'marrom': return '#8B4513';
      case 'preta': return '#000000';
      default: return '#FFFFFF';
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Carregando...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!userData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Erro ao carregar dados do usuário</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Header com avatar e informações básicas */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userData.avatar ? (
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[theme].accent }]}>
                <IconSymbol name="person.fill" size={40} color="#FFFFFF" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <IconSymbol name="camera.fill" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{userData.nome}</ThemedText>
            <View style={styles.beltContainer}>
              <View style={[styles.belt, { backgroundColor: getBeltColor(userData.faixa) }]}>
                <ThemedText style={[styles.beltText, { color: userData.faixa.toLowerCase() === 'branca' ? '#000000' : '#FFFFFF' }]}>
                  {userData.faixa}
                </ThemedText>
              </View>
              <View style={styles.grausContainer}>
                {[...Array(4)].map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.grau, 
                      index < 2 ? { backgroundColor: '#FFFFFF' } : { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                    ]} 
                  />
                ))}
              </View>
            </View>
            <ThemedText style={styles.academiaText}>BV Fight Team</ThemedText>
          </View>
        </View>

        {/* Estatísticas do perfil */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#111111', borderColor: '#1F1F1F', borderWidth: 1 }]}>
            <ThemedText style={styles.statValue}>75</ThemedText>
            <ThemedText style={styles.statLabel}>Treinos</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#111111', borderColor: '#1F1F1F', borderWidth: 1 }]}>
            <ThemedText style={styles.statValue}>24</ThemedText>
            <ThemedText style={styles.statLabel}>Técnicas</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#111111', borderColor: '#1F1F1F', borderWidth: 1 }]}>
            <ThemedText style={styles.statValue}>3</ThemedText>
            <ThemedText style={styles.statLabel}>Competições</ThemedText>
          </View>
        </View>

        {/* Informações pessoais */}
        <View style={[styles.section, { backgroundColor: '#111111', borderColor: '#1F1F1F', borderWidth: 1 }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Informações Pessoais</ThemedText>
            <TouchableOpacity onPress={handleEditProfile}>
              <IconSymbol name="pencil" size={20} color={Colors[theme].accent} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="envelope.fill" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Email:</ThemedText>
            <ThemedText style={styles.infoValue}>{userData.email}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="creditcard.fill" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>CPF:</ThemedText>
            <ThemedText style={styles.infoValue}>{userData.cpf}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Data de Nascimento:</ThemedText>
            <ThemedText style={styles.infoValue}>{userData.dataNascimento}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="person.2.fill" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Gênero:</ThemedText>
            <ThemedText style={styles.infoValue}>{userData.genero}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="staroflife.fill" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Faixa:</ThemedText>
            <ThemedText style={styles.infoValue}>{userData.faixa}</ThemedText>
          </View>
        </View>

        {/* Informações de jiu-jitsu */}
        <View style={[styles.section, { backgroundColor: '#111111', borderColor: '#1F1F1F', borderWidth: 1 }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Informações de Jiu-Jitsu</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="building.2.fill" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Academia:</ThemedText>
            <ThemedText style={styles.infoValue}>BV Fight Team</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="person.fill" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Tipo de Usuário:</ThemedText>
            <ThemedText style={styles.infoValue}>{userData.tipo === 'admin' ? 'Administrador' : 'Aluno'}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="calendar.badge.plus" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Membro desde:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {userData.criadoEm ? new Date(userData.criadoEm).toLocaleDateString('pt-BR') : 'N/A'}
            </ThemedText>
          </View>
        </View>

        {/* Ações da conta */}
        <View style={[styles.section, { backgroundColor: '#111111', borderColor: '#1F1F1F', borderWidth: 1 }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Conta</ThemedText>
          </View>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
            <View style={styles.actionInfo}>
              <IconSymbol name="lock.fill" size={16} color={Colors[theme].icon} />
              <ThemedText style={styles.actionLabel}>Alterar Senha</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors[theme].icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow} onPress={handlePrivacySettings}>
            <View style={styles.actionInfo}>
              <IconSymbol name="hand.raised.fill" size={16} color={Colors[theme].icon} />
              <ThemedText style={styles.actionLabel}>Privacidade</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors[theme].icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleHelp}>
            <View style={styles.actionInfo}>
              <IconSymbol name="questionmark.circle.fill" size={16} color={Colors[theme].icon} />
              <ThemedText style={styles.actionLabel}>Ajuda</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors[theme].icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleAbout}>
            <View style={styles.actionInfo}>
              <IconSymbol name="info.circle.fill" size={16} color={Colors[theme].icon} />
              <ThemedText style={styles.actionLabel}>Sobre</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors[theme].icon} />
          </TouchableOpacity>
        </View>

        {/* Botão de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FFFFFF" />
          <ThemedText style={styles.logoutText}>Sair da Conta</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1F1F1F',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1F1F1F',
    backgroundColor: '#111111',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  beltContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  belt: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  beltText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  grausContainer: {
    flexDirection: 'row',
  },
  grau: {
    width: 12,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  academiaText: {
    fontSize: 14,
    opacity: 0.7,
    color: '#C7C7C7',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#111111',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    color: '#C7C7C7',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#111111',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 120,
    color: '#EAEAEA',
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    color: '#CFCFCF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    marginLeft: 8,
    color: '#EDEDED',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    marginLeft: 8,
    color: '#EDEDED',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 40,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
