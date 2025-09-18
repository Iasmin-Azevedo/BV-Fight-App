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

export interface Treino {
  id?: string;
  nome: string;
  categoria: string;
  duracao: string;
  nivel: string;
  tecnicas: string[]; // IDs das técnicas
  status: 'ativo' | 'inativo';
  alunosAtivos: number;
  descricao?: string;
  observacoes?: string;
  dataCriacao: Timestamp;
  dataAtualizacao: Timestamp;
}

export interface TecnicaTreino {
  id: string;
  nome: string;
  categoria: string;
  posicao: string;
  nivel: string;
  descricao: string;
  videoUrl?: string;
  thumbnail?: string;
  ordem: number;
}

export class TreinoService {
  private static readonly COLLECTION = 'treinos';

  // Buscar todos os treinos
  static async getAllTreinos(): Promise<Treino[]> {
    try {
      console.log('TreinoService.getAllTreinos: Iniciando busca de treinos...');
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('dataCriacao', 'desc')
      );
      const querySnapshot = await getDocs(q);
      console.log('TreinoService.getAllTreinos: Query executada, documentos encontrados:', querySnapshot.docs.length);
      
      const treinos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Treino[];
      
      console.log('TreinoService.getAllTreinos: Treinos processados:', treinos.length);
      return treinos;
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      throw error;
    }
  }

  // Buscar treino por ID
  static async getTreinoById(id: string): Promise<Treino | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Treino;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      throw error;
    }
  }

  // Buscar treinos por status
  static async getTreinosByStatus(status: 'ativo' | 'inativo'): Promise<Treino[]> {
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
      })) as Treino[];
    } catch (error) {
      console.error('Erro ao buscar treinos por status:', error);
      throw error;
    }
  }

  // Buscar treinos por categoria
  static async getTreinosByCategoria(categoria: string): Promise<Treino[]> {
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
      })) as Treino[];
    } catch (error) {
      console.error('Erro ao buscar treinos por categoria:', error);
      throw error;
    }
  }

  // Adicionar novo treino
  static async addTreino(treino: Omit<Treino, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const treinoData = {
        ...treino,
        dataCriacao: now,
        dataAtualizacao: now
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), treinoData);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar treino:', error);
      throw error;
    }
  }

  // Atualizar treino
  static async updateTreino(id: string, treino: Partial<Treino>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        ...treino,
        dataAtualizacao: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      throw error;
    }
  }

  // Deletar treino
  static async deleteTreino(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar treino:', error);
      throw error;
    }
  }

  // Atualizar status do treino
  static async updateTreinoStatus(id: string, status: 'ativo' | 'inativo'): Promise<void> {
    try {
      await this.updateTreino(id, { status });
    } catch (error) {
      console.error('Erro ao atualizar status do treino:', error);
      throw error;
    }
  }

  // Adicionar técnica ao treino
  static async addTecnicaToTreino(treinoId: string, tecnicaId: string): Promise<void> {
    try {
      const treino = await this.getTreinoById(treinoId);
      if (treino) {
        const tecnicas = [...(treino.tecnicas || []), tecnicaId];
        await this.updateTreino(treinoId, { tecnicas });
      }
    } catch (error) {
      console.error('Erro ao adicionar técnica ao treino:', error);
      throw error;
    }
  }

  // Remover técnica do treino
  static async removeTecnicaFromTreino(treinoId: string, tecnicaId: string): Promise<void> {
    try {
      const treino = await this.getTreinoById(treinoId);
      if (treino) {
        const tecnicas = treino.tecnicas?.filter(id => id !== tecnicaId) || [];
        await this.updateTreino(treinoId, { tecnicas });
      }
    } catch (error) {
      console.error('Erro ao remover técnica do treino:', error);
      throw error;
    }
  }

  // Buscar treinos por nome ou categoria
  static async searchTreinos(searchTerm: string): Promise<Treino[]> {
    try {
      const treinos = await this.getAllTreinos();
      return treinos.filter(treino =>
        treino.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treino.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treino.nivel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      throw error;
    }
  }

  // Incrementar alunos ativos
  static async incrementAlunosAtivos(id: string): Promise<void> {
    try {
      const treino = await this.getTreinoById(id);
      if (treino) {
        await this.updateTreino(id, {
          alunosAtivos: treino.alunosAtivos + 1
        });
      }
    } catch (error) {
      console.error('Erro ao incrementar alunos ativos:', error);
      throw error;
    }
  }

  // Decrementar alunos ativos
  static async decrementAlunosAtivos(id: string): Promise<void> {
    try {
      const treino = await this.getTreinoById(id);
      if (treino) {
        const novosAlunosAtivos = Math.max(0, treino.alunosAtivos - 1);
        await this.updateTreino(id, {
          alunosAtivos: novosAlunosAtivos
        });
      }
    } catch (error) {
      console.error('Erro ao decrementar alunos ativos:', error);
      throw error;
    }
  }
}
