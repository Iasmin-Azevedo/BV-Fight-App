import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CheckIn, CheckInService } from '../../firebase/checkinService';
import { UserData, UserService } from '../../firebase/firebaseService';

interface AlunoComCheckIn extends UserData {
  checkInHoje?: CheckIn;
  jaCheckIn: boolean;
}

export default function GerenciarCheckInScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [alunos, setAlunos] = useState<AlunoComCheckIn[]>([]);
  const [checkInsHoje, setCheckInsHoje] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de dados...');
      
      // Buscar todos os alunos
      console.log('Buscando alunos...');
      const todosAlunos = await UserService.getAlunos();
      console.log('Alunos encontrados:', todosAlunos.length);
      
      // Buscar check-ins de hoje
      console.log('Buscando check-ins de hoje...');
      const checkIns = await CheckInService.getCheckInsHoje();
      console.log('Check-ins encontrados:', checkIns.length);
      setCheckInsHoje(checkIns);
      
      // Combinar dados
      const alunosComCheckIn = todosAlunos.map(aluno => {
        const checkInHoje = checkIns.find(checkIn => checkIn.alunoId === aluno.uid);
        return {
          ...aluno,
          checkInHoje,
          jaCheckIn: !!checkInHoje
        };
      });
      
      console.log('Alunos com check-in processados:', alunosComCheckIn.length);
      setAlunos(alunosComCheckIn);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados dos alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCheckIn = async (aluno: AlunoComCheckIn, presente: boolean) => {
    try {
      const sucesso = await CheckInService.registrarCheckIn(
        aluno.uid,
        presente,
        presente ? 'Presente na aula' : 'Faltou à aula'
      );
      
      if (sucesso) {
        // Atualizar progresso de faixa se presente
        if (presente) {
          const { ProgressoService } = await import('../../firebase/progressoService');
          await ProgressoService.atualizarProgressoFaixa(aluno.uid, aluno.nome);
        }
        
        Alert.alert(
          'Sucesso',
          `${aluno.nome} foi ${presente ? 'marcado como presente' : 'registrado como falta'}`
        );
        carregarDados(); // Recarregar dados
      } else {
        Alert.alert('Erro', 'Erro ao registrar check-in');
      }
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      Alert.alert('Erro', 'Erro ao registrar check-in');
    }
  };

  const handleMarcarTodosPresentes = () => {
    Alert.alert(
      'Marcar Todos Presentes',
      'Deseja marcar todos os alunos como presentes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            const alunosSemCheckIn = alunos.filter(aluno => !aluno.jaCheckIn);
            
            for (const aluno of alunosSemCheckIn) {
              await CheckInService.registrarCheckIn(aluno.uid, true, 'Presente na aula');
              // Atualizar progresso de faixa
              const { ProgressoService } = await import('../../firebase/progressoService');
              await ProgressoService.atualizarProgressoFaixa(aluno.uid, await CheckInService.obterNomeAluno(aluno.uid));
            }
            
            Alert.alert('Sucesso', `${alunosSemCheckIn.length} alunos marcados como presentes`);
            carregarDados();
          }
        }
      ]
    );
  };

  const handleEditarCheckIn = async (aluno: AlunoComCheckIn) => {
    if (!aluno.checkInHoje) return;

    Alert.alert(
      'Editar Check-in',
      `Deseja alterar o status de ${aluno.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Alterar para Presente', 
          onPress: async () => {
            const sucesso = await CheckInService.editarCheckIn(aluno.checkInHoje!.id, {
              presente: true,
              observacoes: 'Alterado pelo administrador'
            });
            
            if (sucesso) {
              // Atualizar progresso de faixa
              const { ProgressoService } = await import('../../firebase/progressoService');
              await ProgressoService.atualizarProgressoFaixa(aluno.uid, await CheckInService.obterNomeAluno(aluno.uid));
              Alert.alert('Sucesso', 'Check-in alterado para presente');
              carregarDados();
            } else {
              Alert.alert('Erro', 'Erro ao alterar check-in');
            }
          }
        },
        { 
          text: 'Alterar para Falta', 
          onPress: async () => {
            const sucesso = await CheckInService.editarCheckIn(aluno.checkInHoje!.id, {
              presente: false,
              observacoes: 'Alterado pelo administrador'
            });
            
            if (sucesso) {
              Alert.alert('Sucesso', 'Check-in alterado para falta');
              carregarDados();
            } else {
              Alert.alert('Erro', 'Erro ao alterar check-in');
            }
          }
        }
      ]
    );
  };

  const handleResetarCheckIn = async (aluno: AlunoComCheckIn) => {
    Alert.alert(
      'Resetar Check-in',
      `Deseja resetar o check-in de ${aluno.nome}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetar', 
          style: 'destructive',
          onPress: async () => {
            const sucesso = await CheckInService.deletarCheckIn(aluno.checkInHoje!.id);
            
            if (sucesso) {
              Alert.alert('Sucesso', 'Check-in resetado com sucesso');
              carregarDados();
            } else {
              Alert.alert('Erro', 'Erro ao resetar check-in');
            }
          }
        }
      ]
    );
  };

  const handleResetarTodosCheckIns = () => {
    Alert.alert(
      'Resetar Todos os Check-ins',
      'Deseja resetar TODOS os check-ins de hoje? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetar Todos', 
          style: 'destructive',
          onPress: async () => {
            const alunosComCheckIn = alunos.filter(aluno => aluno.jaCheckIn);
            
            for (const aluno of alunosComCheckIn) {
              if (aluno.checkInHoje) {
                await CheckInService.deletarCheckIn(aluno.checkInHoje.id);
              }
            }
            
            Alert.alert('Sucesso', `${alunosComCheckIn.length} check-ins resetados`);
            carregarDados();
          }
        }
      ]
    );
  };

  const filteredAlunos = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const alunosPresentes = alunos.filter(aluno => aluno.jaCheckIn && aluno.checkInHoje?.presente).length;
  const alunosFaltaram = alunos.filter(aluno => aluno.jaCheckIn && !aluno.checkInHoje?.presente).length;
  const alunosSemCheckIn = alunos.filter(aluno => !aluno.jaCheckIn).length;
  const alunosComCheckIn = alunos.filter(aluno => aluno.jaCheckIn).length;

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
        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[theme].card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Buscar alunos..."
            placeholderTextColor={Colors[theme].icon}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <ThemedText style={styles.statValue}>{alunosPresentes}</ThemedText>
            <ThemedText style={styles.statLabel}>Presentes</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F44336' }]}>
            <ThemedText style={styles.statValue}>{alunosFaltaram}</ThemedText>
            <ThemedText style={styles.statLabel}>Faltaram</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
            <ThemedText style={styles.statValue}>{alunosSemCheckIn}</ThemedText>
            <ThemedText style={styles.statLabel}>Sem Check-in</ThemedText>
          </View>
        </View>

        {/* Botões de ação em lote */}
        <View style={styles.actionButtonsContainer}>
          {alunosSemCheckIn > 0 && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors[theme].accent }]}
              onPress={handleMarcarTodosPresentes}
            >
              <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonText}>
                Marcar Todos Presentes ({alunosSemCheckIn})
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {alunosComCheckIn > 0 && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={handleResetarTodosCheckIns}
            >
              <IconSymbol name="trash.fill" size={20} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonText}>
                Resetar Todos ({alunosComCheckIn})
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de alunos */}
        <View style={styles.alunosContainer}>
          {filteredAlunos.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: Colors[theme].card }]}>
              <ThemedText style={styles.emptyText}>
                {alunos.length === 0 ? 'Nenhum aluno cadastrado' : 'Nenhum aluno encontrado na busca'}
              </ThemedText>
            </View>
          ) : (
            filteredAlunos.map((aluno) => (
            <View 
              key={aluno.uid} 
              style={[styles.alunoCard, { backgroundColor: Colors[theme].card }]}
            >
              <View style={styles.alunoInfo}>
                <ThemedText style={styles.alunoNome}>{aluno.nome}</ThemedText>
                <ThemedText style={styles.alunoEmail}>{aluno.email}</ThemedText>
                <View style={styles.alunoDetails}>
                  <View style={styles.detailItem}>
                    <IconSymbol name="staroflife.fill" size={12} color={Colors[theme].icon} />
                    <ThemedText style={styles.detailText}>{aluno.faixa}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="calendar" size={12} color={Colors[theme].icon} />
                    <ThemedText style={styles.detailText}>
                      {aluno.criadoEm ? new Date(aluno.criadoEm).toLocaleDateString('pt-BR') : 'N/A'}
                    </ThemedText>
                  </View>
                </View>
                
                {/* Status do check-in */}
                {aluno.jaCheckIn ? (
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: aluno.checkInHoje?.presente ? '#4CAF50' : '#F44336' }
                  ]}>
                    <ThemedText style={styles.statusText}>
                      {aluno.checkInHoje?.presente ? 'Presente' : 'Faltou'}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: '#FF9800' }]}>
                    <ThemedText style={styles.statusText}>Sem Check-in</ThemedText>
                  </View>
                )}
              </View>
              
              {/* Botões de ação */}
              {!aluno.jaCheckIn ? (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.smallActionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleCheckIn(aluno, true)}
                  >
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.smallActionButton, { backgroundColor: '#F44336' }]}
                    onPress={() => handleCheckIn(aluno, false)}
                  >
                    <IconSymbol name="xmark" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.smallActionButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => handleEditarCheckIn(aluno)}
                  >
                    <IconSymbol name="pencil" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.smallActionButton, { backgroundColor: '#FF9800' }]}
                    onPress={() => handleResetarCheckIn(aluno)}
                  >
                    <IconSymbol name="trash" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )))}
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
  addButton: {
    padding: 8,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  alunosContainer: {
    marginBottom: 24,
  },
  alunoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alunoInfo: {
    flex: 1,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alunoEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  alunoDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    marginBottom: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  smallActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});