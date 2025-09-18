import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './firebase';

export interface Tecnica {
  id?: string;
  nome: string;
  categoria: string;
  posicao: string;
  nivel: string;
  descricao: string;
  videoUrl?: string;
  thumbnail?: string;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  dataCriacao: Timestamp;
  dataAtualizacao: Timestamp;
}

export class TecnicaService {
  private static readonly COLLECTION = 'tecnicas';

  // Buscar todas as técnicas
  static async getAllTecnicas(): Promise<Tecnica[]> {
    try {
      console.log('TecnicaService.getAllTecnicas: Iniciando busca de técnicas...');
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('dataCriacao', 'desc')
      );
      const querySnapshot = await getDocs(q);
      console.log('TecnicaService.getAllTecnicas: Query executada, documentos encontrados:', querySnapshot.docs.length);
      
      const tecnicas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tecnica[];
      
      console.log('TecnicaService.getAllTecnicas: Técnicas processadas:', tecnicas.length);
      return tecnicas;
    } catch (error) {
      console.error('Erro ao buscar técnicas:', error);
      throw error;
    }
  }

  // Buscar técnica por ID
  static async getTecnicaById(id: string): Promise<Tecnica | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Tecnica;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar técnica:', error);
      throw error;
    }
  }

  // Buscar técnicas por categoria
  static async getTecnicasByCategoria(categoria: string): Promise<Tecnica[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('categoria', '==', categoria),
        orderBy('dataCriacao', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tecnica[];
    } catch (error) {
      console.error('Erro ao buscar técnicas por categoria:', error);
      throw error;
    }
  }

  // Buscar técnicas por nível
  static async getTecnicasByNivel(nivel: string): Promise<Tecnica[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('nivel', '==', nivel),
        orderBy('dataCriacao', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tecnica[];
    } catch (error) {
      console.error('Erro ao buscar técnicas por nível:', error);
      throw error;
    }
  }

  // Buscar técnicas por status
  static async getTecnicasByStatus(status: 'ativo' | 'inativo'): Promise<Tecnica[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', status),
        orderBy('dataCriacao', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tecnica[];
    } catch (error) {
      console.error('Erro ao buscar técnicas por status:', error);
      throw error;
    }
  }

  // Adicionar nova técnica
  static async addTecnica(tecnica: Omit<Tecnica, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const tecnicaData = {
        ...tecnica,
        dataCriacao: now,
        dataAtualizacao: now
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), tecnicaData);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar técnica:', error);
      throw error;
    }
  }

  // Atualizar técnica
  static async updateTecnica(id: string, tecnica: Partial<Tecnica>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        ...tecnica,
        dataAtualizacao: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar técnica:', error);
      throw error;
    }
  }

  // Deletar técnica
  static async deleteTecnica(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar técnica:', error);
      throw error;
    }
  }

  // Atualizar status da técnica
  static async updateTecnicaStatus(id: string, status: 'ativo' | 'inativo'): Promise<void> {
    try {
      await this.updateTecnica(id, { status });
    } catch (error) {
      console.error('Erro ao atualizar status da técnica:', error);
      throw error;
    }
  }

  // Buscar técnicas por nome ou descrição
  static async searchTecnicas(searchTerm: string): Promise<Tecnica[]> {
    try {
      const tecnicas = await this.getAllTecnicas();
      return tecnicas.filter(tecnica =>
        tecnica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tecnica.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tecnica.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tecnica.posicao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Erro ao buscar técnicas:', error);
      throw error;
    }
  }

  // Buscar técnicas ativas para alunos
  static async getTecnicasAtivas(): Promise<Tecnica[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', 'ativo'),
        orderBy('dataCriacao', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const tecnicas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tecnica[];
      
      // Ordenar por categoria e nome no cliente para evitar necessidade de índice composto
      return tecnicas.sort((a, b) => {
        if (a.categoria !== b.categoria) {
          return a.categoria.localeCompare(b.categoria);
        }
        return a.nome.localeCompare(b.nome);
      });
    } catch (error) {
      console.error('Erro ao buscar técnicas ativas:', error);
      throw error;
    }
  }

  // Buscar categorias únicas
  static async getCategorias(): Promise<string[]> {
    try {
      const tecnicas = await this.getAllTecnicas();
      const categorias = [...new Set(tecnicas.map(t => t.categoria))];
      return categorias.sort();
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  // Buscar níveis únicos
  static async getNiveis(): Promise<string[]> {
    try {
      const tecnicas = await this.getAllTecnicas();
      const niveis = [...new Set(tecnicas.map(t => t.nivel))];
      return niveis.sort();
    } catch (error) {
      console.error('Erro ao buscar níveis:', error);
      throw error;
    }
  }
}
