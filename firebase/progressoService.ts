import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp } from 'firebase/firestore';
import { CheckInService } from './checkinService';
import { db } from './firebase';

export interface ProgressoFaixa {
  id: string;
  alunoId: string;
  alunoNome: string;
  faixaAtual: string;
  aulasPresente: number;
  aulasNecessarias: number;
  percentualCompleto: number;
  proximaFaixa?: string;
  dataUltimaAtualizacao: Date;
}

export interface EstatisticasProgresso {
  faixaAtual: string;
  aulasPresente: number;
  aulasNecessarias: number;
  percentualCompleto: number;
  proximaFaixa?: string;
  tempoNaFaixaAtual: number; // em dias
  ultimaPresenca?: Date;
}

// Sistema de faixas por aulas
const SISTEMA_FAIXAS = {
  'Branca': 10,
  'Amarela': 30,
  'Laranja': 60,
  'Verde': 90,
  'Azul': 120,
  'Roxa': 150,
  'Marrom': 200,
  'Preta': 250,
  'Coral': 300,
  'Vermelha': 350
};

const ORDEM_FAIXAS = ['Branca', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta', 'Coral', 'Vermelha'];

export class ProgressoService {
  // Atualizar progresso de faixa baseado nas aulas presentes
  static async atualizarProgressoFaixa(alunoId: string, alunoNome: string): Promise<boolean> {
    try {
      console.log('ProgressoService: Iniciando atualização para aluno:', alunoId);
      
      const stats = await CheckInService.getStatsAluno(alunoId);
      console.log('ProgressoService: Stats do aluno:', stats);
      
      const aulasPresente = stats.aulasPresente;
      console.log('ProgressoService: Aulas presentes:', aulasPresente);
      
      // Determinar faixa atual baseada nas aulas
      let faixaAtual = 'Branca';
      let aulasNecessarias = SISTEMA_FAIXAS['Branca'];
      
      // Percorrer as faixas na ordem correta
      for (const faixa of ORDEM_FAIXAS) {
        const aulasNecessariasFaixa = SISTEMA_FAIXAS[faixa as keyof typeof SISTEMA_FAIXAS];
        if (aulasPresente >= aulasNecessariasFaixa) {
          faixaAtual = faixa;
          aulasNecessarias = aulasNecessariasFaixa;
        } else {
          break;
        }
      }
      
      console.log('ProgressoService: Faixa atual calculada:', faixaAtual, 'Aulas necessárias:', aulasNecessarias);
      
      // Determinar próxima faixa
      const indiceAtual = ORDEM_FAIXAS.indexOf(faixaAtual);
      const proximaFaixa = indiceAtual < ORDEM_FAIXAS.length - 1 ? ORDEM_FAIXAS[indiceAtual + 1] : undefined;
      
      const percentualCompleto = aulasNecessarias > 0 ? (aulasPresente / aulasNecessarias) * 100 : 0;
      
      console.log('ProgressoService: Percentual completo:', percentualCompleto);
      
      // Salvar ou atualizar progresso
      const progressoRef = doc(db, 'progresso_faixas', alunoId);
      const dadosProgresso = {
        alunoId,
        alunoNome,
        faixaAtual,
        aulasPresente,
        aulasNecessarias,
        percentualCompleto: Math.round(percentualCompleto),
        proximaFaixa,
        dataUltimaAtualizacao: Timestamp.now(),
        atualizadoEm: Timestamp.now()
      };
      
      console.log('ProgressoService: Salvando dados:', dadosProgresso);
      
      await setDoc(progressoRef, dadosProgresso);
      
      console.log('ProgressoService: Progresso salvo com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar progresso de faixa:', error);
      return false;
    }
  }

  // Buscar progresso de faixa de um aluno
  static async getProgressoFaixaAluno(alunoId: string): Promise<ProgressoFaixa | null> {
    try {
      const progressoDoc = await getDoc(doc(db, 'progresso_faixas', alunoId));
      
      if (!progressoDoc.exists()) {
        // Se não existe, criar com dados básicos
        await this.atualizarProgressoFaixa(alunoId, 'Aluno');
        const novoDoc = await getDoc(doc(db, 'progresso_faixas', alunoId));
        if (novoDoc.exists()) {
          return {
            id: novoDoc.id,
            ...novoDoc.data(),
            dataUltimaAtualizacao: novoDoc.data().dataUltimaAtualizacao.toDate()
          } as ProgressoFaixa;
        }
        return null;
      }
      
      return {
        id: progressoDoc.id,
        ...progressoDoc.data(),
        dataUltimaAtualizacao: progressoDoc.data().dataUltimaAtualizacao.toDate()
      } as ProgressoFaixa;
    } catch (error) {
      console.error('Erro ao buscar progresso de faixa:', error);
      return null;
    }
  }

  // Buscar estatísticas completas de um aluno
  static async getEstatisticasAluno(alunoId: string): Promise<EstatisticasProgresso> {
    try {
      const progressoFaixa = await this.getProgressoFaixaAluno(alunoId);
      const statsCheckIn = await CheckInService.getStatsAluno(alunoId);
      
      if (!progressoFaixa) {
        return {
          faixaAtual: 'Branca',
          aulasPresente: 0,
          aulasNecessarias: SISTEMA_FAIXAS['Branca'],
          percentualCompleto: 0,
          proximaFaixa: 'Amarela',
          tempoNaFaixaAtual: 0,
          ultimaPresenca: statsCheckIn.ultimaPresenca
        };
      }
      
      // Calcular tempo na faixa atual (aproximado)
      const tempoNaFaixaAtual = Math.floor((Date.now() - progressoFaixa.dataUltimaAtualizacao.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        faixaAtual: progressoFaixa.faixaAtual,
        aulasPresente: progressoFaixa.aulasPresente,
        aulasNecessarias: progressoFaixa.aulasNecessarias,
        percentualCompleto: progressoFaixa.percentualCompleto,
        proximaFaixa: progressoFaixa.proximaFaixa,
        tempoNaFaixaAtual,
        ultimaPresenca: statsCheckIn.ultimaPresenca
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        faixaAtual: 'Branca',
        aulasPresente: 0,
        aulasNecessarias: SISTEMA_FAIXAS['Branca'],
        percentualCompleto: 0,
        proximaFaixa: 'Amarela',
        tempoNaFaixaAtual: 0
      };
    }
  }

  // Listar todos os progressos de faixas (para admin)
  static async getAllProgressosFaixas(): Promise<ProgressoFaixa[]> {
    try {
      const q = query(collection(db, 'progresso_faixas'), orderBy('aulasPresente', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataUltimaAtualizacao: doc.data().dataUltimaAtualizacao.toDate()
      })) as ProgressoFaixa[];
    } catch (error) {
      console.error('Erro ao listar progressos de faixas:', error);
      return [];
    }
  }

  // Obter informações do sistema de faixas
  static getSistemaFaixas() {
    return {
      faixas: SISTEMA_FAIXAS,
      ordem: ORDEM_FAIXAS
    };
  }

  // Calcular aulas necessárias para próxima faixa
  static calcularAulasParaProximaFaixa(faixaAtual: string, aulasPresente: number): number {
    const indiceAtual = ORDEM_FAIXAS.indexOf(faixaAtual);
    if (indiceAtual >= ORDEM_FAIXAS.length - 1) return 0; // Já na última faixa
    
    const proximaFaixa = ORDEM_FAIXAS[indiceAtual + 1];
    const aulasNecessarias = SISTEMA_FAIXAS[proximaFaixa as keyof typeof SISTEMA_FAIXAS];
    
    return Math.max(0, aulasNecessarias - aulasPresente);
  }
}