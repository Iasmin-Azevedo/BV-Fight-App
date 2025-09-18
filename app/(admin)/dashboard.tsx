import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { UserService } from '@/firebase/firebaseService';
import { TecnicaService } from '@/firebase/tecnicaService';
import { TreinoService } from '@/firebase/treinoService';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DashboardStats {
  totalAlunos: number;
  alunosAtivos: number;
  totalTecnicas: number;
  tecnicasAtivas: number;
  totalTreinos: number;
  treinosAtivos: number;
}

export default function AdminDashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    alunosAtivos: 0,
    totalTecnicas: 0,
    tecnicasAtivas: 0,
    totalTreinos: 0,
    treinosAtivos: 0
  });

  const navigateToScreen = (screen: string) => {
    if (screen === 'gerenciar-tecnicas') {
      router.push('/(admin)/gerenciar-tecnicas');
    } else if (screen === 'gerenciar-treinos') {
      router.push('/(admin)/gerenciar-treinos');
    } else if (screen === 'gerenciar-atletas') {
      router.push('/(admin)/gerenciar-atletas');
    } else if (screen === 'gerenciar-alunos') {
      router.push('/(admin)/gerenciar-alunos');
    } else if (screen === 'gerenciar-check-in') {
      router.push('/(admin)/gerenciar-check-in');
    }
  };

  // Carregar estatísticas do dashboard
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const [alunos, treinos, tecnicas] = await Promise.all([
        UserService.getAlunos(),
        TreinoService.getAllTreinos(),
        TecnicaService.getAllTecnicas()
      ]);

      const statsData: DashboardStats = {
        totalAlunos: alunos.length,
        alunosAtivos: alunos.length, // Todos os alunos do UserService são considerados ativos
        totalTecnicas: tecnicas.length,
        tecnicasAtivas: tecnicas.filter(t => t.status === 'ativo').length,
        totalTreinos: treinos.length,
        treinosAtivos: treinos.filter(t => t.status === 'ativo').length
      };

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      Alert.alert('Erro', 'Erro ao carregar estatísticas do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header com perfil */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            </View>
            <View style={styles.headerContentText}>
              <ThemedText style={styles.greeting}>Painel Administrativo</ThemedText>
              <ThemedText style={styles.subtitle}>Gerencie o conteúdo do aplicativo</ThemedText>
            </View>
            <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: Colors[theme].card }]}
            onPress={handleLogout}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={Colors[theme].accent} />
          </TouchableOpacity>
          </View>
          
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Carregando estatísticas...</ThemedText>
            </View>
          ) : (
            <>
              <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
                <IconSymbol name="person.3.fill" size={24} color={Colors[theme].accent} />
                <ThemedText style={styles.statValue}>{stats.totalAlunos}</ThemedText>
                <ThemedText style={styles.statLabel}>Alunos</ThemedText>
                <ThemedText style={styles.statSubLabel}>{stats.alunosAtivos} ativos</ThemedText>
              </View>

              <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
                <IconSymbol name="book.fill" size={24} color={Colors[theme].accent} />
                <ThemedText style={styles.statValue}>{stats.totalTecnicas}</ThemedText>
                <ThemedText style={styles.statLabel}>Técnicas</ThemedText>
                <ThemedText style={styles.statSubLabel}>{stats.tecnicasAtivas} ativas</ThemedText>
              </View>

              <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
                <IconSymbol name="figure.martial.arts" size={24} color={Colors[theme].accent} />
                <ThemedText style={styles.statValue}>{stats.totalTreinos}</ThemedText>
                <ThemedText style={styles.statLabel}>Treinos</ThemedText>
                <ThemedText style={styles.statSubLabel}>{stats.treinosAtivos} ativos</ThemedText>
              </View>
            </>
          )}
        </View>

        {/* Botões de gerenciamento */}
        <ThemedText style={styles.sectionTitle}>Gerenciamento</ThemedText>
        <View style={styles.managementGrid}>
          <TouchableOpacity
            style={[styles.managementButton, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToScreen('gerenciar-tecnicas')}
          >
            <IconSymbol name="book.fill" size={32} color={Colors[theme].accent} />
            <ThemedText style={styles.buttonText}>Gerenciar Técnicas</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.managementButton, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToScreen('gerenciar-treinos')}
          >
            <IconSymbol name="figure.martial.arts" size={32} color={Colors[theme].accent} />
            <ThemedText style={styles.buttonText}>Gerenciar Treinos</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.managementButton, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToScreen('gerenciar-check-in')}
          >
            <IconSymbol name="person.2.fill" size={32} color={Colors[theme].accent} />
            <ThemedText style={styles.buttonText}>Gerenciar Check-in</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.managementButton, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToScreen('gerenciar-alunos')}
          >
            <IconSymbol name="person.3.fill" size={32} color={Colors[theme].accent} />
            <ThemedText style={styles.buttonText}>Gerenciar Alunos</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Resumo de atividades */}
        <ThemedText style={styles.sectionTitle}>Resumo de Atividades</ThemedText>
        <View style={styles.activityContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Carregando atividades...</ThemedText>
            </View>
          ) : (
            <>
              <View style={[styles.activityItem, { backgroundColor: Colors[theme].card }]}>
                <View style={styles.activityIconContainer}>
                  <IconSymbol name="person.3.fill" size={20} color={Colors[theme].accent} />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>Total de Alunos Cadastrados</ThemedText>
                  <ThemedText style={styles.activityTime}>{stats.totalAlunos} alunos no sistema</ThemedText>
                </View>
              </View>

              <View style={[styles.activityItem, { backgroundColor: Colors[theme].card }]}>
                <View style={styles.activityIconContainer}>
                  <IconSymbol name="book.fill" size={20} color={Colors[theme].accent} />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>Técnicas Disponíveis</ThemedText>
                  <ThemedText style={styles.activityTime}>{stats.tecnicasAtivas} técnicas ativas</ThemedText>
                </View>
              </View>

              <View style={[styles.activityItem, { backgroundColor: Colors[theme].card }]}>
                <View style={styles.activityIconContainer}>
                  <IconSymbol name="figure.martial.arts" size={20} color={Colors[theme].accent} />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>Treinos Ativos</ThemedText>
                  <ThemedText style={styles.activityTime}>{stats.treinosAtivos} treinos disponíveis</ThemedText>
                </View>
              </View>

              <View style={[styles.activityItem, { backgroundColor: Colors[theme].card }]}>
                <View style={styles.activityIconContainer}>
                  <IconSymbol name="chart.bar.fill" size={20} color={Colors[theme].accent} />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>Taxa de Engajamento</ThemedText>
                  <ThemedText style={styles.activityTime}>{
                    stats.totalAlunos > 0
                      ? Math.round((stats.alunosAtivos / stats.totalAlunos) * 100)
                      : 0
                  }% dos alunos ativos</ThemedText>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerContentText: {
    marginLeft: 16,
  },
  logo: {
    width: 60,
    height: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '30%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  statSubLabel: {
    fontSize: 12,
    opacity: 0.5,
    color: Colors.light.accent,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  managementButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityContainer: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#E63946',
  },
});