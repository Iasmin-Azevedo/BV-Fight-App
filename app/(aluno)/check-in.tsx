import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CheckIn, CheckInService, CheckInStats } from '../../firebase/checkinService';
import { auth } from '../../firebase/firebase';
import { ProgressoService } from '../../firebase/progressoService';

export default function CheckInScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [jaCheckInHoje, setJaCheckInHoje] = useState(false);
  const [fazendoCheckIn, setFazendoCheckIn] = useState(false);
  const [historicoCheckIns, setHistoricoCheckIns] = useState<CheckIn[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      if (!auth.currentUser) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      const alunoId = auth.currentUser.uid;
      
      // Verificar se já fez check-in hoje
      const jaCheckIn = await CheckInService.jaCheckInHoje(alunoId);
      setJaCheckInHoje(jaCheckIn);
      
      // Buscar estatísticas
      const estatisticas = await CheckInService.getStatsAluno(alunoId);
      setStats(estatisticas);
      
      // Buscar histórico de check-ins
      const historico = await CheckInService.getHistoricoCheckIns(alunoId, 5);
      setHistoricoCheckIns(historico);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    Alert.alert(
      'Check-in',
      'Confirma sua presença na aula de hoje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              setFazendoCheckIn(true);
              
              const sucesso = await CheckInService.registrarCheckIn(
                auth.currentUser!.uid,
                true,
                'Presente na aula'
              );
              
              if (sucesso) {
                console.log('Check-in realizado com sucesso, atualizando progresso...');
                
                // Atualizar progresso de faixa
                const progressoAtualizado = await ProgressoService.atualizarProgressoFaixa(
                  auth.currentUser!.uid,
                  await CheckInService.obterNomeAluno(auth.currentUser!.uid)
                );
                
                console.log('Progresso atualizado:', progressoAtualizado);
                
                Alert.alert('Sucesso', 'Check-in realizado com sucesso!');
                carregarDados(); // Recarregar dados
              } else {
                Alert.alert('Erro', 'Erro ao realizar check-in');
              }
            } catch (error) {
              console.error('Erro ao fazer check-in:', error);
              Alert.alert('Erro', 'Erro ao realizar check-in');
            } finally {
              setFazendoCheckIn(false);
            }
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleForcarAtualizacao = async () => {
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    try {
      Alert.alert(
        'Forçar Atualização',
        'Deseja forçar a atualização do progresso?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Confirmar', 
            onPress: async () => {
              console.log('Forçando atualização do progresso...');
              
              const progressoAtualizado = await ProgressoService.atualizarProgressoFaixa(
                auth.currentUser!.uid,
                await CheckInService.obterNomeAluno(auth.currentUser!.uid)
              );
              
              console.log('Progresso forçado atualizado:', progressoAtualizado);
              
              Alert.alert('Sucesso', 'Progresso atualizado com sucesso!');
              carregarDados();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao forçar atualização:', error);
      Alert.alert('Erro', 'Erro ao atualizar progresso');
    }
  };

  const handleResetarCheckIns = async () => {
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    try {
      Alert.alert(
        'Resetar Check-ins',
        'Deseja resetar TODOS os seus check-ins? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Resetar', 
            style: 'destructive',
            onPress: async () => {
              console.log('Resetando check-ins do aluno...');
              
              const sucesso = await CheckInService.resetarCheckInsAluno(auth.currentUser!.uid);
              
              if (sucesso) {
                console.log('Check-ins resetados com sucesso');
                Alert.alert('Sucesso', 'Check-ins resetados com sucesso!');
                carregarDados();
              } else {
                Alert.alert('Erro', 'Erro ao resetar check-ins');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao resetar check-ins:', error);
      Alert.alert('Erro', 'Erro ao resetar check-ins');
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Nunca';
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Status do check-in de hoje */}
        <View style={[styles.statusCard, { backgroundColor: Colors[theme].card }]}>
          <View style={styles.statusHeader}>
            <IconSymbol 
              name={jaCheckInHoje ? "checkmark.circle.fill" : "clock.fill"} 
              size={32} 
              color={jaCheckInHoje ? "#4CAF50" : "#FF9800"} 
            />
            <ThemedText style={styles.statusTitle}>
              {jaCheckInHoje ? 'Check-in Realizado' : 'Check-in Pendente'}
            </ThemedText>
          </View>
          
          <ThemedText style={styles.statusSubtitle}>
            {jaCheckInHoje 
              ? 'Você já confirmou presença na aula de hoje' 
              : 'Confirme sua presença na aula de hoje'
            }
          </ThemedText>
          
          {!jaCheckInHoje && (
            <TouchableOpacity 
              style={[styles.checkInButton, { backgroundColor: Colors[theme].accent }]}
              onPress={handleCheckIn}
              disabled={fazendoCheckIn}
            >
              <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
              <ThemedText style={styles.checkInButtonText}>
                {fazendoCheckIn ? 'Processando...' : 'Fazer Check-in'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Estatísticas */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
              <IconSymbol name="calendar.badge.checkmark" size={24} color={Colors[theme].accent} />
              <ThemedText style={styles.statValue}>{stats.aulasPresente}</ThemedText>
              <ThemedText style={styles.statLabel}>Aulas Presentes</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
              <IconSymbol name="calendar.badge.minus" size={24} color={Colors[theme].accent} />
              <ThemedText style={styles.statValue}>{stats.totalAulas - stats.aulasPresente}</ThemedText>
              <ThemedText style={styles.statLabel}>Aulas Faltadas</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
              <IconSymbol name="percent" size={24} color={Colors[theme].accent} />
              <ThemedText style={styles.statValue}>{stats.percentualPresenca}%</ThemedText>
              <ThemedText style={styles.statLabel}>Presença</ThemedText>
            </View>
          </View>
        )}

        {/* Informações adicionais */}
        <View style={[styles.infoCard, { backgroundColor: Colors[theme].card }]}>
          <ThemedText style={styles.infoTitle}>Informações</ThemedText>
          
          <View style={styles.infoItem}>
            <IconSymbol name="calendar" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Última presença:</ThemedText>
            <ThemedText style={styles.infoValue}>{formatDate(stats?.ultimaPresenca)}</ThemedText>
          </View>
          
          <View style={styles.infoItem}>
            <IconSymbol name="clock.fill" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Total de aulas:</ThemedText>
            <ThemedText style={styles.infoValue}>{stats?.totalAulas || 0}</ThemedText>
          </View>
          
          <View style={styles.infoItem}>
            <IconSymbol name="star.fill" size={16} color={Colors[theme].icon} />
            <ThemedText style={styles.infoLabel}>Taxa de presença:</ThemedText>
            <ThemedText style={styles.infoValue}>{stats?.percentualPresenca || 0}%</ThemedText>
          </View>
        </View>

        {/* Histórico de Check-ins */}
        {historicoCheckIns.length > 0 && (
          <View style={[styles.historicoCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.historicoTitle}>📅 Histórico Recente</ThemedText>
            <ThemedText style={styles.historicoSubtitle}>Últimos check-ins realizados</ThemedText>
            
            {historicoCheckIns.map((checkIn, index) => (
              <View key={checkIn.id} style={styles.historicoItem}>
                <View style={styles.historicoItemLeft}>
                  <IconSymbol 
                    name={checkIn.presente ? "checkmark.circle.fill" : "xmark.circle.fill"} 
                    size={20} 
                    color={checkIn.presente ? "#4CAF50" : "#F44336"} 
                  />
                  <View style={styles.historicoItemInfo}>
                    <ThemedText style={styles.historicoItemDate}>
                      {formatDateTime(checkIn.data)}
                    </ThemedText>
                    <ThemedText style={styles.historicoItemStatus}>
                      {checkIn.presente ? 'Presente' : 'Faltou'}
                    </ThemedText>
                  </View>
                </View>
                {checkIn.observacoes && (
                  <ThemedText style={styles.historicoItemObs}>
                    {checkIn.observacoes}
                  </ThemedText>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Dicas */}
        <View style={[styles.tipsCard, { backgroundColor: Colors[theme].card }]}>
          <ThemedText style={styles.tipsTitle}>💡 Dicas</ThemedText>
          <ThemedText style={styles.tipsText}>
            • Faça check-in sempre que comparecer às aulas{'\n'}
            • Sua presença conta para o progresso das faixas{'\n'}
            • Mantenha uma boa frequência para evoluir mais rápido
          </ThemedText>
        </View>

        {/* Botões de debug e reset */}
        <View style={styles.debugButtonsContainer}>
          <TouchableOpacity 
            style={[styles.debugButton, { backgroundColor: '#FF9800' }]}
            onPress={handleForcarAtualizacao}
          >
            <ThemedText style={styles.debugButtonText}>🔧 Forçar Atualização</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.debugButton, { backgroundColor: '#F44336' }]}
            onPress={handleResetarCheckIns}
          >
            <ThemedText style={styles.debugButtonText}>🗑️ Resetar Check-ins</ThemedText>
          </TouchableOpacity>
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
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  statusCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  debugButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  debugButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  historicoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historicoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historicoSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  historicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  historicoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historicoItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  historicoItemDate: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  historicoItemStatus: {
    fontSize: 12,
    opacity: 0.7,
  },
  historicoItemObs: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
    maxWidth: 120,
    textAlign: 'right',
  },
});