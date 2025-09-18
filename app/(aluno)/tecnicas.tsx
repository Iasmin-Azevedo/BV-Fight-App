import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Tecnica, TecnicaService } from '@/firebase/tecnicaService';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function TecnicasScreen() {
  const colorScheme = useColorScheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['todas']);

  // Carregar técnicas do Firebase
  useEffect(() => {
    loadTecnicas();
  }, []);

  const loadTecnicas = async () => {
    try {
      setLoading(true);
      const [tecnicasData, categoriasData] = await Promise.all([
        TecnicaService.getTecnicasAtivas(),
        TecnicaService.getCategorias()
      ]);
      setTecnicas(tecnicasData);
      setCategories(['todas', ...categoriasData]);
    } catch (error) {
      console.error('Erro ao carregar técnicas:', error);
      Alert.alert('Erro', 'Erro ao carregar técnicas');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleTecnicaPress = (tecnica: Tecnica) => {
    // Aqui você pode navegar para uma tela de detalhes da técnica
    Alert.alert(
      tecnica.nome,
      `${tecnica.descricao}\n\nCategoria: ${tecnica.categoria}\nPosição: ${tecnica.posicao}\nNível: ${tecnica.nivel}`,
      [
        { text: 'Fechar', style: 'cancel' },
        tecnica.videoUrl ? { text: 'Ver Vídeo', onPress: () => {
          // Aqui você pode abrir o vídeo
          console.log('Abrir vídeo:', tecnica.videoUrl);
        }} : null
      ].filter(Boolean)
    );
  };

  const filteredTecnicas = tecnicas.filter(tecnica => {
    const matchesSearch = tecnica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tecnica.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || tecnica.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme].card }]}>
          <IconSymbol name="magnifyingglass" size={20} color={Colors[colorScheme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            placeholder="Buscar técnicas..."
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
                {category === 'todas' ? 'Todas' : category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de técnicas */}
        <View style={styles.tecnicasContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Carregando técnicas...</ThemedText>
            </View>
          ) : filteredTecnicas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="book.fill" size={48} color={Colors[colorScheme].icon} />
              <ThemedText style={styles.emptyText}>Nenhuma técnica encontrada</ThemedText>
            </View>
          ) : (
            filteredTecnicas.map((tecnica) => (
            <TouchableOpacity
              key={tecnica.id}
              style={[styles.tecnicaCard, { backgroundColor: Colors[colorScheme].card }]}
              onPress={() => handleTecnicaPress(tecnica)}
            >
              {tecnica.thumbnail ? (
                <Image source={{ uri: tecnica.thumbnail }} style={styles.tecnicaThumbnail} />
              ) : (
                <View style={[styles.tecnicaThumbnail, styles.placeholderThumbnail, { backgroundColor: Colors[colorScheme].card }]}>
                  <IconSymbol name="video.fill" size={32} color={Colors[colorScheme].icon} />
                </View>
              )}
              <View style={styles.tecnicaInfo}>
                <ThemedText style={styles.tecnicaNome}>{tecnica.nome}</ThemedText>
                <ThemedText style={styles.tecnicaDescricao}>{tecnica.descricao}</ThemedText>
                <View style={styles.tecnicaDetails}>
                  <View style={styles.detailItem}>
                    <IconSymbol name="tag.fill" size={12} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.detailText}>{tecnica.categoria}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="figure.martial.arts" size={12} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.detailText}>{tecnica.posicao}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol name="star.fill" size={12} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.detailText}>{tecnica.nivel}</ThemedText>
                  </View>
                </View>
                <View style={styles.playButton}>
                  <IconSymbol name="play.circle.fill" size={24} color={Colors[colorScheme].accent} />
                </View>
              </View>
            </TouchableOpacity>
          ))
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
  tecnicasContainer: {
    marginBottom: 24,
  },
  tecnicaCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tecnicaThumbnail: {
    width: 120,
    height: 90,
  },
  tecnicaInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  tecnicaNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tecnicaDescricao: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  tecnicaDetails: {
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
    fontSize: 11,
    marginLeft: 4,
    opacity: 0.7,
  },
  playButton: {
    alignSelf: 'flex-end',
  },
  placeholderThumbnail: {
    alignItems: 'center',
    justifyContent: 'center',
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
});
