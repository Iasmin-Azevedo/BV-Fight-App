import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserData {
  uid: string;
  nome: string;
  cpf: string;
  numero: string;
  dataNascimento: string;
  genero: string;
  faixa: string;
  email: string;
  tipo: 'aluno' | 'admin';
  criadoEm: Date;
  atualizadoEm?: Date;
  avatar?: string;
}

export class UserService {
  // Lista de emails de administradores
  private static readonly ADMIN_EMAILS = [
    'admin@bvfight.com',
    'professor@bvfight.com',
    'instrutor@bvfight.com'
  ];

  // Verificar se um email é de administrador
  static isAdminEmail(email: string): boolean {
    return this.ADMIN_EMAILS.includes(email.toLowerCase());
  }

  // Buscar dados do usuário pelo UID
  static async getUserData(uid: string): Promise<UserData | null> {
    try {
      console.log('UserService.getUserData: Buscando dados do usuário, UID:', uid);
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      console.log('UserService.getUserData: Documento existe?', userDoc.exists());
      if (userDoc.exists()) {
        const userData = { uid, ...userDoc.data() } as UserData;
        console.log('UserService.getUserData: Dados encontrados:', userData);
        return userData;
      }
      console.log('UserService.getUserData: Documento não encontrado');
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      console.error('Erro detalhado:', error);
      return null;
    }
  }

  // Criar novo usuário
  static async createUser(userData: Omit<UserData, 'uid' | 'criadoEm'>, uid?: string): Promise<boolean> {
    try {
      // Verificar se o email é de admin
      const isAdmin = this.isAdminEmail(userData.email);
      
      // Usar o UID fornecido ou gerar um ID baseado no email como fallback
      const docId = uid || userData.email.replace('@', '').replace('.', '');
      console.log('Criando usuário com ID:', docId);
      
      const userRef = doc(db, 'usuarios', docId);
      await setDoc(userRef, {
        ...userData,
        tipo: isAdmin ? 'admin' : 'aluno', // Define o tipo com base no email
        criadoEm: new Date(),
        atualizadoEm: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return false;
    }
  }

  // Criar usuário com senha (para administradores)
  static async createUserWithPassword(userData: Omit<UserData, 'uid' | 'criadoEm'>, password: string): Promise<boolean> {
    try {
      // Importar createUserWithEmailAndPassword do Firebase Auth
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const uid = userCredential.user.uid;
      
      // Salvar dados adicionais no Firestore
      const success = await this.createUser(userData, uid);
      
      if (success) {
        console.log('Usuário criado com sucesso no Auth e Firestore');
        return true;
      } else {
        // Se falhou ao salvar no Firestore, deletar do Auth
        await userCredential.user.delete();
        return false;
      }
    } catch (error) {
      console.error('Erro ao criar usuário com senha:', error);
      return false;
    }
  }

  // Atualizar dados do usuário
  static async updateUser(uid: string, userData: Partial<UserData>): Promise<boolean> {
    try {
      const userRef = doc(db, 'usuarios', uid);
      await updateDoc(userRef, {
        ...userData,
        atualizadoEm: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  }

  // Buscar usuário por email
  static async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      const q = query(collection(db, 'usuarios'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { uid: doc.id, ...doc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  }

  // Listar todos os usuários (para admin)
  static async getAllUsers(): Promise<UserData[]> {
    try {
      console.log('UserService.getAllUsers: Iniciando busca de todos os usuários...');
      console.log('UserService.getAllUsers: Usuário autenticado:', auth.currentUser?.uid);
      
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      console.log('UserService.getAllUsers: Query executada, documentos encontrados:', querySnapshot.docs.length);
      
      // Log dos documentos encontrados
      querySnapshot.docs.forEach((doc, index) => {
        console.log(`UserService.getAllUsers: Documento ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
      
      const usuarios = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserData[];
      
      console.log('UserService.getAllUsers: Usuários processados:', usuarios.length);
      return usuarios;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      console.error('Erro detalhado:', error);
      return [];
    }
  }

  // Listar apenas alunos
  static async getAlunos(): Promise<UserData[]> {
    try {
      console.log('UserService.getAlunos: Iniciando busca de alunos...');
      console.log('UserService.getAlunos: Usuário autenticado:', auth.currentUser?.uid);
      
      const q = query(collection(db, 'usuarios'), where('tipo', '==', 'aluno'));
      const querySnapshot = await getDocs(q);
      console.log('UserService.getAlunos: Query executada, documentos encontrados:', querySnapshot.docs.length);
      
      // Log dos documentos encontrados
      querySnapshot.docs.forEach((doc, index) => {
        console.log(`UserService.getAlunos: Documento ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
      
      const alunos = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserData[];
      
      console.log('UserService.getAlunos: Alunos processados:', alunos.length);
      return alunos;
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      console.error('Erro detalhado:', error);
      return [];
    }
  }

  // Verificar se usuário é admin
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      console.log('UserService.isAdmin: Verificando se usuário é admin, UID:', uid);
      const userData = await this.getUserData(uid);
      console.log('UserService.isAdmin: Dados do usuário:', userData);
      const isAdmin = userData?.tipo === 'admin';
      console.log('UserService.isAdmin: É admin?', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Erro ao verificar se é admin:', error);
      return false;
    }
  }

  // Atualizar último acesso do usuário
  static async updateLastAccess(uid: string): Promise<boolean> {
    try {
      console.log('Atualizando último acesso para o usuário:', uid);
      const userRef = doc(db, 'usuarios', uid);
      await updateDoc(userRef, {
        ultimoAcesso: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar último acesso:', error);
      return false;
    }
  }

  // Deletar usuário
  static async deleteUser(uid: string): Promise<boolean> {
    try {
      console.log('Deletando usuário:', uid);
      
      // Deletar do Firestore
      const userRef = doc(db, 'usuarios', uid);
      await deleteDoc(userRef);
      
      console.log('Usuário deletado com sucesso do Firestore');
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  }
}