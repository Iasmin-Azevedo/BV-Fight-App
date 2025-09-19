import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { UserData, UserService } from '@/firebase/firebaseService';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function GerenciarUsuariosScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Formulário para adicionar/editar usuário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    numero: '',
    dataNascimento: '',
    genero: 'Masculino',
    faixa: 'Branca',
    tipo: 'aluno' as 'aluno' | 'admin',
    descricao: ''
  });

  // Carregar usuários do Firebase
  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await UserService.getAllUsers();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddUsuario = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      cpf: '',
      numero: '',
      dataNascimento: '',
      genero: 'Masculino',
      faixa: 'Branca',
      tipo: 'aluno',
      descricao: ''
    });
    setShowAddModal(true);
  };

  const handleSaveUsuario = async () => {
    try {
      if (!formData.nome.trim() || !formData.email.trim() || !formData.senha.trim()) {
        Alert.alert('Erro', 'Nome, email e senha são obrigatórios');
        return;
      }

      const usuarioData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        numero: formData.numero.trim(),
        dataNascimento: formData.dataNascimento.trim(),
        genero: formData.genero,
        faixa: formData.faixa,
        tipo: formData.tipo
      };

      // Criar usuário no Firebase Auth e Firestore
      const success = await UserService.createUserWithPassword(usuarioData, formData.senha);
      
      if (success) {
        await loadUsuarios();
        setShowAddModal(false);
        Alert.alert('Sucesso', 'Usuário adicionado com sucesso!');
      } else {
        Alert.alert('Erro', 'Erro ao criar usuário. Verifique se o email já não está em uso.');
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      Alert.alert('Erro', 'Erro ao adicionar usuário');
    }
  };

  const handleEditUsuario = (usuario: UserData) => {
    setSelectedUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Não mostramos a senha atual
      cpf: usuario.cpf,
      numero: usuario.numero,
      dataNascimento: usuario.dataNascimento,
      genero: usuario.genero,
      faixa: usuario.faixa,
      tipo: usuario.tipo,
      descricao: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUsuario = async () => {
    try {
      if (!selectedUsuario?.uid) return;
      if (!formData.nome.trim() || !formData.email.trim()) {
        Alert.alert('Erro', 'Nome e email são obrigatórios');
        return;
      }

      const updateData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        numero: formData.numero.trim(),
        dataNascimento: formData.dataNascimento.trim(),
        genero: formData.genero,
        faixa: formData.faixa,
        tipo: formData.tipo
      };

      await UserService.updateUser(selectedUsuario.uid, updateData);
      await loadUsuarios();
      setShowEditModal(false);
      setSelectedUsuario(null);
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      Alert.alert('Erro', 'Erro ao atualizar usuário');
    }
  };

  const handleToggleTipo = (usuario: UserData) => {
    const newTipo = usuario.tipo === 'aluno' ? 'admin' : 'aluno';
    Alert.alert(
      'Alterar Tipo',
      `Deseja alterar o tipo do usuário "${usuario.nome}" para ${newTipo}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (usuario.uid) {
                await UserService.updateUser(usuario.uid, { tipo: newTipo });
                await loadUsuarios();
                Alert.alert('Sucesso', `Tipo alterado para ${newTipo}`);
              }
            } catch (error) {
              console.error('Erro ao alterar tipo:', error);
              Alert.alert('Erro', 'Erro ao alterar tipo do usuário');
            }
          }
        }
      ]
    );
  };

  const handleDeleteUsuario = (usuario: UserData) => {
    Alert.alert(
      'Excluir Usuário',
      `Deseja realmente excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (usuario.uid) {
                // Deletar do Firestore
                await UserService.deleteUser(usuario.uid);
                await loadUsuarios();
                Alert.alert('Sucesso', 'Usuário excluído com sucesso');
              }
            } catch (error) {
              console.error('Erro ao excluir usuário:', error);
              Alert.alert('Erro', 'Erro ao excluir usuário');
            }
          }
        }
      ]
    );
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'admin': return '#9C27B0';
      case 'aluno': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case 'admin': return 'Admin';
      case 'aluno': return 'Aluno';
      default: return 'Desconhecido';
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.faixa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatUltimoAcesso = (timestamp: any) => {
    if (!timestamp) return 'Nunca';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[theme].card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Buscar usuários..."
            placeholderTextColor={Colors[theme].icon}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{usuarios.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{usuarios.filter(u => u.tipo === 'aluno').length}</ThemedText>
            <ThemedText style={styles.statLabel}>Alunos</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{usuarios.filter(u => u.tipo === 'admin').length}</ThemedText>
            <ThemedText style={styles.statLabel}>Admins</ThemedText>
          </View>
        </View>

        {/* Botão de adicionar usuário */}
        <TouchableOpacity 
          style={[styles.addUsuarioButton, { backgroundColor: Colors[theme].accent }]}
          onPress={handleAddUsuario}
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addUsuarioText}>Adicionar Usuário</ThemedText>
        </TouchableOpacity>

        {/* Lista de usuários */}
        <View style={styles.usuariosContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Carregando usuários...</ThemedText>
            </View>
          ) : filteredUsuarios.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="person.3.fill" size={48} color={Colors[theme].icon} />
              <ThemedText style={styles.emptyText}>Nenhum usuário encontrado</ThemedText>
            </View>
          ) : (
            filteredUsuarios.map((usuario) => (
            <View 
              key={usuario.uid} 
              style={[styles.usuarioCard, { backgroundColor: Colors[theme].card }]}
            >
              <View style={styles.usuarioInfo}>
                <View style={styles.usuarioHeader}>
                  <View style={styles.avatarContainer}>
                    {usuario.avatar ? (
                      <Image source={{ uri: usuario.avatar }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[theme].accent }]}>
                        <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.usuarioDetails}>
                    <ThemedText style={styles.usuarioNome}>{usuario.nome}</ThemedText>
                    <ThemedText style={styles.usuarioEmail}>{usuario.email}</ThemedText>
                    {usuario.numero && (
                      <ThemedText style={styles.usuarioTelefone}>{usuario.numero}</ThemedText>
                    )}
                    <View style={styles.usuarioStats}>
                      <View style={styles.statItem}>
                        <IconSymbol name="figure.martial.arts" size={12} color={Colors[theme].icon} />
                        <ThemedText style={styles.statText}>{usuario.faixa}</ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <IconSymbol name="person.badge.key.fill" size={12} color={Colors[theme].icon} />
                        <ThemedText style={styles.statText}>{usuario.tipo}</ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <IconSymbol name="calendar" size={12} color={Colors[theme].icon} />
                        <ThemedText style={styles.statText}>{usuario.dataNascimento}</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View style={[
                    styles.tipoBadge, 
                    { backgroundColor: getTipoColor(usuario.tipo) }
                  ]}>
                    <ThemedText style={styles.tipoText}>
                      {getTipoText(usuario.tipo)}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.usuarioFooter}>
                  <View style={styles.ultimoAcesso}>
                    <IconSymbol name="clock.fill" size={12} color={Colors[theme].icon} />
                    <ThemedText style={styles.ultimoAcessoText}>
                      Criado em: {usuario.criadoEm ? new Date(usuario.criadoEm).toLocaleDateString('pt-BR') : 'N/A'}
                    </ThemedText>
                  </View>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                  onPress={() => handleDeleteUsuario(usuario)}
                >
                  <IconSymbol name="trash.fill" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => handleEditUsuario(usuario)}
                >
                  <IconSymbol name="pencil" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                  onPress={() => handleToggleTipo(usuario)}
                >
                  <IconSymbol name="arrow.triangle.2.circlepath" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
          )}
        </View>

        {/* Modal para adicionar usuário */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Adicionar Usuário</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <IconSymbol name="xmark" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nome *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  placeholder="Nome completo"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Email *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Senha *</ThemedText>
                <View style={[styles.passwordContainer, { backgroundColor: Colors[theme].card }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: Colors[theme].text }]}
                    value={formData.senha}
                    onChangeText={(text) => setFormData({...formData, senha: text})}
                    placeholder="Senha"
                    placeholderTextColor={Colors[theme].icon}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <IconSymbol
                      name={showPassword ? "eye.slash.fill" : "eye.fill"}
                      size={20}
                      color={Colors[theme].icon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>CPF</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.cpf}
                  onChangeText={(text) => setFormData({...formData, cpf: text})}
                  placeholder="000.000.000-00"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Telefone</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.numero}
                  onChangeText={(text) => setFormData({...formData, numero: text})}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Data de Nascimento</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.dataNascimento}
                  onChangeText={(text) => setFormData({...formData, dataNascimento: text})}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Gênero</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Masculino', 'Feminino', 'Outro'].map((genero) => (
                      <TouchableOpacity
                        key={genero}
                        style={[
                          styles.pickerOption,
                          formData.genero === genero && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, genero})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.genero === genero && { color: '#FFFFFF' }
                        ]}>{genero}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Telefone</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.numero}
                  onChangeText={(text) => setFormData({...formData, numero: text})}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Faixa</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map((faixa) => (
                      <TouchableOpacity
                        key={faixa}
                        style={[
                          styles.pickerOption,
                          formData.faixa === faixa && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, faixa})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.faixa === faixa && { color: '#FFFFFF' }
                        ]}>{faixa}</ThemedText>
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
                          formData.faixa === nivel && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, faixa: nivel})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.faixa === nivel && { color: '#FFFFFF' }
                        ]}>{nivel}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Endereço</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.numero}
                  onChangeText={(text) => setFormData({...formData, numero: text})}
                  placeholder="Endereço completo"
                  placeholderTextColor={Colors[theme].icon}
                  multiline
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Observações</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.descricao}
                  onChangeText={(text) => setFormData({...formData, descricao: text})}
                  placeholder="Observações sobre o aluno"
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
                onPress={handleSaveUsuario}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Salvar</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </Modal>

        {/* Modal para editar usuário */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Editar Usuário</ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <IconSymbol name="xmark" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nome *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  placeholder="Nome completo"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Email *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Telefone</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.numero}
                  onChangeText={(text) => setFormData({...formData, numero: text})}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={Colors[theme].icon}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Faixa</ThemedText>
                <View style={[styles.pickerContainer, { backgroundColor: Colors[theme].card }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map((faixa) => (
                      <TouchableOpacity
                        key={faixa}
                        style={[
                          styles.pickerOption,
                          formData.faixa === faixa && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, faixa})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.faixa === faixa && { color: '#FFFFFF' }
                        ]}>{faixa}</ThemedText>
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
                          formData.faixa === nivel && { backgroundColor: Colors[theme].accent }
                        ]}
                        onPress={() => setFormData({...formData, faixa: nivel})}
                      >
                        <ThemedText style={[
                          styles.pickerOptionText,
                          formData.faixa === nivel && { color: '#FFFFFF' }
                        ]}>{nivel}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Endereço</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.numero}
                  onChangeText={(text) => setFormData({...formData, numero: text})}
                  placeholder="Endereço completo"
                  placeholderTextColor={Colors[theme].icon}
                  multiline
                />
              </View>
              
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Observações</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: Colors[theme].card, color: Colors[theme].text }]}
                  value={formData.descricao}
                  onChangeText={(text) => setFormData({...formData, descricao: text})}
                  placeholder="Observações sobre o aluno"
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
                onPress={handleUpdateUsuario}
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
  alunosContainer: {
    marginBottom: 24,
  },
  alunoCard: {
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
    marginBottom: 16,
  },
  alunoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alunoDetails: {
    flex: 1,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alunoEmail: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  alunoStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 11,
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
  alunoFooter: {
    marginTop: 8,
  },
  ultimoAcesso: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ultimoAcessoText: {
    fontSize: 11,
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
  alunoTelefone: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 4,
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
  addAlunoButton: {
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
  addUsuarioText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  usuariosContainer: {
    marginBottom: 24,
  },
  usuarioCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usuarioInfo: {
    marginBottom: 16,
  },
  usuarioHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  usuarioDetails: {
    flex: 1,
  },
  usuarioNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  usuarioEmail: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  usuarioTelefone: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 4,
  },
  usuarioStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  usuarioFooter: {
    marginTop: 8,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tipoText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addUsuarioButton: {
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
});
