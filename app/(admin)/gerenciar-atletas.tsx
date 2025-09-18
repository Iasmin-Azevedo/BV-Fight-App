import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Atleta {
  id: string;
  nome: string;
  categoria: string;
  peso: string;
  faixa: string;
  status: 'ativo' | 'inativo';
  tecnicas: number;
  vitorias: number;
  derrotas: number;
  avatar?: string;
}

export default function GerenciarAtletasScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [atletas] = useState<Atleta[]>([
    { id: '1', nome: 'André Galvão', categoria: 'Peso Médio', peso: '84kg', faixa: 'Preta 3º Grau', status: 'ativo', tecnicas: 25, vitorias: 45, derrotas: 8, avatar: 'https://picsum.photos/100/100?random=10' },
    { id: '2', nome: 'Bernardo Faria', categoria: 'Peso Pesado', peso: '94kg', faixa: 'Preta 5º Grau', status: 'ativo', tecnicas: 30, vitorias: 52, derrotas: 12, avatar: 'https://picsum.photos/100/100?random=11' },
    { id: '3', nome: 'Leandro Lo', categoria: 'Peso Leve', peso: '76kg', faixa: 'Preta 4º Grau', status: 'ativo', tecnicas: 28, vitorias: 38, derrotas: 15, avatar: 'https://picsum.photos/100/100?random=12' },
    { id: '4', nome: 'Rodolfo Vieira', categoria: 'Peso Pesado', peso: '100kg', faixa: 'Preta 2º Grau', status: 'ativo', tecnicas: 22, vitorias: 42, derrotas: 6, avatar: 'https://picsum.photos/100/100?random=13' },
    { id: '5', nome: 'Felipe Pena', categoria: 'Peso Médio', peso: '82kg', faixa: 'Preta 1º Grau', status: 'inativo', tecnicas: 18, vitorias: 28, derrotas: 10, avatar: 'https://picsum.photos/100/100?random=14' },
    { id: '6', nome: 'Lucas Lepri', categoria: 'Peso Leve', peso: '74kg', faixa: 'Preta 6º Grau', status: 'ativo', tecnicas: 35, vitorias: 58, derrotas: 9, avatar: 'https://picsum.photos/100/100?random=15' },
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleAddAtleta = () => {
    Alert.alert('Adicionar Atleta', 'Funcionalidade em desenvolvimento');
  };

  const handleEditAtleta = (atleta: Atleta) => {
    Alert.alert('Editar Atleta', `Editar: ${atleta.nome}`);
  };

  const handleToggleStatus = (atleta: Atleta) => {
    Alert.alert(
      'Alterar Status',
      `Deseja ${atleta.status === 'ativo' ? 'desativar' : 'ativar'} o atleta "${atleta.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive' }
      ]
    );
  };

  const handleViewProfile = (atleta: Atleta) => {
    Alert.alert('Perfil do Atleta', `Ver perfil de: ${atleta.nome}`);
  };

  const filteredAtletas = atletas.filter(atleta =>
    atleta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atleta.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atleta.faixa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWinRate = (vitorias: number, derrotas: number) => {
    const total = vitorias + derrotas;
    if (total === 0) return '0%';
    return `${Math.round((vitorias / total) * 100)}%`;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[theme].card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Buscar atletas..."
            placeholderTextColor={Colors[theme].icon}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{atletas.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{atletas.filter(a => a.status === 'ativo').length}</ThemedText>
            <ThemedText style={styles.statLabel}>Ativos</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme].card }]}>
            <ThemedText style={styles.statValue}>{atletas.reduce((acc, a) => acc + a.vitorias, 0)}</ThemedText>
            <ThemedText style={styles.statLabel}>Vitórias</ThemedText>
          </View>
        </View>

        {/* Botão de adicionar atleta */}
        <TouchableOpacity 
          style={[styles.addAtletaButton, { backgroundColor: Colors[theme].accent }]}
          onPress={handleAddAtleta}
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addAtletaText}>Adicionar Atleta</ThemedText>
        </TouchableOpacity>

        {/* Lista de atletas */}
        <View style={styles.atletasContainer}>
          {filteredAtletas.map((atleta) => (
            <View 
              key={atleta.id} 
              style={[styles.atletaCard, { backgroundColor: Colors[theme].card }]}
            >
              <View style={styles.atletaInfo}>
                <View style={styles.atletaHeader}>
                  <View style={styles.avatarContainer}>
                    {atleta.avatar ? (
                      <Image source={{ uri: atleta.avatar }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[theme].accent }]}>
                        <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.atletaDetails}>
                    <ThemedText style={styles.atletaNome}>{atleta.nome}</ThemedText>
                    <View style={styles.atletaStats}>
                      <View style={styles.statItem}>
                        <IconSymbol name="scalemass.fill" size={12} color={Colors[theme].icon} />
                        <ThemedText style={styles.statText}>{atleta.categoria} ({atleta.peso})</ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <IconSymbol name="figure.martial.arts" size={12} color={Colors[theme].icon} />
                        <ThemedText style={styles.statText}>{atleta.faixa}</ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <IconSymbol name="figure.martial.arts" size={12} color={Colors[theme].icon} />
                        <ThemedText style={styles.statText}>{atleta.tecnicas} técnicas</ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: atleta.status === 'ativo' ? '#4CAF50' : '#F44336' }
                  ]}>
                    <ThemedText style={styles.statusText}>
                      {atleta.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.performanceContainer}>
                  <View style={styles.performanceItem}>
                    <ThemedText style={styles.performanceLabel}>Vitórias</ThemedText>
                    <ThemedText style={[styles.performanceValue, { color: '#4CAF50' }]}>{atleta.vitorias}</ThemedText>
                  </View>
                  <View style={styles.performanceItem}>
                    <ThemedText style={styles.performanceLabel}>Derrotas</ThemedText>
                    <ThemedText style={[styles.performanceValue, { color: '#F44336' }]}>{atleta.derrotas}</ThemedText>
                  </View>
                  <View style={styles.performanceItem}>
                    <ThemedText style={styles.performanceLabel}>Taxa de Vitória</ThemedText>
                    <ThemedText style={[styles.performanceValue, { color: Colors[theme].accent }]}>
                      {getWinRate(atleta.vitorias, atleta.derrotas)}
                    </ThemedText>
                  </View>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: Colors[theme].accent }]}
                  onPress={() => handleViewProfile(atleta)}
                >
                  <IconSymbol name="eye.fill" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => handleEditAtleta(atleta)}
                >
                  <IconSymbol name="pencil" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: atleta.status === 'ativo' ? '#F44336' : '#4CAF50' }]}
                  onPress={() => handleToggleStatus(atleta)}
                >
                  <IconSymbol 
                    name={atleta.status === 'ativo' ? 'pause.fill' : 'play.fill'} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  atletasContainer: {
    marginBottom: 24,
  },
  atletaCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  atletaInfo: {
    marginBottom: 16,
  },
  atletaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  atletaDetails: {
    flex: 1,
  },
  atletaNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  atletaStats: {
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
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceLabel: {
    fontSize: 10,
    opacity: 0.7,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
  addAtletaButton: {
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
  addAtletaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
