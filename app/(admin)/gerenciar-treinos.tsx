import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { AgendamentoSemanal, AgendamentoService } from '@/firebase/agendamentoService';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AgendamentoSemanalScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [agendamentos, setAgendamentos] = useState<AgendamentoSemanal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoSemanal | null>(null);
  
  // Formulário para adicionar/editar agendamento
  const [formData, setFormData] = useState({
    nome: '',
    diaSemana: 'Segunda-feira',
    horarioInicio: '18:00',
    horarioFim: '19:00',
    duracao: 60,
    categoria: 'Guarda',
    nivel: 'Iniciante',
    descricao: '',
    maxAlunos: 20
  });

  // Carregar dados do Firebase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const agendamentosData = await AgendamentoService.getAllAgendamentos();
      setAgendamentos(agendamentosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddAgendamento = () => {
    setFormData({
      nome: '',
      diaSemana: 'Segunda-feira',
      horarioInicio: '18:00',
      horarioFim: '19:00',
      duracao: 60,
      categoria: 'Guarda',
      nivel: 'Iniciante',
      descricao: '',
      maxAlunos: 20
    });
    setShowAddModal(true);
  };

  const handleSaveAgendamento = async () => {
    try {
      if (!formData.nome.trim()) {
        Alert.alert('Erro', 'Nome do treino é obrigatório');
        return;
      }

      if (!formData.horarioInicio || !formData.horarioFim) {
        Alert.alert('Erro', 'Horários são obrigatórios');
        return;
      }

      const agendamentoData = {
        nome: formData.nome.trim(),
        diaSemana: formData.diaSemana,
        horarioInicio: formData.horarioInicio,
        horarioFim: formData.horarioFim,
        duracao: formData.duracao,
        categoria: formData.categoria,
        nivel: formData.nivel,
        descricao: formData.descricao.trim(),
        maxAlunos: formData.maxAlunos,
        ativo: true
      };

      const success = await AgendamentoService.createAgendamento(agendamentoData);
      if (success) {
        await loadData();
        setShowAddModal(false);
        Alert.alert('Sucesso', 'Agendamento adicionado com sucesso!');
      } else {
        Alert.alert('Erro', 'Erro ao adicionar agendamento');
      }
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      Alert.alert('Erro', 'Erro ao adicionar agendamento');
    }
  };

  const handleEditAgendamento = (agendamento: AgendamentoSemanal) => {
    setSelectedAgendamento(agendamento);
    setFormData({
      nome: agendamento.nome,
      diaSemana: agendamento.diaSemana,
      horarioInicio: agendamento.horarioInicio,
      horarioFim: agendamento.horarioFim,
      duracao: agendamento.duracao,
      categoria: agendamento.categoria,
      nivel: agendamento.nivel,
      descricao: agendamento.descricao || '',
      maxAlunos: agendamento.maxAlunos
    });
    setShowEditModal(true);
  };

  const handleUpdateAgendamento = async () => {
    try {
      if (!selectedAgendamento?.id) return;
      if (!formData.nome.trim()) {
        Alert.alert('Erro', 'Nome do treino é obrigatório');
        return;
      }

      if (!formData.horarioInicio || !formData.horarioFim) {
        Alert.alert('Erro', 'Horários são obrigatórios');
        return;
      }

      const updateData = {
        nome: formData.nome.trim(),
        diaSemana: formData.diaSemana,
        horarioInicio: formData.horarioInicio,
        horarioFim: formData.horarioFim,
        duracao: formData.duracao,
        categoria: formData.categoria,
        nivel: formData.nivel,
        descricao: formData.descricao.trim(),
        maxAlunos: formData.maxAlunos
      };

      const success = await AgendamentoService.updateAgendamento(selectedAgendamento.id, updateData);
      if (success) {
        await loadData();
        setShowEditModal(false);
        setSelectedAgendamento(null);
        Alert.alert('Sucesso', 'Agendamento atualizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Erro ao atualizar agendamento');
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      Alert.alert('Erro', 'Erro ao atualizar agendamento');
    }
  };

  const handleToggleStatus = (agendamento: AgendamentoSemanal) => {
    const newStatus = !agendamento.ativo;
    Alert.alert(
      'Alterar Status',
      `Deseja ${newStatus ? 'ativar' : 'desativar'} o agendamento "${agendamento.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (agendamento.id) {
                const success = await AgendamentoService.toggleAgendamentoStatus(agendamento.id, newStatus);
                if (success) {
                  await loadData();
                  Alert.alert('Sucesso', `Status alterado para ${newStatus ? 'ativo' : 'inativo'}`);
                } else {
                  Alert.alert('Erro', 'Erro ao alterar status do agendamento');
                }
              }
            } catch (error) {
              console.error('Erro ao alterar status:', error);
              Alert.alert('Erro', 'Erro ao alterar status do agendamento');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAgendamento = (agendamento: AgendamentoSemanal) => {
    Alert.alert(
      'Excluir Agendamento',
      `Deseja realmente excluir o agendamento "${agendamento.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (agendamento.id) {
                const success = await AgendamentoService.deleteAgendamento(agendamento.id);
                if (success) {
                  await loadData();
                  Alert.alert('Sucesso', 'Agendamento excluído com sucesso');
                } else {
                  Alert.alert('Erro', 'Erro ao excluir agendamento');
                }
              }
            } catch (error) {
              console.error('Erro ao excluir agendamento:', error);
              Alert.alert('Erro', 'Erro ao excluir agendamento');
            }
          }
        }
      ]
    );
  };

  const filteredAgendamentos = agendamentos.filter(agendamento =>
    agendamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.nivel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.diaSemana.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={24} color={Colors[theme].text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Agendamento Semanal</ThemedText>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAgendamento}>
            <IconSymbol name="plus" size={24} color={Colors[theme].accent} />
          </TouchableOpacity>
        </View>

        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[theme].card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Buscar agendamentos..."
            placeholderTextColor={Colors[theme].icon}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{agendamentos.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{agendamentos.filter(a => a.ativo).length}</ThemedText>
            <ThemedText style={styles.statLabel}>Ativos</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{agendamentos.reduce((acc, a) => acc + a.maxAlunos, 0)}</ThemedText>
            <ThemedText style={styles.statLabel}>Vagas</ThemedText>
          </View>
        </View>

        {/* Lista de agendamentos */}
        <View style={styles.agendamentosContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Carregando agendamentos...</ThemedText>
            </View>
          ) : filteredAgendamentos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="calendar" size={48} color={Colors[theme].icon} />
              <ThemedText style={styles.emptyText}>Nenhum agendamento encontrado</ThemedText>
            </View>
          ) : (
            filteredAgendamentos.map((agendamento) => (
            <View 
              key={agendamento.id} 
              style={[styles.agendamentoCard, { backgroundColor: Colors[theme].card }]}
            >
              <View style={styles.agendamentoInfo}>
                <View style={styles.agendamentoHeader}>
                  <ThemedText style={styles.agendamentoNome}>{agendamento.nome}</ThemedText>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: agendamento.ativo ? '#4CAF50' : '#F44336' }
                  ]}>
                    <ThemedText style={styles.statusText}>
                      {agendamento.ativo ? 'Ativo' : 'Inativo'}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.agendamentoDetails}>
                  <View style={styles.detailItem}>
                    <IconSymbol name="calendar" size={12} color={Colors[theme].icon} />
                    <ThemedText style={styles.detailText}>{agendamento.diaSemana}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="clock.fill" size={12} color={Colors[theme].icon} />
                    <ThemedText style={styles.detailText}>{agendamento.horarioInicio} - {agendamento.horarioFim}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="tag.fill" size={12} color={Colors[theme].icon} />
                    <ThemedText style={styles.detailText}>{agendamento.categoria}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="star.fill" size={12} color={Colors[theme].icon} />
                    <ThemedText style={styles.detailText}>{agendamento.nivel}</ThemedText>
                  </View>
                </View>
                
                <View style={styles.vagasInfo}>
                  <IconSymbol name="person.3.fill" size={14} color={Colors[theme].accent} />
                  <ThemedText style={styles.vagasText}>{agendamento.maxAlunos} vagas disponíveis</ThemedText>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                  onPress={() => handleDeleteAgendamento(agendamento)}
                >
                  <IconSymbol name="trash.fill" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => handleEditAgendamento(agendamento)}
                >
                  <IconSymbol name="pencil" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: agendamento.ativo ? '#F44336' : '#4CAF50' }]}
                  onPress={() => handleToggleStatus(agendamento)}
                >
                  <IconSymbol 
                    name={agendamento.ativo ? 'pause.fill' : 'play.fill'} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
          )}
        </View>

        {/* Modal para adicionar agendamento */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Adicionar Agendamento</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <IconSymbol name="xmark" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nome do Treino *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  placeholder="Ex: Treino de Guarda"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Dia da Semana *</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map((dia) => (
                      <TouchableOpacity
                        key={dia}
                        style={[
                          styles.pickerOption,
                          formData.diaSemana === dia && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, diaSemana: dia})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.diaSemana === dia && { color: '#FFFFFF' }
                        ]}>{dia}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Horário de Início *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.horarioInicio}
                  onChangeText={(text) => setFormData({...formData, horarioInicio: text})}
                  placeholder="18:00"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Horário de Fim *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.horarioFim}
                  onChangeText={(text) => setFormData({...formData, horarioFim: text})}
                  placeholder="19:00"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Duração (minutos)</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.duracao.toString()}
                  onChangeText={(text) => setFormData({...formData, duracao: parseInt(text) || 60})}
                  placeholder="60"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Categoria</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Guarda', 'Passagem', 'Finalização', 'Defesa', 'Competição', 'Posição'].map((categoria) => (
                      <TouchableOpacity
                        key={categoria}
                        style={[
                          styles.pickerOption,
                          formData.categoria === categoria && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, categoria})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.categoria === categoria && { color: '#FFFFFF' }
                        ]}>{categoria}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nível</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Iniciante', 'Intermediário', 'Avançado', 'Mestre'].map((nivel) => (
                      <TouchableOpacity
                        key={nivel}
                        style={[
                          styles.pickerOption,
                          formData.nivel === nivel && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, nivel})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.nivel === nivel && { color: '#FFFFFF' }
                        ]}>{nivel}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Máximo de Alunos</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.maxAlunos.toString()}
                  onChangeText={(text) => setFormData({...formData, maxAlunos: parseInt(text) || 20})}
                  placeholder="20"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Descrição</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.descricao}
                  onChangeText={(text) => setFormData({...formData, descricao: text})}
                  placeholder="Descrição do treino"
                  placeholderTextColor={Colors[theme].icon}
                  multiline
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors[theme].icon }]}
                onPress={() => setShowAddModal(false)}
              >
                <ThemedText style={styles.modalButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors[theme].accent }]}
                onPress={handleSaveAgendamento}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Salvar</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </Modal>

        {/* Modal para editar agendamento */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Editar Agendamento</ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <IconSymbol name="xmark" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nome do Treino *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  placeholder="Ex: Treino de Guarda"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Dia da Semana *</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map((dia) => (
                      <TouchableOpacity
                        key={dia}
                        style={[
                          styles.pickerOption,
                          formData.diaSemana === dia && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, diaSemana: dia})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.diaSemana === dia && { color: '#FFFFFF' }
                        ]}>{dia}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Horário de Início *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.horarioInicio}
                  onChangeText={(text) => setFormData({...formData, horarioInicio: text})}
                  placeholder="18:00"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Horário de Fim *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.horarioFim}
                  onChangeText={(text) => setFormData({...formData, horarioFim: text})}
                  placeholder="19:00"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Duração (minutos)</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.duracao.toString()}
                  onChangeText={(text) => setFormData({...formData, duracao: parseInt(text) || 60})}
                  placeholder="60"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Categoria</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Guarda', 'Passagem', 'Finalização', 'Defesa', 'Competição', 'Posição'].map((categoria) => (
                      <TouchableOpacity
                        key={categoria}
                        style={[
                          styles.pickerOption,
                          formData.categoria === categoria && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, categoria})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.categoria === categoria && { color: '#FFFFFF' }
                        ]}>{categoria}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nível</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Iniciante', 'Intermediário', 'Avançado', 'Mestre'].map((nivel) => (
                      <TouchableOpacity
                        key={nivel}
                        style={[
                          styles.pickerOption,
                          formData.nivel === nivel && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, nivel})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.nivel === nivel && { color: '#FFFFFF' }
                        ]}>{nivel}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Máximo de Alunos</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.maxAlunos.toString()}
                  onChangeText={(text) => setFormData({...formData, maxAlunos: parseInt(text) || 20})}
                  placeholder="20"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Descrição</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.descricao}
                  onChangeText={(text) => setFormData({...formData, descricao: text})}
                  placeholder="Descrição do treino"
                  placeholderTextColor={Colors[theme].icon}
                  multiline
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors[theme].icon }]}
                onPress={() => setShowEditModal(false)}
              >
                <ThemedText style={styles.modalButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: Colors[theme].accent }]}
                onPress={handleUpdateAgendamento}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Atualizar</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </Modal>
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
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  agendamentosContainer: {
    marginBottom: 24,
  },
  agendamentoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  agendamentoInfo: {
    marginBottom: 16,
  },
  agendamentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agendamentoNome: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  agendamentoDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  vagasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vagasText: {
    fontSize: 12,
    marginLeft: 6,
    color: Colors.light.accent,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  pickerContainer: {
    borderRadius: 8,
    padding: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});