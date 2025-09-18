import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { AlunoService } from './alunoService';
import { db } from './firebase';

export interface CheckIn {
  id: string;
  alunoId: string;
  alunoNome: string;
  data: Date;
  presente: boolean;
  observacoes?: string;
}

export interface CheckInStats {
  totalAulas: number;
  aulasPresente: number;
  percentualPresenca: number;
  ultimaPresenca?: Date;
}

export class CheckInService {
  // Obter nome do aluno do banco de dados
  static async obterNomeAluno(alunoId: string): Promise<string> {
    try {
      const aluno = await AlunoService.getAlunoById(alunoId);
      return aluno?.nome || 'Aluno';
    } catch (error) {
      console.error('Erro ao obter nome do aluno:', error);
      return 'Aluno';
    }
  }

  // Registrar check-in de um aluno
  static async registrarCheckIn(alunoId: string, presente: boolean, observacoes?: string): Promise<boolean> {
    try {
      console.log('CheckInService: Registrando check-in para aluno:', alunoId, 'Presente:', presente);
      
      // Obter nome do aluno do banco de dados
      const alunoNome = await this.obterNomeAluno(alunoId);
      
      const checkInRef = doc(collection(db, 'checkins'));
      const dadosCheckIn = {
        alunoId,
        alunoNome,
        data: Timestamp.now(),
        presente,
        observacoes: observacoes || '',
        criadoEm: Timestamp.now()
      };
      
      console.log('CheckInService: Dados do check-in:', dadosCheckIn);
      
      await setDoc(checkInRef, dadosCheckIn);
      
      console.log('CheckInService: Check-in registrado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao registrar check-in:', error);
      return false;
    }
  }

  // Buscar check-ins de um aluno específico
  static async getCheckInsAluno(alunoId: string): Promise<CheckIn[]> {
    try {
      console.log('CheckInService: Buscando check-ins para aluno:', alunoId);
      
      // Primeiro buscar sem orderBy para evitar necessidade de índice composto
      const q = query(
        collection(db, 'checkins'),
        where('alunoId', '==', alunoId)
      );
      const querySnapshot = await getDocs(q);
      
      console.log('CheckInService: Query executada, documentos encontrados:', querySnapshot.docs.length);
      
      const checkIns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate()
      })) as CheckIn[];
      
      // Ordenar por data no cliente para evitar necessidade de índice composto
      checkIns.sort((a, b) => b.data.getTime() - a.data.getTime());
      
      console.log('CheckInService: Check-ins processados:', checkIns.length);
      return checkIns;
    } catch (error) {
      console.error('Erro ao buscar check-ins do aluno:', error);
      return [];
    }
  }

  // Buscar todos os check-ins do dia atual
  static async getCheckInsHoje(): Promise<CheckIn[]> {
    try {
      console.log('CheckInService.getCheckInsHoje: Iniciando busca de check-ins de hoje...');
      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

      const q = query(
        collection(db, 'checkins'),
        where('data', '>=', Timestamp.fromDate(inicioDia)),
        where('data', '<', Timestamp.fromDate(fimDia)),
        orderBy('data', 'desc')
      );
      const querySnapshot = await getDocs(q);
      console.log('CheckInService.getCheckInsHoje: Query executada, documentos encontrados:', querySnapshot.docs.length);
      
      const checkIns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate()
      })) as CheckIn[];
      
      console.log('CheckInService.getCheckInsHoje: Check-ins processados:', checkIns.length);
      return checkIns;
    } catch (error) {
      console.error('Erro ao buscar check-ins de hoje:', error);
      return [];
    }
  }

  // Calcular estatísticas de presença de um aluno
  static async getStatsAluno(alunoId: string): Promise<CheckInStats> {
    try {
      console.log('CheckInService: Calculando stats para aluno:', alunoId);
      
      const checkIns = await this.getCheckInsAluno(alunoId);
      console.log('CheckInService: Check-ins encontrados:', checkIns.length);
      
      const totalAulas = checkIns.length;
      const aulasPresente = checkIns.filter(checkIn => checkIn.presente).length;
      const percentualPresenca = totalAulas > 0 ? (aulasPresente / totalAulas) * 100 : 0;
      
      const ultimaPresenca = checkIns.find(checkIn => checkIn.presente)?.data;

      const stats = {
        totalAulas,
        aulasPresente,
        percentualPresenca: Math.round(percentualPresenca),
        ultimaPresenca
      };
      
      console.log('CheckInService: Stats calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('Erro ao calcular stats do aluno:', error);
      return {
        totalAulas: 0,
        aulasPresente: 0,
        percentualPresenca: 0
      };
    }
  }

  // Verificar se aluno já fez check-in hoje
  static async jaCheckInHoje(alunoId: string): Promise<boolean> {
    try {
      const checkInsHoje = await this.getCheckInsHoje();
      return checkInsHoje.some(checkIn => checkIn.alunoId === alunoId);
    } catch (error) {
      console.error('Erro ao verificar check-in de hoje:', error);
      return false;
    }
  }

  // Buscar histórico de check-ins de um aluno com limite
  static async getHistoricoCheckIns(alunoId: string, limite: number = 10): Promise<CheckIn[]> {
    try {
      console.log('CheckInService: Buscando histórico para aluno:', alunoId, 'Limite:', limite);
      
      // Primeiro buscar sem orderBy para evitar necessidade de índice composto
      const q = query(
        collection(db, 'checkins'),
        where('alunoId', '==', alunoId)
      );
      const querySnapshot = await getDocs(q);
      
      const checkIns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate()
      })) as CheckIn[];
      
      // Ordenar por data no cliente e aplicar limite
      const checkInsOrdenados = checkIns
        .sort((a, b) => b.data.getTime() - a.data.getTime())
        .slice(0, limite);
      
      console.log('CheckInService: Histórico encontrado:', checkInsOrdenados.length, 'registros');
      return checkInsOrdenados;
    } catch (error) {
      console.error('Erro ao buscar histórico de check-ins:', error);
      return [];
    }
  }

  // Buscar check-ins de um período específico
  static async getCheckInsPeriodo(alunoId: string, dataInicio: Date, dataFim: Date): Promise<CheckIn[]> {
    try {
      console.log('CheckInService: Buscando check-ins do período:', dataInicio, 'até', dataFim);
      
      // Primeiro buscar por alunoId e depois filtrar por data no cliente para evitar índices complexos
      const q = query(
        collection(db, 'checkins'),
        where('alunoId', '==', alunoId)
      );
      const querySnapshot = await getDocs(q);
      
      const checkIns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate()
      })) as CheckIn[];
      
      // Filtrar por período e ordenar no cliente
      const checkInsFiltrados = checkIns
        .filter(checkIn => {
          const dataCheckIn = checkIn.data;
          return dataCheckIn >= dataInicio && dataCheckIn <= dataFim;
        })
        .sort((a, b) => b.data.getTime() - a.data.getTime());
      
      console.log('CheckInService: Check-ins do período encontrados:', checkInsFiltrados.length);
      return checkInsFiltrados;
    } catch (error) {
      console.error('Erro ao buscar check-ins do período:', error);
      return [];
    }
  }

  // Resetar check-ins de um aluno (apenas para administrador)
  static async resetarCheckInsAluno(alunoId: string): Promise<boolean> {
    try {
      console.log('CheckInService: Resetando check-ins para aluno:', alunoId);
      
      // Buscar todos os check-ins do aluno
      const checkIns = await this.getCheckInsAluno(alunoId);
      
      // Deletar todos os check-ins
      for (const checkIn of checkIns) {
        await deleteDoc(doc(db, 'checkins', checkIn.id));
      }
      
      console.log('CheckInService: Check-ins resetados com sucesso:', checkIns.length, 'registros deletados');
      return true;
    } catch (error) {
      console.error('Erro ao resetar check-ins do aluno:', error);
      return false;
    }
  }

  // Editar check-in existente (apenas para administrador)
  static async editarCheckIn(checkInId: string, dadosAtualizados: Partial<CheckIn>): Promise<boolean> {
    try {
      console.log('CheckInService: Editando check-in:', checkInId, 'Dados:', dadosAtualizados);
      
      const checkInRef = doc(db, 'checkins', checkInId);
      const dadosParaAtualizar = {
        ...dadosAtualizados,
        atualizadoEm: Timestamp.now()
      };
      
      // Remover campos que não devem ser atualizados
      delete dadosParaAtualizar.id;
      delete dadosParaAtualizar.data;
      
      await updateDoc(checkInRef, dadosParaAtualizar);
      
      console.log('CheckInService: Check-in editado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao editar check-in:', error);
      return false;
    }
  }

  // Deletar check-in específico (apenas para administrador)
  static async deletarCheckIn(checkInId: string): Promise<boolean> {
    try {
      console.log('CheckInService: Deletando check-in:', checkInId);
      
      await deleteDoc(doc(db, 'checkins', checkInId));
      
      console.log('CheckInService: Check-in deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar check-in:', error);
      return false;
    }
  }

  // Buscar check-in por ID
  static async getCheckInById(checkInId: string): Promise<CheckIn | null> {
    try {
      const checkInDoc = await getDoc(doc(db, 'checkins', checkInId));
      
      if (checkInDoc.exists()) {
        return {
          id: checkInDoc.id,
          ...checkInDoc.data(),
          data: checkInDoc.data().data.toDate()
        } as CheckIn;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar check-in por ID:', error);
      return null;
    }
  }
}
