import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Tecnica, TecnicaService } from '@/firebase/tecnicaService';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function GerenciarTecnicasScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTecnica, setSelectedTecnica] = useState<Tecnica | null>(null);
  
  // Formulário para adicionar/editar técnica
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Finalização',
    posicao: 'Guarda Fechada',
    nivel: 'Iniciante',
    descricao: '',
    videoUrl: '',
    thumbnail: '',
    observacoes: ''
  });

  // Carregar técnicas do Firebase
  useEffect(() => {
    loadTecnicas();
  }, []);

  const loadTecnicas = async () => {
    try {
      setLoading(true);
      console.log('GerenciarTecnicas: Iniciando carregamento de técnicas...');
      const tecnicasData = await TecnicaService.getAllTecnicas();
      console.log('GerenciarTecnicas: Técnicas carregadas:', tecnicasData.length);
      setTecnicas(tecnicasData);
    } catch (error) {
      console.error('Erro ao carregar técnicas:', error);
      console.error('Erro detalhado:', error);
      Alert.alert('Erro', 'Erro ao carregar técnicas');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddTecnica = () => {
    setFormData({
      nome: '',
      categoria: 'Finalização',
      posicao: 'Guarda Fechada',
      nivel: 'Iniciante',
      descricao: '',
      videoUrl: '',
      thumbnail: '',
      observacoes: ''
    });
    setShowAddModal(true);
  };

  const handleSaveTecnica = async () => {
    try {
      if (!formData.nome.trim()) {
        Alert.alert('Erro', 'Nome da técnica é obrigatório');
        return;
      }

      console.log('GerenciarTecnicas: Salvando técnica:', formData);

      const tecnicaData = {
        nome: formData.nome.trim(),
        categoria: formData.categoria,
        posicao: formData.posicao,
        nivel: formData.nivel,
        descricao: formData.descricao.trim(),
        videoUrl: formData.videoUrl.trim(),
        thumbnail: formData.thumbnail.trim(),
        observacoes: formData.observacoes.trim(),
        status: 'ativo' as const
      };

      console.log('GerenciarTecnicas: Dados da técnica a serem salvos:', tecnicaData);
      await TecnicaService.addTecnica(tecnicaData);
      console.log('GerenciarTecnicas: Técnica salva com sucesso');
      await loadTecnicas();
      setShowAddModal(false);
      Alert.alert('Sucesso', 'Técnica adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar técnica:', error);
      console.error('Erro detalhado:', error);
      Alert.alert('Erro', 'Erro ao adicionar técnica');
    }
  };

  const handleEditTecnica = (tecnica: Tecnica) => {
    setSelectedTecnica(tecnica);
    setFormData({
      nome: tecnica.nome,
      categoria: tecnica.categoria,
      posicao: tecnica.posicao,
      nivel: tecnica.nivel,
      descricao: tecnica.descricao,
      videoUrl: tecnica.videoUrl || '',
      thumbnail: tecnica.thumbnail || '',
      observacoes: tecnica.observacoes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateTecnica = async () => {
    try {
      if (!selectedTecnica?.id) return;
      if (!formData.nome.trim()) {
        Alert.alert('Erro', 'Nome da técnica é obrigatório');
        return;
      }

      console.log('GerenciarTecnicas: Atualizando técnica:', selectedTecnica.id, formData);

      const updateData = {
        nome: formData.nome.trim(),
        categoria: formData.categoria,
        posicao: formData.posicao,
        nivel: formData.nivel,
        descricao: formData.descricao.trim(),
        videoUrl: formData.videoUrl.trim(),
        thumbnail: formData.thumbnail.trim(),
        observacoes: formData.observacoes.trim()
      };

      console.log('GerenciarTecnicas: Dados da técnica a serem atualizados:', updateData);
      await TecnicaService.updateTecnica(selectedTecnica.id, updateData);
      console.log('GerenciarTecnicas: Técnica atualizada com sucesso');
      await loadTecnicas();
      setShowEditModal(false);
      setSelectedTecnica(null);
      Alert.alert('Sucesso', 'Técnica atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar técnica:', error);
      console.error('Erro detalhado:', error);
      Alert.alert('Erro', 'Erro ao atualizar técnica');
    }
  };

  const handleToggleStatus = (tecnica: Tecnica) => {
    const newStatus = tecnica.status === 'ativo' ? 'inativo' : 'ativo';
    Alert.alert(
      'Alterar Status',
      `Deseja ${newStatus === 'ativo' ? 'ativar' : 'desativar'} a técnica "${tecnica.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (tecnica.id) {
                console.log('GerenciarTecnicas: Alterando status da técnica:', tecnica.id, 'para:', newStatus);
                await TecnicaService.updateTecnicaStatus(tecnica.id, newStatus);
                console.log('GerenciarTecnicas: Status alterado com sucesso');
                await loadTecnicas();
                Alert.alert('Sucesso', `Status alterado para ${newStatus}`);
              }
            } catch (error) {
              console.error('Erro ao alterar status:', error);
              console.error('Erro detalhado:', error);
              Alert.alert('Erro', 'Erro ao alterar status da técnica');
            }
          }
        }
      ]
    );
  };

  const handleDeleteTecnica = (tecnica: Tecnica) => {
    Alert.alert(
      'Excluir Técnica',
      `Deseja realmente excluir a técnica "${tecnica.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (tecnica.id) {
                console.log('GerenciarTecnicas: Excluindo técnica:', tecnica.id);
                await TecnicaService.deleteTecnica(tecnica.id);
                console.log('GerenciarTecnicas: Técnica excluída com sucesso');
                await loadTecnicas();
                Alert.alert('Sucesso', 'Técnica excluída com sucesso');
              }
            } catch (error) {
              console.error('Erro ao excluir técnica:', error);
              console.error('Erro detalhado:', error);
              Alert.alert('Erro', 'Erro ao excluir técnica');
            }
          }
        }
      ]
    );
  };

  const filteredTecnicas = tecnicas.filter(tecnica =>
    tecnica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tecnica.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tecnica.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tecnica.posicao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[theme].card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Buscar técnicas..."
            placeholderTextColor={Colors[theme].icon}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{tecnicas.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{tecnicas.filter(t => t.status === 'ativo').length}</ThemedText>
            <ThemedText style={styles.statLabel}>Ativas</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{[...new Set(tecnicas.map(t => t.categoria))].length}</ThemedText>
            <ThemedText style={styles.statLabel}>Categorias</ThemedText>
          </View>
        </View>

        {/* Botão de adicionar técnica */}
        <TouchableOpacity 
          style={[styles.addTecnicaButton, { backgroundColor: Colors[theme].accent }]}
          onPress={handleAddTecnica}
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addTecnicaText}>Adicionar Técnica</ThemedText>
        </TouchableOpacity>

        {/* Lista de técnicas */}
        <View style={styles.tecnicasContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Carregando técnicas...</ThemedText>
            </View>
          ) : filteredTecnicas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="book.fill" size={48} color={Colors[theme].icon} />
              <ThemedText style={styles.emptyText}>Nenhuma técnica encontrada</ThemedText>
            </View>
          ) : (
            filteredTecnicas.map((tecnica) => (
              <View 
                key={tecnica.id} 
                style={[styles.tecnicaCard, { backgroundColor: Colors[theme].card }]}
              >
                <View style={styles.tecnicaInfo}>
                  <View style={styles.tecnicaHeader}>
                    <ThemedText style={styles.tecnicaNome}>{tecnica.nome}</ThemedText>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: tecnica.status === 'ativo' ? '#4CAF50' : '#F44336' }
                    ]}>
                      <ThemedText style={styles.statusText}>
                        {tecnica.status === 'ativo' ? 'Ativa' : 'Inativa'}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <ThemedText style={styles.tecnicaDescricao}>{tecnica.descricao}</ThemedText>
                  
                  <View style={styles.tecnicaDetails}>
                    <View style={styles.detailItem}>
                      <IconSymbol name="tag.fill" size={12} color={Colors[theme].icon} />
                      <ThemedText style={styles.detailText}>{tecnica.categoria}</ThemedText>
                    </View>
                    <View style={styles.detailItem}>
                      <IconSymbol name="figure.martial.arts" size={12} color={Colors[theme].icon} />
                      <ThemedText style={styles.detailText}>{tecnica.posicao}</ThemedText>
                    </View>
                    <View style={styles.detailItem}>
                      <IconSymbol name="star.fill" size={12} color={Colors[theme].icon} />
                      <ThemedText style={styles.detailText}>{tecnica.nivel}</ThemedText>
                    </View>
                  </View>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                    onPress={() => handleEditTecnica(tecnica)}
                  >
                    <IconSymbol name="pencil" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: tecnica.status === 'ativo' ? '#F44336' : '#4CAF50' }]}
                    onPress={() => handleToggleStatus(tecnica)}
                  >
                    <IconSymbol 
                      name={tecnica.status === 'ativo' ? 'pause.fill' : 'play.fill'} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                    onPress={() => handleDeleteTecnica(tecnica)}
                  >
                    <IconSymbol name="trash.fill" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Modal para adicionar técnica */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Adicionar Técnica</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <IconSymbol name="xmark" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nome da Técnica *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  placeholder="Ex: Armlock da Guarda"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Categoria</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Finalização', 'Passagem', 'Defesa', 'Posição', 'Transição'].map((categoria) => (
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
                <ThemedText style={styles.formLabel}>Posição</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Guarda Fechada', 'Guarda Aberta', 'Meia Guarda', 'Montada', 'Quatro Apoios', 'De Lado'].map((posicao) => (
                      <TouchableOpacity
                        key={posicao}
                        style={[
                          styles.pickerOption,
                          formData.posicao === posicao && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, posicao})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.posicao === posicao && { color: '#FFFFFF' }
                        ]}>{posicao}</ThemedText>
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
                <ThemedText style={styles.formLabel}>Descrição</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.descricao}
                  onChangeText={(text) => setFormData({...formData, descricao: text})}
                  placeholder="Descrição da técnica"
                  placeholderTextColor={Colors[theme].icon}
                  multiline
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>URL do Vídeo</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.videoUrl}
                  onChangeText={(text) => setFormData({...formData, videoUrl: text})}
                  placeholder="https://exemplo.com/video"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>URL da Thumbnail</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.thumbnail}
                  onChangeText={(text) => setFormData({...formData, thumbnail: text})}
                  placeholder="https://exemplo.com/imagem.jpg"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Observações</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.observacoes}
                  onChangeText={(text) => setFormData({...formData, observacoes: text})}
                  placeholder="Observações sobre a técnica"
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
                onPress={handleSaveTecnica}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Salvar</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </Modal>

        {/* Modal para editar técnica */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Editar Técnica</ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <IconSymbol name="xmark" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nome da Técnica *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  placeholder="Ex: Armlock da Guarda"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Categoria</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Finalização', 'Passagem', 'Defesa', 'Posição', 'Transição'].map((categoria) => (
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
                <ThemedText style={styles.formLabel}>Posição</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Guarda Fechada', 'Guarda Aberta', 'Meia Guarda', 'Montada', 'Quatro Apoios', 'De Lado'].map((posicao) => (
                      <TouchableOpacity
                        key={posicao}
                        style={[
                          styles.pickerOption,
                          formData.posicao === posicao && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, posicao})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.posicao === posicao && { color: '#FFFFFF' }
                        ]}>{posicao}</ThemedText>
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
                <ThemedText style={styles.formLabel}>Descrição</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.descricao}
                  onChangeText={(text) => setFormData({...formData, descricao: text})}
                  placeholder="Descrição da técnica"
                  placeholderTextColor={Colors[theme].icon}
                  multiline
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>URL do Vídeo</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.videoUrl}
                  onChangeText={(text) => setFormData({...formData, videoUrl: text})}
                  placeholder="https://exemplo.com/video"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>URL da Thumbnail</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.thumbnail}
                  onChangeText={(text) => setFormData({...formData, thumbnail: text})}
                  placeholder="https://exemplo.com/imagem.jpg"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Observações</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.observacoes}
                  onChangeText={(text) => setFormData({...formData, observacoes: text})}
                  placeholder="Observações sobre a técnica"
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
                onPress={handleUpdateTecnica}
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
  tecnicasContainer: {
    marginBottom: 24,
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
  tecnicaCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tecnicaInfo: {
    marginBottom: 16,
  },
  tecnicaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tecnicaNome: {
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
  tecnicaDescricao: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  tecnicaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  addTecnicaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addTecnicaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
