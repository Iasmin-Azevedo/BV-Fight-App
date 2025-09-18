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

export interface Aluno {
  id?: string;
  nome: string;
  email: string;
  faixa: string;
  nivel: string;
  status: 'ativo' | 'inativo' | 'pendente';
  ultimoAcesso: Timestamp;
  treinosCompletados: number;
  avatar?: string;
  telefone?: string;
  dataNascimento?: Timestamp;
  endereco?: string;
  observacoes?: string;
  dataCadastro: Timestamp;
  dataAtualizacao: Timestamp;
}

export class AlunoService {
  private static readonly COLLECTION = 'alunos';

  // Buscar todos os alunos
  static async getAllAlunos(): Promise<Aluno[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('dataCadastro', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Aluno[];
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      throw error;
    }
  }

  // Buscar aluno por ID
  static async getAlunoById(id: string): Promise<Aluno | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Aluno;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      throw error;
    }
  }

  // Buscar alunos por status
  static async getAlunosByStatus(status: 'ativo' | 'inativo' | 'pendente'): Promise<Aluno[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', status),
        orderBy('dataCadastro', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Aluno[];
    } catch (error) {
      console.error('Erro ao buscar alunos por status:', error);
      throw error;
    }
  }

  // Adicionar novo aluno
  static async addAluno(aluno: Omit<Aluno, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const alunoData = {
        ...aluno,
        dataCadastro: now,
        dataAtualizacao: now
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), alunoData);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      throw error;
    }
  }

  // Atualizar aluno
  static async updateAluno(id: string, aluno: Partial<Aluno>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        ...aluno,
        dataAtualizacao: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  }

  // Deletar aluno
  static async deleteAluno(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      throw error;
    }
  }

  // Atualizar status do aluno
  static async updateAlunoStatus(id: string, status: 'ativo' | 'inativo' | 'pendente'): Promise<void> {
    try {
      await this.updateAluno(id, { status });
    } catch (error) {
      console.error('Erro ao atualizar status do aluno:', error);
      throw error;
    }
  }

  // Incrementar treinos completados
  static async incrementTreinosCompletados(id: string): Promise<void> {
    try {
      const aluno = await this.getAlunoById(id);
      if (aluno) {
        await this.updateAluno(id, {
          treinosCompletados: aluno.treinosCompletados + 1
        });
      }
    } catch (error) {
      console.error('Erro ao incrementar treinos completados:', error);
      throw error;
    }
  }

  // Buscar alunos por nome ou email
  static async searchAlunos(searchTerm: string): Promise<Aluno[]> {
    try {
      const alunos = await this.getAllAlunos();
      return alunos.filter(aluno =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      throw error;
    }
  }
}
