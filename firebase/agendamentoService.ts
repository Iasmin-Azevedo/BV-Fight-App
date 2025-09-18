import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export interface AgendamentoSemanal {
  id?: string;
  nome: string;
  diaSemana: string;
  horarioInicio: string;
  horarioFim: string;
  duracao: number; // em minutos
  categoria: string;
  nivel: string;
  descricao: string;
  maxAlunos: number;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export class AgendamentoService {
  private static readonly COLLECTION = 'agendamentos_semanais';

  // Criar novo agendamento semanal
  static async createAgendamento(agendamento: Omit<AgendamentoSemanal, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<boolean> {
    try {
      console.log('AgendamentoService: Criando agendamento:', agendamento);
      
      const agendamentoData = {
        ...agendamento,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      };

      const docRef = await setDoc(doc(collection(db, this.COLLECTION)), agendamentoData);
      console.log('AgendamentoService: Agendamento criado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return false;
    }
  }

  // Buscar todos os agendamentos
  static async getAllAgendamentos(): Promise<AgendamentoSemanal[]> {
    try {
      console.log('AgendamentoService: Buscando todos os agendamentos');
      
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('diaSemana', 'asc'),
        orderBy('horarioInicio', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const agendamentos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm.toDate(),
        atualizadoEm: doc.data().atualizadoEm.toDate()
      })) as AgendamentoSemanal[];

      console.log('AgendamentoService: Agendamentos encontrados:', agendamentos.length);
      return agendamentos;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
  }

  // Buscar agendamentos ativos
  static async getAgendamentosAtivos(): Promise<AgendamentoSemanal[]> {
    try {
      console.log('AgendamentoService: Buscando agendamentos ativos');
      
      const q = query(
        collection(db, this.COLLECTION),
        where('ativo', '==', true),
        orderBy('diaSemana', 'asc'),
        orderBy('horarioInicio', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const agendamentos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm.toDate(),
        atualizadoEm: doc.data().atualizadoEm.toDate()
      })) as AgendamentoSemanal[];

      console.log('AgendamentoService: Agendamentos ativos encontrados:', agendamentos.length);
      return agendamentos;
    } catch (error) {
      console.error('Erro ao buscar agendamentos ativos:', error);
      return [];
    }
  }

  // Buscar agendamentos por dia da semana
  static async getAgendamentosPorDia(diaSemana: string): Promise<AgendamentoSemanal[]> {
    try {
      console.log('AgendamentoService: Buscando agendamentos para o dia:', diaSemana);
      
      const q = query(
        collection(db, this.COLLECTION),
        where('diaSemana', '==', diaSemana),
        where('ativo', '==', true),
        orderBy('horarioInicio', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const agendamentos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm.toDate(),
        atualizadoEm: doc.data().atualizadoEm.toDate()
      })) as AgendamentoSemanal[];

      console.log('AgendamentoService: Agendamentos do dia encontrados:', agendamentos.length);
      return agendamentos;
    } catch (error) {
      console.error('Erro ao buscar agendamentos por dia:', error);
      return [];
    }
  }

  // Atualizar agendamento
  static async updateAgendamento(id: string, updateData: Partial<AgendamentoSemanal>): Promise<boolean> {
    try {
      console.log('AgendamentoService: Atualizando agendamento:', id);
      
      const agendamentoRef = doc(db, this.COLLECTION, id);
      await updateDoc(agendamentoRef, {
        ...updateData,
        atualizadoEm: new Date()
      });
      
      console.log('AgendamentoService: Agendamento atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return false;
    }
  }

  // Alternar status ativo/inativo
  static async toggleAgendamentoStatus(id: string, ativo: boolean): Promise<boolean> {
    try {
      console.log('AgendamentoService: Alternando status do agendamento:', id, 'para:', ativo);
      
      const agendamentoRef = doc(db, this.COLLECTION, id);
      await updateDoc(agendamentoRef, {
        ativo,
        atualizadoEm: new Date()
      });
      
      console.log('AgendamentoService: Status do agendamento alterado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao alterar status do agendamento:', error);
      return false;
    }
  }

  // Deletar agendamento
  static async deleteAgendamento(id: string): Promise<boolean> {
    try {
      console.log('AgendamentoService: Deletando agendamento:', id);
      
      const agendamentoRef = doc(db, this.COLLECTION, id);
      await deleteDoc(agendamentoRef);
      
      console.log('AgendamentoService: Agendamento deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      return false;
    }
  }

  // Buscar agendamento por ID
  static async getAgendamentoById(id: string): Promise<AgendamentoSemanal | null> {
    try {
      console.log('AgendamentoService: Buscando agendamento por ID:', id);
      
      const agendamentoRef = doc(db, this.COLLECTION, id);
      const agendamentoSnap = await getDoc(agendamentoRef);
      
      if (agendamentoSnap.exists()) {
        const agendamento = {
          id: agendamentoSnap.id,
          ...agendamentoSnap.data(),
          criadoEm: agendamentoSnap.data().criadoEm.toDate(),
          atualizadoEm: agendamentoSnap.data().atualizadoEm.toDate()
        } as AgendamentoSemanal;
        
        console.log('AgendamentoService: Agendamento encontrado');
        return agendamento;
      } else {
        console.log('AgendamentoService: Agendamento não encontrado');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar agendamento por ID:', error);
      return null;
    }
  }

  // Obter estatísticas dos agendamentos
  static async getEstatisticas(): Promise<{
    total: number;
    ativos: number;
    porDia: { [key: string]: number };
  }> {
    try {
      console.log('AgendamentoService: Buscando estatísticas');
      
      const agendamentos = await this.getAllAgendamentos();
      
      const estatisticas = {
        total: agendamentos.length,
        ativos: agendamentos.filter(a => a.ativo).length,
        porDia: agendamentos.reduce((acc, agendamento) => {
          acc[agendamento.diaSemana] = (acc[agendamento.diaSemana] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      };
      
      console.log('AgendamentoService: Estatísticas calculadas:', estatisticas);
      return estatisticas;
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return { total: 0, ativos: 0, porDia: {} };
    }
  }
}
