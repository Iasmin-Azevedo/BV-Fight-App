import { router } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '../../firebase/firebase';
import { UserData, UserService } from '../../firebase/firebaseService';
import { EstatisticasProgresso, ProgressoService } from '../../firebase/progressoService';

export default function AlunoHomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progresso, setProgresso] = useState<EstatisticasProgresso | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userInfo = await UserService.getUserData(user.uid);
        setUserData(userInfo);
        
        // Carregar progresso do aluno
        try {
          const progressoData = await ProgressoService.getEstatisticasAluno(user.uid);
          setProgresso(progressoData);
        } catch (error) {
          console.error('Erro ao carregar progresso:', error);
        }
      } else {
        router.replace('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navigateToScreen = (screen: 'tecnicas' | 'treinos' | 'check-in' | 'progresso' | 'perfil') => {
    router.push(`/(aluno)/${screen}` as any);
  };

  const navigateToProfile = () => {
    console.log('Navegando para o perfil...');
    router.push('/(aluno)/perfil');
  };

  const handleLogout = () => {
    router.replace('/login');
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
        {/* Header com perfil */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <ThemedText style={styles.greeting}>Olá, {userData.nome.split(' ')[0]}</ThemedText>
            <ThemedText style={styles.subtitle}>Bem-vindo ao BV Fight Team!</ThemedText>
            <View style={styles.beltInfo}>
              <View style={[styles.beltBadge, { backgroundColor: getBeltColor(userData.faixa), borderColor: '#000000' }]}>
                <ThemedText style={[styles.beltText, { color: userData.faixa.toLowerCase() === 'branca' ? '#000000' : '#FFFFFF' }]}>
                  {userData.faixa}
                </ThemedText>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
            <View style={[styles.profileAvatarPlaceholder, { backgroundColor: Colors[theme].accent }]}>
              <IconSymbol name="person.fill" size={28} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>


        {/* Seção de Progresso */}
        <View style={[styles.progressSection, { backgroundColor: Colors[theme].card }]}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>Meu Progresso</ThemedText>
            <View style={styles.progressActions}>
              <TouchableOpacity onPress={() => navigateToScreen('progresso')}>
                <IconSymbol name="arrow.right" size={20} color={Colors[theme].accent} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color={Colors[theme].icon} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.progressContent}>
            <View style={styles.beltInfo}>
              <View style={[styles.beltBadge, { backgroundColor: getBeltColor(userData.faixa), borderColor: '#000000' }]}>
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
            
            <View style={styles.progressStats}>
              <View style={styles.progressItem}>
                <ThemedText style={styles.progressLabel}>Progresso da Faixa</ThemedText>
                <ThemedText style={styles.progressValue}>
                  {progresso ? `${progresso.percentualCompleto}%` : '0%'}
                </ThemedText>
              </View>
              
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { 
                    width: progresso ? `${progresso.percentualCompleto}%` : '0%', 
                    backgroundColor: Colors[theme].accent 
                  }
                ]} />
              </View>
              
              <View style={styles.progressDetails}>
                <View style={styles.detailItem}>
                  <IconSymbol name="calendar.badge.checkmark" size={16} color={Colors[theme].icon} />
                  <ThemedText style={styles.detailText}>
                    {progresso ? `${progresso.aulasPresente} aulas presentes` : '0 aulas presentes'}
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <IconSymbol name="clock.fill" size={16} color={Colors[theme].icon} />
                  <ThemedText style={styles.detailText}>
                    {progresso ? `${progresso.tempoNaFaixaAtual} dias na faixa` : '0 dias na faixa'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Botões principais */}
        <View style={styles.buttonsGrid}>
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToScreen('tecnicas')}
          >
            <IconSymbol name="book.fill" size={32} color={Colors[theme].accent} />
            <ThemedText style={styles.buttonText}>Tecnicas</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToScreen('treinos')}
          >
            <IconSymbol name="figure.martial.arts" size={32} color={Colors[theme].accent} />
            <ThemedText style={styles.buttonText}>Treinos</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToScreen('check-in')}
          >
            <IconSymbol name="person.2.fill" size={32} color={Colors[theme].accent} />
            <ThemedText style={styles.buttonText}>Check-in</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToScreen('progresso')}
          >
            <IconSymbol name="chart.line.uptrend.xyaxis" size={32} color={Colors[theme].accent} />
            <ThemedText style={styles.buttonText}>Meu Progresso</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Seção de treinos sugeridos */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Proximos Treinos</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <TouchableOpacity 
              style={[styles.trainingCard, { backgroundColor: Colors[theme].card }]}
            >
              <ThemedText style={styles.cardTitle}>Treino de Guarda</ThemedText>
              <ThemedText style={styles.cardSubtitle}>8 técnicas • 30 min</ThemedText>
              <View style={styles.cardFooter}>
                <IconSymbol name="play.circle.fill" size={24} color={Colors[theme].accent} />
                <ThemedText style={styles.startText}>Iniciar</ThemedText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.trainingCard, { backgroundColor: Colors[theme].card }]}
            >
              <ThemedText style={styles.cardTitle}>Treino de Finalização</ThemedText>
              <ThemedText style={styles.cardSubtitle}>8 técnicas • 15 min</ThemedText>
              <View style={styles.cardFooter}>
                <IconSymbol name="play.circle.fill" size={24} color={Colors[theme].accent} />
                <ThemedText style={styles.startText}>Iniciar</ThemedText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.trainingCard, { backgroundColor: Colors[theme].card }]}
            >
              <ThemedText style={styles.cardTitle}>Treino de Defesa</ThemedText>
              <ThemedText style={styles.cardSubtitle}>6 técnicas • 30 min</ThemedText>
              <View style={styles.cardFooter}>
                <IconSymbol name="play.circle.fill" size={24} color={Colors[theme].accent} />
                <ThemedText style={styles.startText}>Iniciar</ThemedText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.trainingCard, { backgroundColor: Colors[theme].card }]}
            >
              <ThemedText style={styles.cardTitle}>Treino de Passagem</ThemedText>
              <ThemedText style={styles.cardSubtitle}>6 técnicas • 20 min</ThemedText>
              <View style={styles.cardFooter}>
                <IconSymbol name="play.circle.fill" size={24} color={Colors[theme].accent} />
                <ThemedText style={styles.startText}>Iniciar</ThemedText>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

         {/* Seção de técnicas recentes */}
         <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Técnicas Recentes</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {[1, 2, 3, 4].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.techniqueCard, { backgroundColor: Colors[theme].card }]}
              >
                <View style={styles.thumbnailContainer}>
                  <Image 
                    source={{ uri: `https://picsum.photos/200/300?random=${item}` }} 
                    style={styles.thumbnail} 
                  />
                  <View style={styles.playButton}>
                    <IconSymbol name="play.fill" size={16} color="#FFFFFF" />
                  </View>
                </View>
                <ThemedText style={styles.cardTitle}>Armlock da Guarda</ThemedText>
                <ThemedText style={styles.cardSubtitle}>Guarda Fechada</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
    color: '#C7C7C7',
  },
  beltInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beltBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    marginRight: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  beltText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.light.accent,
  },
  profileAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  mainButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  buttonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  techniqueCard: {
    width: 160,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  playButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(230, 57, 70, 0.8)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    paddingBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  trainingCard: {
    width: 200,
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  startText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#E63946',
  },
  progressSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    padding: 4,
    marginLeft: 8,
  },
  progressContent: {
    flexDirection: 'column',
  },
  grausContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grau: {
    width: 12,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#000000',
  },
  progressStats: {
    marginTop: 8,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E63946',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
    minWidth: '45%',
  },
  detailText: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
