import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CheckInService } from '../../firebase/checkinService';
import { auth } from '../../firebase/firebase';
import { EstatisticasProgresso, ProgressoService } from '../../firebase/progressoService';

export default function ProgressoScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasProgresso | null>(null);
  const [sistemaFaixas, setSistemaFaixas] = useState<any>(null);
  const [historicoCheckIns, setHistoricoCheckIns] = useState<any[]>([]);

  useEffect(() => {
    carregarProgresso();
  }, []);

  const carregarProgresso = async () => {
    try {
      setLoading(true);
      
      if (!auth.currentUser) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      const alunoId = auth.currentUser.uid;
      
      // Obter nome do aluno
      const nomeAluno = await CheckInService.obterNomeAluno(alunoId);
      
      // Atualizar progresso de faixa baseado nas aulas presentes
      await ProgressoService.atualizarProgressoFaixa(alunoId, nomeAluno);
      
      // Buscar estatísticas atualizadas
      const stats = await ProgressoService.getEstatisticasAluno(alunoId);
      setEstatisticas(stats);
      
      // Buscar sistema de faixas
      const sistema = ProgressoService.getSistemaFaixas();
      setSistemaFaixas(sistema);
      
      // Buscar histórico de check-ins
      const historico = await CheckInService.getHistoricoCheckIns(alunoId, 10);
      setHistoricoCheckIns(historico);
      
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do progresso');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getFaixaColor = (faixa: string) => {
    const cores = {
      'Branca': '#FFFFFF',
      'Amarela': '#FFEB3B',
      'Laranja': '#FF9800',
      'Verde': '#4CAF50',
      'Azul': '#2196F3',
      'Roxa': '#9C27B0',
      'Marrom': '#8D6E63',
      'Preta': '#000000',
      'Coral': '#FF5722',
      'Vermelha': '#F44336'
    };
    return cores[faixa as keyof typeof cores] || '#FFFFFF';
  };

  const getTextColor = (faixa: string) => {
    return faixa === 'Branca' || faixa === 'Amarela' ? '#000000' : '#FFFFFF';
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
          <ThemedText>Carregando progresso...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!estatisticas || !sistemaFaixas) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Erro ao carregar dados</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Header com faixa atual */}
        <View style={styles.faixaAtualContainer}>
          <View style={[
            styles.faixaAtualBadge,
            { backgroundColor: getFaixaColor(estatisticas.faixaAtual) }
          ]}>
            <ThemedText style={[
              styles.faixaAtualText,
              { color: getTextColor(estatisticas.faixaAtual) }
            ]}>
              {estatisticas.faixaAtual}
            </ThemedText>
          </View>
          <ThemedText style={styles.faixaAtualLabel}>Faixa Atual</ThemedText>
        </View>

        {/* Progresso da faixa atual */}
        <View style={[styles.progressCard, { backgroundColor: Colors[theme].card }]}>
          <ThemedText style={styles.cardTitle}>Progresso da Faixa</ThemedText>
          
          <View style={styles.progressInfo}>
            <View style={styles.progressStats}>
              <ThemedText style={styles.progressNumber}>{estatisticas.aulasPresente}</ThemedText>
              <ThemedText style={styles.progressLabel}>Aulas Presentes</ThemedText>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { width: `${estatisticas.percentualCompleto}%` }
                  ]}
                />
              </View>
              <ThemedText style={styles.progressPercentage}>
                {estatisticas.percentualCompleto}%
              </ThemedText>
            </View>
            
            <View style={styles.progressStats}>
              <ThemedText style={styles.progressNumber}>{estatisticas.aulasNecessarias}</ThemedText>
              <ThemedText style={styles.progressLabel}>Aulas Necessárias</ThemedText>
            </View>
          </View>

          {estatisticas.proximaFaixa && (
            <View style={styles.proximaFaixaContainer}>
              <ThemedText style={styles.proximaFaixaLabel}>
                Próxima faixa: {estatisticas.proximaFaixa}
              </ThemedText>
              <ThemedText style={styles.aulasRestantes}>
                Faltam {ProgressoService.calcularAulasParaProximaFaixa(estatisticas.faixaAtual, estatisticas.aulasPresente)} aulas
              </ThemedText>
            </View>
          )}
        </View>

        {/* Estatísticas gerais */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <IconSymbol name="calendar.badge.checkmark" size={24} color={Colors[theme].accent} />
            <ThemedText style={styles.statValue}>{estatisticas.aulasPresente}</ThemedText>
            <ThemedText style={styles.statLabel}>Total de Aulas</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <IconSymbol name="clock.fill" size={24} color={Colors[theme].accent} />
            <ThemedText style={styles.statValue}>{estatisticas.tempoNaFaixaAtual}</ThemedText>
            <ThemedText style={styles.statLabel}>Dias na Faixa</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <IconSymbol name="calendar" size={24} color={Colors[theme].accent} />
            <ThemedText style={styles.statValue}>{formatDate(estatisticas.ultimaPresenca)}</ThemedText>
            <ThemedText style={styles.statLabel}>Última Presença</ThemedText>
          </View>
        </View>

        {/* Histórico de Check-ins */}
        {historicoCheckIns.length > 0 && (
          <View style={[styles.historicoCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.cardTitle}>📅 Histórico de Presenças</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              Últimos check-ins realizados
            </ThemedText>
            
            <View style={styles.historicoList}>
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
          </View>
        )}

        {/* Sistema de faixas */}
        <View style={[styles.sistemaFaixasCard, { backgroundColor: Colors[theme].card }]}>
          <ThemedText style={styles.cardTitle}>Sistema de Faixas</ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            Aulas necessárias para cada faixa
          </ThemedText>
          
          <View style={styles.faixasList}>
            {sistemaFaixas.ordem.map((faixa: string, index: number) => {
              const aulasNecessarias = sistemaFaixas.faixas[faixa];
              const isCurrentFaixa = faixa === estatisticas.faixaAtual;
              const isCompleted = estatisticas.aulasPresente >= aulasNecessarias;
              
              return (
                <View key={faixa} style={styles.faixaItem}>
                  <View style={[
                    styles.faixaBadge,
                    { 
                      backgroundColor: getFaixaColor(faixa),
                      borderColor: isCurrentFaixa ? Colors[theme].accent : 'transparent',
                      borderWidth: isCurrentFaixa ? 2 : 0
                    }
                  ]}>
                    <ThemedText style={[
                      styles.faixaText,
                      { color: getTextColor(faixa) }
                    ]}>
                      {faixa}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.faixaInfo}>
                    <ThemedText style={styles.faixaAulas}>{aulasNecessarias} aulas</ThemedText>
                    {isCurrentFaixa && (
                      <ThemedText style={styles.faixaStatus}>Atual</ThemedText>
                    )}
                    {isCompleted && !isCurrentFaixa && (
                      <ThemedText style={styles.faixaStatusCompleted}>✓ Concluída</ThemedText>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
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
  faixaAtualContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  faixaAtualBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  faixaAtualText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  faixaAtualLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  progressCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressStats: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 2,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  proximaFaixaContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  proximaFaixaLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  aulasRestantes: {
    fontSize: 14,
    opacity: 0.7,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  sistemaFaixasCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faixasList: {
    marginTop: 8,
  },
  faixaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  faixaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  faixaText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  faixaInfo: {
    flex: 1,
  },
  faixaAulas: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  faixaStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  faixaStatusCompleted: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  historicoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historicoList: {
    marginTop: 8,
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