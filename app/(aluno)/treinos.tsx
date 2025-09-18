import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Treino {
  id: string;
  nome: string;
  categoria: string;
  duracao: string;
  nivel: string;
  tecnicas: number;
  descricao: string;
  thumbnail: string;
  progresso: number;
}

interface TarefaPessoal {
  id: string;
  texto: string;
  concluida: boolean;
}

export default function TreinosScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  

  const [tarefas, setTarefas] = useState<TarefaPessoal[]>([
    { id: '1', texto: 'Treinar guarda 3x por semana', concluida: false },
    { id: '2', texto: 'Praticar passagem com parceiro', concluida: true },
  ]);
  
  const [novaTarefa, setNovaTarefa] = useState('');
  
  const [mostrarTarefas, setMostrarTarefas] = useState(true);
  
  const [modoFoco, setModoFoco] = useState(false);
  
  useEffect(() => {
    if (modoFoco) {
      console.log('Modo foco ativado - priorizando treinos pendentes');
    }
  }, [modoFoco]);
  
  const [treinos] = useState<Treino[]>([
    {
      id: '1',
      nome: 'Treino de Guarda',
      categoria: 'Guarda',
      duracao: '45 min',
      nivel: 'Intermediário',
      tecnicas: 8,
      descricao: 'Treino focado em técnicas de guarda',
      thumbnail: 'https://picsum.photos/300/200?random=10',
      progresso: 75
    },
    {
      id: '2',
      nome: 'Treino de Passagem',
      categoria: 'Passagem',
      duracao: '30 min',
      nivel: 'Avançado',
      tecnicas: 6,
      descricao: 'Treino de passagem de guarda',
      thumbnail: 'https://picsum.photos/300/200?random=11',
      progresso: 0
    },
    {
      id: '3',
      nome: 'Treino de Finalização',
      categoria: 'Finalização',
      duracao: '40 min',
      nivel: 'Básico',
      tecnicas: 10,
      descricao: 'Treino de finalizações básicas',
      thumbnail: 'https://picsum.photos/300/200?random=12',
      progresso: 100
    },
    {
      id: '4',
      nome: 'Treino de Defesa',
      categoria: 'Defesa',
      duracao: '35 min',
      nivel: 'Intermediário',
      tecnicas: 7,
      descricao: 'Treino focado em defesas',
      thumbnail: 'https://picsum.photos/300/200?random=13',
      progresso: 25
    },
    {
      id: '5',
      nome: 'Treino de Competição',
      categoria: 'Competição',
      duracao: '60 min',
      nivel: 'Avançado',
      tecnicas: 12,
      descricao: 'Treino preparatório para competição',
      thumbnail: 'https://picsum.photos/300/200?random=14',
      progresso: 0
    }
  ]);

  const categories = ['todos', 'Guarda', 'Passagem', 'Finalização', 'Defesa', 'Competição'];

  const handleBack = () => {
    router.back();
  };

  const handleTreinoPress = (treino: Treino) => {
    console.log('Treino selecionado:', treino.nome);
  };

  const filteredTreinos = treinos.filter(treino => {
    const matchesSearch = treino.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treino.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || treino.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getProgressColor = (progresso: number) => {
    if (progresso === 0) return '#E0E0E0';
    if (progresso < 50) return '#FF9800';
    if (progresso < 100) return '#2196F3';
    return '#4CAF50';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme].card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={Colors[colorScheme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            placeholder="Buscar treinos..."
            placeholderTextColor={Colors[colorScheme].icon}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Filtros de categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && { backgroundColor: Colors[colorScheme].accent }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <ThemedText style={[
                styles.categoryText,
                selectedCategory === category && { color: '#FFFFFF' }
              ]}>
                {category === 'todos' ? 'Todos' : category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

  

        {/* Seção de Tarefas Pessoais */}
        <View style={[styles.tarefasContainer, { backgroundColor: Colors[theme].card }]}>
          <TouchableOpacity 
            style={styles.tarefasHeader}
            onPress={() => setMostrarTarefas(!mostrarTarefas)}
          >
            <ThemedText style={styles.tarefasTitle}>Minhas Tarefas de Treino</ThemedText>
            <IconSymbol 
              name={mostrarTarefas ? "chevron.up" : "chevron.down"} 
              size={20} 
              color={Colors[theme].text} 
            />
          </TouchableOpacity>
          
          {mostrarTarefas && (
            <View style={styles.tarefasContent}>
              {tarefas.map((tarefa) => (
                <View key={tarefa.id} style={styles.tarefaItem}>
                  <TouchableOpacity
                    style={styles.tarefaCheckbox}
                    onPress={() => {
                      const novasTarefas = tarefas.map(t => 
                        t.id === tarefa.id ? {...t, concluida: !t.concluida} : t
                      );
                      setTarefas(novasTarefas);
                    }}
                  >
                    <View style={[
                      styles.checkbox,
                      tarefa.concluida && { backgroundColor: Colors[theme].accent }
                    ]}>
                      {tarefa.concluida && (
                        <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <ThemedText style={[
                    styles.tarefaTexto,
                    tarefa.concluida && styles.tarefaConcluida
                  ]}>
                    {tarefa.texto}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.tarefaDelete}
                    onPress={() => {
                      const novasTarefas = tarefas.filter(t => t.id !== tarefa.id);
                      setTarefas(novasTarefas);
                    }}
                  >
                    <IconSymbol name="trash" size={18} color={Colors[theme].error} />
                  </TouchableOpacity>
                </View>
              ))}
              
              {/* Adicionar nova tarefa */}
              <View style={styles.novaTarefaContainer}>
                <TextInput
                  style={[styles.novaTarefaInput, { color: Colors[theme].text, borderColor: Colors[theme].border }]}
                  placeholder="Adicionar nova tarefa..."
                  placeholderTextColor={Colors[theme].icon}
                  value={novaTarefa}
                  onChangeText={setNovaTarefa}
                />
                <TouchableOpacity
                  style={[styles.novaTarefaButton, { backgroundColor: Colors[theme].accent }]}
                  onPress={() => {
                    if (novaTarefa.trim()) {
                      const novaTarefaObj = {
                        id: Date.now().toString(),
                        texto: novaTarefa,
                        concluida: false
                      };
                      setTarefas([...tarefas, novaTarefaObj]);
                      setNovaTarefa('');
                    } else {
                      Alert.alert('Atenção', 'Digite o texto da tarefa');
                    }
                  }}
                >
                  <IconSymbol name="plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Lista de treinos */}
        <View style={styles.treinosContainer}>
          {filteredTreinos.map((treino) => (
            <TouchableOpacity
              key={treino.id}
              style={[styles.treinoCard, { backgroundColor: Colors[colorScheme].card }]}
              onPress={() => handleTreinoPress(treino)}
            >
              <Image source={{ uri: treino.thumbnail }} style={styles.treinoThumbnail} />
              <View style={styles.treinoInfo}>
                <View style={styles.treinoHeader}>
                  <ThemedText style={styles.treinoNome}>{treino.nome}</ThemedText>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: '#E0E0E0' }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${treino.progresso}%`,
                            backgroundColor: getProgressColor(treino.progresso)
                          }
                        ]} 
                      />
                    </View>
                    <ThemedText style={styles.progressText}>{treino.progresso}%</ThemedText>
                  </View>
                </View>
                
                <ThemedText style={styles.treinoDescricao}>{treino.descricao}</ThemedText>
                
                <View style={styles.treinoDetails}>
                  <View style={styles.detailItem}>
                    <IconSymbol name="tag.fill" size={12} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.detailText}>{treino.categoria}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="clock.fill" size={12} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.detailText}>{treino.duracao}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="star.fill" size={12} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.detailText}>{treino.nivel}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="figure.martial.arts" size={12} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.detailText}>{treino.tecnicas} técnicas</ThemedText>
                  </View>
                </View>
                
                <View style={styles.treinoActions}>
                  {treino.progresso === 0 ? (
                    <TouchableOpacity style={styles.startButton}>
                      <IconSymbol name="play.circle.fill" size={20} color="#FFFFFF" />
                      <ThemedText style={styles.startButtonText}>Iniciar</ThemedText>
                    </TouchableOpacity>
                  ) : treino.progresso === 100 ? (
                    <TouchableOpacity style={styles.reviewButton}>
                      <IconSymbol name="eye.circle.fill" size={20} color={Colors[colorScheme].accent} />
                      <ThemedText style={styles.reviewButtonText}>Revisar</ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.continueButton}>
                      <IconSymbol name="arrow.right.circle.fill" size={20} color="#FFFFFF" />
                      <ThemedText style={styles.continueButtonText}>Continuar</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
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
  // Estilos para o Modo Foco
  focoContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  focoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  focoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  focoDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  // Estilos para Tarefas Pessoais
  tarefasContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tarefasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  tarefasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tarefasContent: {
    padding: 16,
    paddingTop: 0,
  },
  tarefaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tarefaCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarefaTexto: {
    flex: 1,
    fontSize: 16,
  },
  tarefaConcluida: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  tarefaDelete: {
    padding: 8,
  },
  novaTarefaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  novaTarefaInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  novaTarefaButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
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
  },
  placeholder: {
    width: 40,
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
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  treinosContainer: {
    marginBottom: 24,
  },
  treinoCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  treinoThumbnail: {
    width: '100%',
    height: 150,
  },
  treinoInfo: {
    padding: 16,
  },
  treinoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treinoNome: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
  },
  treinoDescricao: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  treinoDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  treinoActions: {
    alignItems: 'flex-end',
  },
  startButton: {
    backgroundColor: Colors.light.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.accent,
  },
  reviewButtonText: {
    color: Colors.light.accent,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
